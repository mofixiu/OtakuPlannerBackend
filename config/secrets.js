require('dotenv').config();

/**
 * The secret that signs and checks login tokens. There is deliberately no
 * fallback: a default in a public repo would let anyone forge a login.
 */
function jwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not set. Add it to .env (see .env.example).');
    }
    return secret;
}

module.exports = { jwtSecret };
