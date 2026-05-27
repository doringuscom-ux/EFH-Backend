import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import EventRegistration from '../models/EventRegistration.js';

const router = express.Router();

// @desc    Get user registrations
// @route   GET /api/user-events/my-registrations
// @access  Private
router.get('/my-registrations', protect, async (req, res) => {
  try {
    const registrations = await EventRegistration.find({ user: req.user._id })
      .populate('event')
      .sort({ createdAt: -1 });
    
    // Format to match frontend expectations
    const formattedRegs = registrations.map(reg => ({
      _id: reg._id,
      event: reg.event,
      role: reg.role,
      status: reg.status,
      paymentStatus: reg.amount > 0 ? (reg.status === 'confirmed' ? 'paid' : 'pending') : 'free',
      amount: reg.amount,
      registrationDate: reg.createdAt,
      cancellationReason: reg.cancellationReason
    }));
    
    res.json(formattedRegs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Cancel a registration
// @route   POST /api/user-events/cancel/:id
// @access  Private
router.post('/cancel/:id', protect, async (req, res) => {
  try {
    const { reason } = req.body;
    
    // Find registration and ensure it belongs to this user
    const reg = await EventRegistration.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!reg) {
      return res.status(404).json({ message: 'Registration not found or unauthorized' });
    }
    
    if (reg.status === 'cancelled') {
      return res.status(400).json({ message: 'Registration is already cancelled' });
    }

    reg.status = 'cancelled';
    reg.cancellationReason = `User Cancelled: ${reason || 'No specific reason provided'}`;
    await reg.save();

    res.json({ message: 'Your registration was cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
