const jwt = require('jsonwebtoken');

/** Lets a request through only with a valid login token, and records who sent it. */
module.exports = function requireUser(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
        return res.status(401).json({ status: 'error', message: 'Please log in again.' });
    }
    try {
        // Read at request time, and the same way userLogin signs tokens.
        const secret = process.env.JWT_SECRET || 'your-secret-key';
        const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });
        if (!payload?.userId) throw new Error('Token has no user');
        req.user = { id: payload.userId, username: payload.username };
        return next();
    } catch (_) {
        return res.status(401).json({ status: 'error', message: 'Please log in again.' });
    }
};
