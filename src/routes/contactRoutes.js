import express from 'express';
import { submitContactMessage, getInquiries, updateInquiryStatus, deleteInquiry } from '../controllers/contactController.js';

const router = express.Router();

router.route('/')
  .post(submitContactMessage)
  .get(getInquiries);

router.route('/:id')
  .put(updateInquiryStatus)
  .delete(deleteInquiry);

export default router;
