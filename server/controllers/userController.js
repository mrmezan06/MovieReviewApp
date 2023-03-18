const User = require('../models/userModel');
const EmailVerification = require('../models/emailVerificationModel');
const { isValidObjectId } = require('mongoose');
const { generate_otp } = require('../utils/generate_otp');
const { generateMailTransporter } = require('../utils/generate_transporter');
const { sendMessage, generateRandomBytes } = require('../utils/helper');
const PasswordReset = require('../models/passswordResetModel');

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  const newUser = new User({ name, email, password });
  try {
    const matchEmail = await User.findOne({ email });
    if (matchEmail) {
      return sendMessage(res, 'Email already exists!', 400);
    }
    await newUser.save();
    // Generate 6 digit random number
    const OTP = generate_otp();
    // Store OTP in database
    const newEmailVerification = new EmailVerification({
      owner: newUser._id,
      token: OTP,
    });
    await newEmailVerification.save();
    // Send OTP to user email
    const transport = generateMailTransporter();
    transport
      .sendMail({
        from: process.env.MAILTRAP_FROM,
        to: newUser.email,
        subject: 'Email Verification For Movie Review App Account',
        html: `<h1>Email Verification OTP :</h1>
      <p>Your verification code is ${OTP}</p>`,
      })
      .catch((err) => sendMessage(res, err.message, 500));

    sendMessage(
      res,
      'OTP has been sent to your email account. Please verify the email account!',
      201
    );
  } catch (error) {
    sendMessage(res, error.message, 500);
  }
};

const verifyEmail = async (req, res) => {
  const { userId, OTP } = req.body;
  try {
    // Checking user obejctId is valid or not
    if (!isValidObjectId(userId)) {
      return sendMessage(res, 'Invalid user!', 400);
    }
    // Checking user exists or not
    const user = await User.findById(userId);
    if (!user) {
      return sendMessage(res, 'User is not found!', 400);
    }
    // Checking user email is already verified or not
    if (user.isVerified) {
      return sendMessage(res, 'Email is already verified!', 400);
    }
    // Checking OTP is valid or not
    const emailVerification = await EmailVerification.findOne({
      owner: userId,
    });
    if (!emailVerification) {
      return sendMessage(res, 'OTP is not found!', 404);
    }
    // Checking OTP is expired or not or not the same otp which is sent to user
    const isMatch = await emailVerification.compareToken(OTP);
    if (!isMatch) {
      return sendMessage(res, 'OTP is invalid or expired!', 400);
    }
    // If all above conditions are passed then update user email verification status
    user.isVerified = true;
    await user.save();
    // Delete OTP from database
    await EmailVerification.findByIdAndDelete(emailVerification._id);

    // Send Welcome Email to user
    const transport = generateMailTransporter();

    transport
      .sendMail({
        from: process.env.MAILTRAP_FROM,
        to: user.email,
        subject: 'Welcome To Movie Review App',
        html: `<h1>Welcome to Movie Review App.</h1>
      <p>Here, you can find millions of movie review and storyline. Thanks for choosing our platform.</p>`,
      })
      .catch((err) => sendMessage(res, err.message, 500));

    sendMessage(res, 'Email is verified successfully!', 200);
  } catch (error) {
    sendMessage(res, error.message, 500);
  }
};

const resendOTP = async (req, res) => {
  const { userId } = req.body;
  try {
    // Checking user obejctId is valid or not
    if (!isValidObjectId(userId)) {
      return sendMessage(res, 'Invalid user!', 400);
    }
    // Checking user exists or not
    const user = await User.findById(userId);
    if (!user) {
      return sendMessage(res, 'User is not found!', 404);
    }
    // Checking user email is already verified or not
    if (user.isVerified) {
      return sendMessage(res, 'Email is already verified!', 400);
    }

    // Checking OTP is valid or not
    const emailVerification = await EmailVerification.findOne({
      owner: userId,
    });
    if (emailVerification) {
      return sendMessage(res, 'Try again after 15 minutes', 400);
    }

    // Generate 6 digit random number
    const OTP = generate_otp();
    // Store OTP in database
    const newEmailVerification = new EmailVerification({
      owner: user._id,
      token: OTP,
    });
    await newEmailVerification.save();

    // Send OTP to user email
    const transport = generateMailTransporter();

    transport
      .sendMail({
        from: process.env.MAILTRAP_FROM,
        to: user.email,
        subject: 'Email Verification For Movie Review App Account',
        html: `<h1>Email Verification OTP :</h1>
    <p>Your verification code is ${OTP}</p>`,
      })
      .catch((err) => sendMessage(res, err.message, 500));

    sendMessage(
      res,
      'OTP has been resent to your email account. Please verify the email account!',
      201
    );
  } catch (error) {
    sendMessage(res, error.message, 500);
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return sendMessage(res, 'User is not found!', 404);
    }

    const passwordReset = await PasswordReset.findOne({ owner: user._id });
    if (passwordReset) {
      return sendMessage(res, 'Try again after 15 minutes', 400);
    }

    const token = await generateRandomBytes(30);
    const newPasswordReset = new PasswordReset({
      owner: user._id,
      token,
    });
    await newPasswordReset.save();

    const resetPasswordURL = `${process.env.CLIENT_URL}/reset-password?id=${user._id}&token=${token}`;

    const transport = generateMailTransporter();

    transport.sendMail({
      from: process.env.MAILTRAP_FROM,
      to: user.email,
      subject: 'Password Reset For Movie Review App Account',
      html: `<h1>Password Reset URL :</h1>
      <p>You can reset your password by clicking this link - <a href='${resetPasswordURL}'>Reset Password</a> [One time use only]</p>`,
    });
    sendMessage(res, 'Password reset link has been sent to your email!', 200);
  } catch (error) {
    sendMessage(res, error.message, 500);
  }
};

module.exports = { registerUser, verifyEmail, resendOTP, forgotPassword };
