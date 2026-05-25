import Coupon from '../models/Coupon.js';

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, expiryDate, restrictedEmail } = req.body;

    if (!code || !discountType || !discountValue || !expiryDate) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });

    if (couponExists) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code,
      discountType,
      discountValue,
      expiryDate,
      restrictedEmail,
    });

    if (coupon) {
      res.status(201).json(coupon);
    } else {
      res.status(400).json({ message: 'Invalid coupon data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort('-createdAt');
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (coupon) {
      res.status(200).json({ message: 'Coupon removed' });
    } else {
      res.status(404).json({ message: 'Coupon not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
