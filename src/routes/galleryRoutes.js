import express from 'express';
import { getGallery, addGalleryItem, deleteGalleryItem } from '../controllers/galleryController.js';
import { protect, adminGuard } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getGallery)
  .post(protect, adminGuard, addGalleryItem);

router.route('/:id')
  .delete(protect, adminGuard, deleteGalleryItem);

export default router;
