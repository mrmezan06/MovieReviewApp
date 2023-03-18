const express = require('express');
const {
  registerUser,
  verifyEmail,
  resendOTP,
  forgotPassword,
} = require('../controllers/userController');
const { validate, userValidator } = require('../middlewares/validator');

const router = express.Router();

router.post('/register', userValidator, validate, registerUser);
router.post('/verify', verifyEmail);
router.post('/resend', resendOTP);
router.post('/reset-password', forgotPassword);

module.exports = router;
