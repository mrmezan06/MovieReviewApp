const User = require('../models/userModel');
const nodemailer = require('nodemailer');
const EmailVerification = require('../models/emailVerificationModel');

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  const newUser = new User({ name, email, password });
  try {
    const matchEmail = await User.findOne({ email });
    if (matchEmail) {
      return res.status(400).json({ message: 'Email already exists!' });
    }
    await newUser.save();
    // Generate 6 digit random number
    let OTP = '';
    for (let i = 0; i < 6; i++) {
      OTP += Math.floor(Math.random() * 10);
    }
    // Store OTP in database
    const newEmailVerification = new EmailVerification({
      owner: newUser._id,
      token: OTP,
    });
    await newEmailVerification.save();
    // Send OTP to user email
    const transport = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASSWORD,
      },
    });
    transport
      .sendMail({
        from: process.env.MAILTRAP_FROM,
        to: newUser.email,
        subject: 'Email Verification For Movie Review App Account',
        html: `<h1>Email Verification OTP :</h1>
      <p>Your verification code is ${OTP}</p>`,
      })
      .catch((err) => console.log(err));

    res.status(201).json({
      message:
        'OTP has been sent to your given email account. Please verify that email address is valid!',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser };
