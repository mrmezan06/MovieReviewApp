const express = require('express');
const {
  registerUser,
  verifyEmail,
  resendOTP,
  forgotPassword,
  sendResetPasswordTokenStatus,
  resetPassword,
} = require('../controllers/userController');
const { isValidResetToken } = require('../middlewares/checkResetPasswordToken');
const {
  validate,
  userValidator,
  validatePassword,
} = require('../middlewares/validator');

const router = express.Router();

router.post('/register', userValidator, validate, registerUser);
router.post('/verify', verifyEmail);
router.post('/resend', resendOTP);
router.post('/forget-password', forgotPassword);
router.post('/verify-url', isValidResetToken, sendResetPasswordTokenStatus);
router.post(
  '/reset-password',
  validatePassword,
  validate,
  isValidResetToken,
  resetPassword
);

module.exports = router;
