const test = require('node:test');
const assert = require('node:assert/strict');

process.env.JWT_SECRET = 'test-secret';

const { sameUserParam, sameUserQuery, bodyOwner, createOwnsRow } = require('../middlewares/ownership');
const { jwtSecret } = require('../config/secrets');

function run(middleware, req) {
    return new Promise((resolve) => {
        const res = {
            statusCode: 200,
            status(code) { this.statusCode = code; return this; },
            json() { resolve({ passed: false, status: this.statusCode, req }); return this; },
        };
        Promise.resolve(middleware(req, res, () => resolve({ passed: true, req }))).catch(() => {});
    });
}

const me = { id: 4 };

test('a user can only open their own /users/:userId routes', async () => {
    assert.equal((await run(sameUserParam(), { user: me, params: { userId: '4' } })).passed, true);
    assert.equal((await run(sameUserParam(), { user: me, params: { userId: '5' } })).status, 403);
});

test('listing tasks must name the caller', async () => {
    assert.equal((await run(sameUserQuery(), { user: me, query: { user_id: '4' } })).passed, true);
    assert.equal((await run(sameUserQuery(), { user: me, query: { user_id: '5' } })).status, 403);
    // Without a user_id the old code returned every user's tasks.
    assert.equal((await run(sameUserQuery(), { user: me, query: {} })).status, 403);
});

test('new rows always belong to the caller', async () => {
    const created = await run(bodyOwner, { user: me, method: 'POST', body: { title: 'x' } });
    assert.equal(created.passed, true);
    assert.equal(created.req.body.user_id, 4);

    const own = await run(bodyOwner, { user: me, method: 'POST', body: { user_id: '4', title: 'x' } });
    assert.equal(own.req.body.user_id, 4);

    assert.equal((await run(bodyOwner, { user: me, method: 'POST', body: { user_id: 5 } })).status, 403);
});

test('an update can\'t hand a row to someone else', async () => {
    assert.equal((await run(bodyOwner, { user: me, method: 'PUT', body: { user_id: 5, title: 'x' } })).status, 403);
    const untouched = await run(bodyOwner, { user: me, method: 'PATCH', body: { completed: true } });
    assert.equal(untouched.passed, true);
    assert.equal('user_id' in untouched.req.body, false);
});

test('a row is only reachable by its owner, and missing rows are 404', async () => {
    const rows = { 1: { user_id: 4 }, 2: { user_id: 5 } };
    let lastSql = '';
    const fakeDb = {
        execute: async (sql, [id]) => {
            lastSql = sql;
            return [rows[id] ? [rows[id]] : []];
        },
    };
    const ownsRow = createOwnsRow(() => fakeDb);
    const check = ownsRow('tasks');
    assert.equal((await run(check, { user: me, params: { id: '1' } })).passed, true);
    assert.equal((await run(check, { user: me, params: { id: '2' } })).status, 403);
    assert.equal((await run(check, { user: me, params: { id: '3' } })).status, 404);
    assert.match(lastSql, /FROM tasks WHERE id = \?/);
    assert.throws(() => ownsRow('users; DROP TABLE tasks'), /unknown table/);
});

test('a database error during the check fails closed', async () => {
    const ownsRow = createOwnsRow(() => ({ execute: async () => { throw new Error('down'); } }));
    assert.equal((await run(ownsRow('categories'), { user: me, params: { id: '1' } })).status, 500);
});

test('there is no fallback login secret', () => {
    assert.equal(jwtSecret(), 'test-secret');
    const saved = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    try {
        assert.throws(() => jwtSecret(), /JWT_SECRET is not set/);
    } finally {
        process.env.JWT_SECRET = saved;
    }
});
