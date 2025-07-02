import express from 'express';
import {sequelize} from './config/connectDB.js';
import User from './models/userModel.js';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.json());

// Test route
app.get('/', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

// Sync DB and start server
sequelize.sync({ alter: true }) // alter=true updates schema without losing data
  .then(() => {
    console.log('Database synced');
    app.listen(3000, () => {
      console.log('Server running on http://localhost:3000');
    });
  })
  .catch((err) => console.error('DB error:', err));
