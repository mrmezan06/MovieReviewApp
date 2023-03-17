const express = require('express');
const {
  registerUser,
  verifyEmail,
  resendOTP,
} = require('../controllers/userController');
const { validate, userValidator } = require('../middlewares/validator');

const router = express.Router();

router.post('/register', userValidator, validate, registerUser);
router.post('/verify', verifyEmail);
router.post('/resend', resendOTP);

module.exports = router;
