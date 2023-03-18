const crypto = require('crypto');

exports.sendMessage = (res, message, statusCode = 400) => {
  res.status(statusCode).json({ message });
};

exports.generateRandomBytes = (length = 32) => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(length, async (err, buffer) => {
      if (err) {
        reject(err);
      }
      const token = buffer.toString('hex');
      resolve(token);
    });
  });
};
