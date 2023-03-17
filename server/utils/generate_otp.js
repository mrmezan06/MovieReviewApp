exports.generate_otp = (len = 6) => {
  let OTP = '';
  for (let i = 0; i < len; i++) {
    OTP += Math.floor(Math.random() * 10);
  }
  return OTP;
};
