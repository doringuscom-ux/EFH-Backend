import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Auth user & get session
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { username, password } = req.body; // Can be email or username

  try {
    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    }).select('+password');

    if (user && (await user.matchPassword(password))) {
      if (user.role !== 'admin') {
         return res.status(403).json({ message: 'Access denied. Only admins can login here.' });
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '30d' });
      
      const userObj = user.toObject();
      delete userObj.password;
      res.json({ ...userObj, token });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get current user status
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = req.user;
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
