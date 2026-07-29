import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import { auth } from './middleware/auth.js';
import { getHistory, sendMoney, withdraw, deposit } from './controllers/userController.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/northstar-bank';

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.status(200).json({ ok: true, message: 'Northstar Bank API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.post('/api/transactions/transfer', auth, sendMoney);
app.post('/api/transactions/withdraw', auth, withdraw);
app.post('/api/transactions/deposit', auth, deposit);
app.get('/api/transactions', auth, getHistory);

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI, { retryWrites: false });
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
}

startServer();
