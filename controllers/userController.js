import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

export async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch profile', error: error.message });
  }
}

export async function getRecipient(req, res) {
  try {
    const { accountNumber } = req.query;
    if (!accountNumber) {
      return res.status(400).json({ message: 'Account number is required' });
    }

    const recipient = await User.findOne({ accountNumber, role: 'user' }).select('fullName accountNumber isActive');
    if (!recipient || !recipient.isActive) {
      return res.status(404).json({ message: 'Recipient not found or inactive' });
    }

    return res.status(200).json({ fullName: recipient.fullName, accountNumber: recipient.accountNumber });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch recipient', error: error.message });
  }
}

export async function sendMoney(req, res) {
  try {
    const { recipientAccountNumber, amount } = req.body;

    if (!recipientAccountNumber || !amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'Invalid transfer details' });
    }

    const parsedAmount = Number(amount);
    const sender = await User.findById(req.user.id);
    const receiver = await User.findOne({ accountNumber: recipientAccountNumber });

    if (!sender || !receiver) {
      return res.status(404).json({ message: 'Sender or recipient not found' });
    }

    if (sender.accountNumber === receiver.accountNumber) {
      return res.status(400).json({ message: 'Self transfers are not allowed' });
    }

    if (sender.balance < parsedAmount) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    sender.balance -= parsedAmount;
    receiver.balance += parsedAmount;
    await sender.save();
    await receiver.save();

    await Transaction.create({
      userId: sender._id,
      accountNumber: sender.accountNumber,
      type: 'TRANSFER',
      amount: -parsedAmount,
      description: `Transfer to ${receiver.accountNumber}`,
      status: 'SUCCESS',
      reference: `TRF-${Date.now()}`
    });

    await Transaction.create({
      userId: receiver._id,
      accountNumber: receiver.accountNumber,
      type: 'TRANSFER',
      amount: parsedAmount,
      description: `Transfer from ${sender.accountNumber}`,
      status: 'SUCCESS',
      reference: `TRF-${Date.now() + 1}`
    });

    return res.status(200).json({ message: 'Transfer successful', balance: sender.balance });
  } catch (error) {
    return res.status(500).json({ message: 'Transfer failed', error: error.message });
  }
}

export async function withdraw(req, res) {
  try {
    const { amount } = req.body;
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'Invalid withdrawal amount' });
    }

    const parsedAmount = Number(amount);
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.balance < parsedAmount) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    user.balance -= parsedAmount;
    await user.save();

    await Transaction.create({
      userId: user._id,
      accountNumber: user.accountNumber,
      type: 'WITHDRAWAL',
      amount: -parsedAmount,
      description: 'ATM withdrawal',
      status: 'SUCCESS',
      reference: `WDR-${Date.now()}`
    });

    return res.status(200).json({ message: 'Withdrawal successful', balance: user.balance });
  } catch (error) {
    return res.status(500).json({ message: 'Withdrawal failed', error: error.message });
  }
}

export async function deposit(req, res) {
  try {
    const { amount } = req.body;
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'Invalid deposit amount' });
    }

    const parsedAmount = Number(amount);
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.balance += parsedAmount;
    await user.save();

    await Transaction.create({
      userId: user._id,
      accountNumber: user.accountNumber,
      type: 'DEPOSIT',
      amount: parsedAmount,
      description: 'Account deposit',
      status: 'SUCCESS',
      reference: `DPT-${Date.now()}`
    });

    return res.status(200).json({ message: 'Deposit successful', balance: user.balance });
  } catch (error) {
    return res.status(500).json({ message: 'Deposit failed', error: error.message });
  }
}

export async function getHistory(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const transactions = await Transaction.find({
      $or: [{ userId: user._id }, { accountNumber: user.accountNumber }]
    }).sort({ timestamp: -1 });

    return res.status(200).json(transactions);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch history', error: error.message });
  }
}

export async function getAllAccounts(req, res) {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch accounts', error: error.message });
  }
}

export async function toggleAccountStatus(req, res) {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Account not found' });
    }

    user.isActive = typeof isActive === 'boolean' ? isActive : !user.isActive;
    await user.save();

    return res.status(200).json({ message: 'Account status updated', account: user });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update account', error: error.message });
  }
}

export default { getProfile, getRecipient, sendMoney, withdraw, deposit, getHistory, getAllAccounts, toggleAccountStatus };
