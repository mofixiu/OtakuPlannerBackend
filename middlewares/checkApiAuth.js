const {expressjwt: jwt} = require('express-jwt');
const JWT_SECRET  = process.env?.JWT_SECRET || "don't share this secret with anyone";

const authenticate = (req, res, next) => {
    if (!req.auth?.admin){
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
}

module.exports = [jwt({ secret: JWT_SECRET, algorithms: ['HS256'] }), authenticate];