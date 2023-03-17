const User = require('../models/userModel');
const nodemailer = require('nodemailer');
const EmailVerification = require('../models/emailVerificationModel');
const { isValidObjectId } = require('mongoose');

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

const verifyEmail = async (req, res) => {
  const { userId, OTP } = req.body;
  try {
    // Checking user obejctId is valid or not
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user!' });
    }
    // Checking user exists or not
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: 'User is not found!' });
    }
    // Checking user email is already verified or not
    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified!' });
    }
    // Checking OTP is valid or not
    const emailVerification = await EmailVerification.findOne({
      owner: userId,
    });
    if (!emailVerification) {
      return res.status(400).json({ message: 'OTP is not found!' });
    }
    // Checking OTP is expired or not or not the same otp which is sent to user
    const isMatch = await emailVerification.compareToken(OTP);
    if (!isMatch) {
      return res.status(400).json({ message: 'OTP is invalid or expired!' });
    }
    // If all above conditions are passed then update user email verification status
    user.isVerified = true;
    await user.save();
    // Delete OTP from database
    await EmailVerification.findByIdAndDelete(emailVerification._id);

    // Send Welcome Email to user
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
        to: user.email,
        subject: 'Welcome To Movie Review App',
        html: `<h1>Welcome to Movie Review App.</h1>
      <p>Here, you can find millions of movie review and storyline. Thanks for choosing our platform.</p>`,
      })
      .catch((err) => console.log(err));

    res.status(200).json({ message: 'Email is verified successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, verifyEmail };
