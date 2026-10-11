require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { startReminders } = require('./reminders');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/plants', require('./routes/plants'));

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('MongoDB connected');
  startReminders();
  app.listen(process.env.PORT || 5000, () => console.log('API running'));
}).catch(err => console.error(err));
