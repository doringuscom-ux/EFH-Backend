import express from 'express';
import { protect, adminGuard } from '../middleware/authMiddleware.js';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventParticipants,
  cancelEventRegistration,
  getRecentRegistrations
} from '../controllers/eventController.js';

const router = express.Router();

router.route('/admin/recent-registrations')
  .get(protect, adminGuard, getRecentRegistrations);

router.route('/')
  .get(getEvents)
  .post(protect, adminGuard, createEvent);

router.route('/:id')
  .get(getEventById)
  .put(protect, adminGuard, updateEvent)
  .delete(protect, adminGuard, deleteEvent);

router.route('/:id/participants')
  .get(protect, adminGuard, getEventParticipants);

router.route('/registration/:registrationId/cancel')
  .put(protect, adminGuard, cancelEventRegistration);

export default router;
