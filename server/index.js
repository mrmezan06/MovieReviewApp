const express = require('express');
const app = express();
const dbConnect = require('./utils/db');
const userRoute = require('./routes/userRoute');
const dotenv = require('dotenv');
dotenv.config();

app.use(express.json());

// Routes
app.use('/user', userRoute);

// Connect to DB
app.listen(5000, () => {
  dbConnect();
  console.log('Server started on port 5000');
});
