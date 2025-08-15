const {body} = require('express-validator');
const checkValidation = require('../middlewares/checkValidation');

const userValidator = [
    body('fullName').trim().escape().isAlpha('en-US').withMessage('Only alphabet can be filled here'),
    body('email').isEmail().withMessage('Invalid email format').normalizeEmail({gmail_remove_dots:true}),
    body('dob').isBefore(),
    body('gender').isIn(["Male", "Female", "male", "female", "MALE", "FEMALE"]),
    checkValidation
]

module.exports = userValidator;