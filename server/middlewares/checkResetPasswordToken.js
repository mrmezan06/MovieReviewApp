const PasswordReset = require('../models/passswordResetModel');
const { sendMessage } = require('../utils/helper');

exports.isValidResetToken = async (req, res, next) => {
  const { id, token } = req.body;
  if (!id || !token) {
    return sendMessage(res, 'Invalid URL!', 400);
  }
  const resetToken = await PasswordReset.findOne({ owner: id });
  if (!resetToken) {
    return sendMessage(res, 'Reset token has been expired/invalid!', 400);
  }
  const match = await resetToken.compareToken(token);
  if (!match) {
    return sendMessage(res, 'Token is invalid!', 400);
  }
  req.resetToken = token;
  next();
};
