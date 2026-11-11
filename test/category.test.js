const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

// Stand in for the Category model so no database is needed.
const calls = [];
let insertError = null;
let existing = null;
const modelPath = path.resolve(__dirname, '../models/Category.js');
require.cache[modelPath] = {
    id: modelPath,
    filename: modelPath,
    loaded: true,
    exports: {
        findByUserAndName: async (userId, name) => {
            calls.push(['find', userId, name]);
            return existing;
        },
        fill: (data) => ({
            ...data,
            insert: async () => {
                calls.push(['insert', data.user_id, data.name]);
                if (insertError) throw insertError;
            },
        }),
    },
};

const { storeCategory } = require('../controllers/api/categoryController');

async function store(body) {
    const res = {
        statusCode: 200,
        body: null,
        status(code) { this.statusCode = code; return this; },
        json(payload) { this.body = payload; return this; },
    };
    await storeCategory({ body }, res);
    return res;
}

test('a name is trimmed before checking and saving', async () => {
    calls.length = 0; existing = null; insertError = null;
    const res = await store({ user_id: 4, name: '  Study  ' });
    assert.equal(res.statusCode, 200);
    assert.deepEqual(calls, [['find', 4, 'Study'], ['insert', 4, 'Study']]);
});

test('a blank or overly long name is refused, not crashed on', async () => {
    for (const name of [undefined, '', '   ', 'x'.repeat(101), 42]) {
        calls.length = 0;
        const res = await store({ user_id: 4, name });
        assert.equal(res.statusCode, 400, String(name));
        assert.equal(calls.length, 0);
    }
});

test('a duplicate for the same user is a clear 400, even in a race', async () => {
    existing = { id: 1 };
    assert.equal((await store({ user_id: 4, name: 'Study' })).statusCode, 400);

    existing = null;
    insertError = Object.assign(new Error('Duplicate entry'), { code: 'ER_DUP_ENTRY' });
    const res = await store({ user_id: 4, name: 'Study' });
    assert.equal(res.statusCode, 400);
    assert.match(res.body.message, /already exists/);
    insertError = null;
});
