import express from 'express';
import { auth } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';
import { getAllAccounts, getHistory, getProfile, getRecipient, sendMoney, toggleAccountStatus, withdraw } from '../controllers/userController.js';

const router = express.Router();

router.get('/profile', auth, getProfile);
router.get('/recipient', auth, getRecipient);
router.post('/send-money', auth, sendMoney);
router.post('/withdraw', auth, withdraw);
router.get('/history', auth, getHistory);
router.get('/accounts', auth, admin, getAllAccounts);
router.patch('/accounts/:userId/status', auth, admin, toggleAccountStatus);

export default router;
