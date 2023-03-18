const { check, validationResult } = require('express-validator');

exports.userValidator = [
  check('name').trim().not().isEmpty().withMessage("Name can't be blank!"),
  check('email')
    .normalizeEmail()
    .isEmail()
    .withMessage('Email is not valid! Please provide a valid email!'),
  check('password')
    .isLength({ min: 4, max: 20 })
    .withMessage('Password must be between 4 and 20 characters!'),
];

exports.validatePassword = [
  check('password')
    .isLength({ min: 4, max: 20 })
    .withMessage('Password must be between 4 and 20 characters!'),
];

exports.validate = (req, res, next) => {
  const errors = validationResult(req).array();
  if (errors.length > 0) {
    return res.status(400).json({ errors: errors[0].msg });
  }
  next();
};
