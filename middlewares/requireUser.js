const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/secrets');

/** Lets a request through only with a valid login token, and records who sent it. */
module.exports = function requireUser(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
        return res.status(401).json({ status: 'error', message: 'Please log in again.' });
    }
    try {
        const payload = jwt.verify(token, jwtSecret(), { algorithms: ['HS256'] });
        if (!payload?.userId) throw new Error('Token has no user');
        req.user = { id: payload.userId, username: payload.username };
        return next();
    } catch (_) {
        return res.status(401).json({ status: 'error', message: 'Please log in again.' });
    }
};
