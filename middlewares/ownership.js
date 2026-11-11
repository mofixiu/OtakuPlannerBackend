// Makes sure a logged-in user only reads and changes their own data.
// Use after requireUser, which puts the token's user on req.user.

const OWNED_TABLES = new Set(['tasks', 'categories', 'recurring_tasks']);

function forbidden(res) {
    return res.status(403).json({ status: 'error', message: "You can't access that." });
}

const same = (a, b) => String(a) === String(b);

/** For routes like /users/:userId/tasks: the id in the path must be the caller's. */
function sameUserParam(param = 'userId') {
    return (req, res, next) => (same(req.params[param], req.user.id) ? next() : forbidden(res));
}

/** For routes like GET /tasks?user_id=: the query must name the caller. */
function sameUserQuery(key = 'user_id') {
    return (req, res, next) => (same(req.query?.[key], req.user.id) ? next() : forbidden(res));
}

/**
 * For creates and updates: a user_id in the body must be the caller's, and is
 * then set to it, so nothing can be created for, or moved to, someone else.
 */
function bodyOwner(req, res, next) {
    if (!req.body || typeof req.body !== 'object') req.body = {};
    if (req.body.user_id !== undefined && req.body.user_id !== null && !same(req.body.user_id, req.user.id)) {
        return forbidden(res);
    }
    if (req.method === 'POST' || req.body.user_id !== undefined) {
        req.body.user_id = req.user.id;
    }
    return next();
}

/** For routes like /tasks/:id: the row must exist and belong to the caller. */
function createOwnsRow(getDb = () => require('../models/Connection')) {
    return function ownsRow(table, param = 'id') {
        if (!OWNED_TABLES.has(table)) throw new Error(`ownsRow: unknown table ${table}`);
        return async (req, res, next) => {
            try {
                const [rows] = await getDb().execute(`SELECT user_id FROM ${table} WHERE id = ?`, [req.params[param]]);
                if (!rows.length) {
                    return res.status(404).json({ status: 'error', message: 'Not found.' });
                }
                return same(rows[0].user_id, req.user.id) ? next() : forbidden(res);
            } catch (error) {
                console.error('Ownership check failed:', error.message);
                return res.status(500).json({ status: 'error', message: 'Something went wrong. Try again.' });
            }
        };
    };
}

module.exports = {
    sameUserParam,
    sameUserQuery,
    bodyOwner,
    createOwnsRow,
    ownsRow: createOwnsRow(),
};
