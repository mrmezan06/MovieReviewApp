const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const emailVerificationSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 3600, // 1 hour
  },
});
// Token will be hashed before saving to database
emailVerificationSchema.pre('save', async function (next) {
  // normal function used to get access to this. Arrow function does not accessible to this keyword directly.
  if (this.isModified('token')) {
    this.token = await bcrypt.hash(this.token, 10);
  }
  next();
});
// OTP will be compared with hashed token in database
emailVerificationSchema.methods.compareToken = async function (OTP) {
  return await bcrypt.compare(OTP, this.token);
};

const EmailVerification = mongoose.model(
  'EmailVerification',
  emailVerificationSchema
);

module.exports = EmailVerification;
