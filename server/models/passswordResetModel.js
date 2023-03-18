const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const passwordResetSchema = new mongoose.Schema({
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
    expires: 900, // 15 minutes
  },
});
// Token will be hashed before saving to database
passwordResetSchema.pre('save', async function (next) {
  // normal function used to get access to this. Arrow function does not accessible to this keyword directly.
  if (this.isModified('token')) {
    this.token = await bcrypt.hash(this.token, 10);
  }
  next();
});
// OTP will be compared with hashed token in database
passwordResetSchema.methods.compareToken = async function (token) {
  return await bcrypt.compare(token, this.token);
};

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

module.exports = PasswordReset;
