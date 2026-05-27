import express from 'express';
import { protect, adminGuard } from '../middleware/authMiddleware.js';
import {
  getRegistrationSettings,
  updateRegistrationFees,
  generateOfflineCode,
  deleteOfflineCode,
} from '../controllers/settingsController.js';

const router = express.Router();

router.route('/registration')
  .get(protect, adminGuard, getRegistrationSettings);

router.route('/fees')
  .put(protect, adminGuard, updateRegistrationFees);

router.route('/offline-code')
  .post(protect, adminGuard, generateOfflineCode);

router.route('/offline-code/:id')
  .delete(protect, adminGuard, deleteOfflineCode);

export default router;
