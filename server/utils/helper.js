exports.sendMessage = (res, message, statusCode = 400) => {
  res.status(statusCode).json({ message });
};
