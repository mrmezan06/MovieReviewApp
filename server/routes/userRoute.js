const express = require('express');
const { registerUser } = require('../controllers/userController');
const { validate, userValidator } = require('../middlewares/validator');

const router = express.Router();

router.post('/register', userValidator, validate, registerUser);

module.exports = router;
