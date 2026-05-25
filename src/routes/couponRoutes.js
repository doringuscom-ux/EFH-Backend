import express from 'express';
import { createCoupon, getCoupons, deleteCoupon } from '../controllers/couponController.js';

const router = express.Router();

router.route('/')
  .post(createCoupon)
  .get(getCoupons);

router.route('/:id')
  .delete(deleteCoupon);

export default router;
