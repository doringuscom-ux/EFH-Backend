import mongoose from 'mongoose';

const couponSchema = mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please add a coupon code'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    discountType: {
      type: String,
      required: [true, 'Please select a discount type'],
      enum: ['fixed', 'percentage'],
      default: 'fixed',
    },
    discountValue: {
      type: Number,
      required: [true, 'Please add a discount value'],
    },
    expiryDate: {
      type: Date,
      required: [true, 'Please add an expiry date'],
    },
    restrictedEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
