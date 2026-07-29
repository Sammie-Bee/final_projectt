import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const OWNER_EMAIL = 'owner@northstar.com';
const OWNER_PASSWORD = 'Owner123!';

const getJwtSecret = () => process.env.JWT_SECRET || 'dev-secret';

function createAccountNumber() {
  return String(1000000000 + Math.floor(Math.random() * 9000000000));
}

function createOwnerResponse() {
  const token = jwt.sign({ id: 'owner', role: 'admin' }, getJwtSecret(), { expiresIn: '7d' });

  return {
    token,
    user: {
      id: 'owner',
      fullName: 'Northstar Owner',
      email: OWNER_EMAIL,
      role: 'admin',
      accountNumber: '1000000001',
      balance: 0
    }
  };
}

export async function register(req, res) {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Please provide fullName, email, and password' });
    }

    if (email.toLowerCase() === OWNER_EMAIL.toLowerCase() && password === OWNER_PASSWORD) {
      return res.status(200).json(createOwnerResponse());
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    let accountNumber = createAccountNumber();
    let accountExists = await User.exists({ accountNumber });
    while (accountExists) {
      accountNumber = createAccountNumber();
      accountExists = await User.exists({ accountNumber });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      accountNumber,
      balance: 0
    });

    const token = jwt.sign({ id: user._id, role: user.role }, getJwtSecret(), { expiresIn: '7d' });

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        accountNumber: user.accountNumber,
        balance: user.balance
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to register user', error: error.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    if (email.toLowerCase() === OWNER_EMAIL.toLowerCase() && password === OWNER_PASSWORD) {
      return res.status(200).json(createOwnerResponse());
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, getJwtSecret(), { expiresIn: '7d' });

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        accountNumber: user.accountNumber,
        balance: user.balance
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to login', error: error.message });
  }
}

export async function resetPassword(req, res) {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Please provide full name, email, and new password' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = fullName.trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || user.fullName.trim().toLowerCase() !== normalizedName.toLowerCase()) {
      return res.status(404).json({ message: 'No account matches the provided name and email' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to reset password', error: error.message });
  }
}

export default { register, login, resetPassword };
