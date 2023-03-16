const User = require('../models/userModel');

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  const newUser = new User({ name, email, password });
  try {
    const matchEmail = await User.findOne({ email });
    if (matchEmail) {
      return res.status(400).json({ message: 'Email already exists!' });
    }
    await newUser.save();
    res.status(201).json({ User: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser };
