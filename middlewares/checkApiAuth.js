const {expressjwt: jwt} = require('express-jwt');
const { jwtSecret } = require('../config/secrets');

const authenticate = (req, res, next) => {
    if (!req.auth?.admin){
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
}

module.exports = [jwt({ secret: () => jwtSecret(), algorithms: ['HS256'] }), authenticate];