import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import GlobalSettings from '../models/GlobalSettings.js';
import OfflineCode from '../models/OfflineCode.js';

const router = express.Router();

// @desc    Auth user & get session
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { password } = req.body;
  const username = req.body.username?.toLowerCase().trim(); // normalize - could be email or username

  try {
    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    }).select('+password');

    if (user && (await user.matchPassword(password))) {
      // Users can be admins or players
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

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { username, password, role, personalInfo, guardianInfo, contactInfo, clubInfo, documents, isRegistered, paymentDetails, registrationCode } = req.body;
    const email = req.body.email?.toLowerCase().trim(); // always normalize email to lowercase

    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email or username' });
    }

    const settings = await GlobalSettings.findOne();
    const schemaRole = role === 'player' ? 'athlete' : (role || 'player');
    const fee = settings?.fees?.[schemaRole] !== undefined ? Number(settings.fees[schemaRole]) : 0;

    // If fee > 0 and there are no payment details (online payment), we must validate the offline code
    if (fee > 0 && (!paymentDetails || Object.keys(paymentDetails).length === 0)) {
      if (!registrationCode) {
        return res.status(400).json({ message: 'Registration fee payment or a valid Offline Code is required.' });
      }

      const validOffline = await OfflineCode.findOne({
        code: registrationCode.toUpperCase(),
        assignedEmail: email.toLowerCase(),
        role: schemaRole.toLowerCase(),
        status: 'Active'
      });

      if (!validOffline) {
        return res.status(400).json({ message: 'Invalid or expired Registration Code.' });
      }

      // Mark code as used
      validOffline.status = 'Used';
      validOffline.usedBy = email.toLowerCase();
      validOffline.usedAt = new Date();
      await validOffline.save();
    }

    const method = (paymentDetails && Object.keys(paymentDetails).length > 0) ? 'online' : 'offline';

    const user = await User.create({
      username,
      email,
      password,
      role: role || 'player',
      personalInfo,
      guardianInfo,
      contactInfo,
      clubInfo,
      documents,
      isRegistered: isRegistered || true,
      paymentStatus: 'paid',
      paymentMethod: method,
      isFeeReceived: true
    });

    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '30d' });
      const userObj = user.toObject();
      delete userObj.password;
      res.status(201).json({ success: true, ...userObj, token });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      if (req.body.personalInfo) {
        if (req.body.personalInfo.birthDate === '') req.body.personalInfo.birthDate = undefined;
        if (req.body.personalInfo.aadhaarNumber === '') req.body.personalInfo.aadhaarNumber = undefined;
      }
      if (req.body.contactInfo) {
        if (req.body.contactInfo.phone === '') req.body.contactInfo.phone = undefined;
        if (req.body.contactInfo.address && req.body.contactInfo.address.pinCode === '') {
          req.body.contactInfo.address.pinCode = undefined;
        }
      }
      
      user.personalInfo = req.body.personalInfo || user.personalInfo;
      user.guardianInfo = req.body.guardianInfo || user.guardianInfo;
      user.contactInfo = req.body.contactInfo || user.contactInfo;
      user.clubInfo = req.body.clubInfo || user.clubInfo;
      user.documents = req.body.documents || user.documents;
      if (req.body.role) user.role = req.body.role;
      
      // If user updates profile (after rejection), set back to pending for review
      if (user.verificationStatus === 'rejected') {
        user.verificationStatus = 'pending';
        user.adminMessage = '';
      }

      const updatedUser = await user.save();
      const userObj = updatedUser.toObject();
      delete userObj.password;
      res.json(userObj);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Profile Update Error:', error);
    const message = error.errors 
      ? Object.values(error.errors).map(e => e.message).join(', ') 
      : error.message;
    res.status(500).json({ message });
  }
});

// ========================
// ADMIN ROUTES
// ========================

// @desc    Get all users (Admin)
// @route   GET /api/auth/admin/users
// @access  Private/Admin
router.get('/admin/users', protect, async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['player', 'coach', 'admin'] } }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/admin/users/:id
// @access  Private/Admin
router.get('/admin/users/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Verify/Reject User Profilecation status (Admin)
// @route   PUT /api/auth/admin/users/:id/verify
// @access  Admin
router.put('/admin/users/:id/verify', protect, async (req, res) => {
  try {
    const { verificationStatus, isVerified } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { verificationStatus, isVerified },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    const userObj = user.toObject();
    delete userObj.password;
    res.json(userObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Send note to user and optionally unlock profile (Admin)
// @route   PUT /api/auth/admin/users/:id/note
// @access  Admin
router.put('/admin/users/:id/note', protect, async (req, res) => {
  try {
    const { adminMessage, unlock } = req.body;
    const updateData = { adminMessage };
    
    // If unlocking, set status to rejected so they can edit
    if (unlock) {
      updateData.verificationStatus = 'rejected';
      updateData.isVerified = false;
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    const userObj = user.toObject();
    delete userObj.password;
    res.json(userObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update any user profile data (Admin)
// @route   PUT /api/auth/admin/users/:id
// @access  Admin
router.put('/admin/users/:id', protect, async (req, res) => {
  try {
    const { username, personalInfo, guardianInfo, contactInfo, clubInfo } = req.body;
    const email = req.body.email ? req.body.email.toLowerCase().trim() : undefined;
    
    // Check if new email/username is already taken by another user
    if (email || username) {
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
        _id: { $ne: req.params.id }
      });
      if (existingUser) return res.status(400).json({ message: 'Email or username already in use by another account' });
    }

    const updateFields = {};
    if (email) updateFields.email = email;
    if (username) updateFields.username = username;
    if (personalInfo) updateFields.personalInfo = personalInfo;
    if (guardianInfo) updateFields.guardianInfo = guardianInfo;
    if (contactInfo) updateFields.contactInfo = contactInfo;
    if (clubInfo) updateFields.clubInfo = clubInfo;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update user payment status (Admin)
// @route   PUT /api/auth/admin/users/:id/payment
// @access  Admin
router.put('/admin/users/:id/payment', protect, async (req, res) => {
  try {
    const { paymentStatus, isFeeReceived } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { paymentStatus, isFeeReceived }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update user role (Admin)
// @route   PUT /api/auth/admin/users/:id/role
// @access  Admin
router.put('/admin/users/:id/role', protect, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const userObj = user.toObject();
    delete userObj.password;
    res.json(userObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Force update user password (Admin)
// @route   PUT /api/auth/admin/users/:id/password
// @access  Admin
router.put('/admin/users/:id/password', protect, async (req, res) => {
  try {
    const { password } = req.body;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;<>,.?/~\\-]).{8,}$/;
    
    if (!password || !passwordRegex.test(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long, contain at least 1 uppercase letter, 1 number, and 1 special character.' });
    }
    const user = await User.findById(req.params.id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.password = password;
    await user.save(); // triggers pre-save hash
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete user (Admin)
// @route   DELETE /api/auth/admin/users/:id
// @access  Admin
router.delete('/admin/users/:id', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
