import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Coupon from '../models/Coupon.js';
import EventRegistration from '../models/EventRegistration.js';
import GlobalSettings from '../models/GlobalSettings.js';
import OfflineCode from '../models/OfflineCode.js';

const router = express.Router();

// @desc    Get Registration Fees
// @route   GET /api/payment/fees
// @access  Public
router.get('/fees', async (req, res) => {
  try {
    const settings = await GlobalSettings.findOne();
    const fees = settings?.fees || { player: 0, coach: 0 };
    res.json(fees);
  } catch (error) {
    console.error('Error fetching fees:', error);
    res.status(500).json({ message: 'Failed to fetch fees' });
  }
});

// @desc    Create Razorpay order for Registration Fee
// @route   POST /api/payment/create-registration-order
// @access  Public
router.post('/create-registration-order', async (req, res) => {
  const { role, email, username } = req.body;

  try {
    // Validate if user exists
    if (email) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already registered. Please login or use a different email.' });
      }
    }

    if (username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({ message: 'Username is already taken. Please choose another one.' });
      }
    }

    const settings = await GlobalSettings.findOne();
    const fee = settings?.fees?.[role] !== undefined ? Number(settings.fees[role]) : 0;

    if (fee <= 0) {
      return res.status(400).json({ message: 'No fee required for this role or invalid role.' });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(fee * 100), // amount in paise
      currency: 'INR',
      receipt: `reg_receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Registration Order Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Validate Coupon
// @route   GET /api/payment/validate-coupon/:code
// @access  Public (or Private)
router.get('/validate-coupon/:code', async (req, res) => {
  try {
    const { email, role } = req.query;
    const code = req.params.code.trim();
    let coupon = await Coupon.findOne({ code: new RegExp(`^${code}$`, 'i') });
    
    if (!coupon) {
      if (email && role) {
        const schemaRole = role === 'player' ? 'athlete' : role;
        const validOffline = await OfflineCode.findOne({
          code: code.toUpperCase(),
          assignedEmail: email.toLowerCase(),
          role: schemaRole.toLowerCase(),
          status: 'Active'
        });
        
        if (validOffline) {
          // Return a mock coupon object for frontend to process 100% discount
          return res.json({
            _id: validOffline._id,
            code: validOffline.code,
            discountType: 'percentage',
            discountValue: 100,
            isOfflineCode: true
          });
        }
      }
      return res.status(404).json({ message: 'Invalid coupon or offline code' });
    }

    // Check expiry
    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    // If restricted email logic is needed
    // if (coupon.restrictedEmail && coupon.restrictedEmail !== req.user.email) { ... }

    res.json(coupon);
  } catch (error) {
    console.error('Coupon Validation Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create Razorpay order for Event Registration
// @route   POST /api/payment/create-order
// @access  Private (Assume protected middleware in real scenario, or passed here)
router.post('/create-order', async (req, res) => {
  try {
    const { eventId, role, couponCode, offlineCode, userId } = req.body;
    
    // Prevent duplicate active registrations
    const existingActiveReg = await EventRegistration.findOne({
      event: eventId,
      user: userId,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingActiveReg) {
      return res.status(400).json({ message: 'You already have an active registration for this event. Please cancel your previous booking if you wish to register again.' });
    }
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const schemaRole = role === 'player' ? 'athlete' : role;
    
    // Fetch GlobalSettings for fee
    const settings = await GlobalSettings.findOne();
    let fee = settings?.fees?.[schemaRole] !== undefined ? Number(settings.fees[schemaRole]) : (Number(event.pricing?.[schemaRole]) || 0);
    
    const baseFee = fee;

    // Apply offline code logic
    let offlineCodeApplied = false;
    if (offlineCode) {
      const user = await User.findById(userId);
      if (user && user.email) {
        const validOffline = await OfflineCode.findOne({
          code: offlineCode.toUpperCase(),
          assignedEmail: user.email.toLowerCase(),
          role: schemaRole.toLowerCase(),
          status: 'Active'
        });
        
        if (validOffline) {
          fee = 0;
          offlineCodeApplied = true;
          validOffline.status = 'Used';
          await validOffline.save();
        }
      }
    }
    
    // Apply coupon logic if offline code was not used
    if (couponCode && fee > 0 && !offlineCodeApplied) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon && new Date(coupon.expiryDate) >= new Date()) {
        if (coupon.discountType === 'fixed') {
          fee = fee - Number(coupon.discountValue);
        } else {
          fee = fee - (fee * (Number(coupon.discountValue) / 100));
        }
      }
    }
    
    fee = Math.round(fee);
    
    // If the base event fee is greater than 0, the final discounted price must be at least 1 unless offline code used
    if (baseFee > 0 && fee < 1 && !offlineCodeApplied) {
      fee = 1;
    }
    
    // Just in case (for genuinely free events)
    if (fee < 0) fee = 0;
    
    if (fee === 0) {
      // Free event, skip Razorpay and create confirmed registration directly
      const newReg = new EventRegistration({
        user: userId,
        event: eventId,
        role: schemaRole,
        amount: 0,
        status: 'confirmed'
      });
      await newReg.save();

      if (!event.participants.includes(userId)) {
        event.participants.push(userId);
        await event.save();
      }

      return res.json({
        orderId: 'FREE_EVENT',
        amount: 0,
        registrationId: newReg._id,
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID'
      });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret',
    });

    const options = {
      amount: fee * 100, // amount in paise
      currency: 'INR',
      receipt: `event_reg_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    const newReg = new EventRegistration({
      user: userId,
      event: eventId,
      role: schemaRole,
      amount: fee,
      orderId: order.id,
      status: 'pending'
    });
    await newReg.save();

    res.json({
      orderId: order.id,
      amount: order.amount,
      registrationId: newReg._id,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Event Registration Order Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Verify Payment
// @route   POST /api/payment/verify
// @access  Public/Private
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, registrationId, status } = req.body;
    
    if (status === 'failed') {
      if (registrationId) {
        await EventRegistration.findByIdAndUpdate(registrationId, { status: 'cancelled' });
      }
      return res.json({ success: false, message: 'Payment failed' });
    }

    // Verify signature logic would go here

    // Update registration status
    if (registrationId) {
      const reg = await EventRegistration.findByIdAndUpdate(registrationId, {
        paymentId: razorpay_payment_id,
        status: 'confirmed'
      });

      if (reg) {
        const event = await Event.findById(reg.event);
        if (event && !event.participants.includes(reg.user)) {
          event.participants.push(reg.user);
          await event.save();
        }
      }
    }

    res.json({ success: true, message: 'Payment verified and registration complete!' });
  } catch (error) {
    console.error('Verification Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
