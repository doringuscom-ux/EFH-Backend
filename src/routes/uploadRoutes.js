import express from 'express';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// @desc    Upload a file to Cloudinary
// @route   POST /api/upload
// @access  Private/Admin
router.post('/', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // req.file.path contains the secure Cloudinary URL
    res.status(200).json({
      message: 'File uploaded successfully',
      url: req.file.path,
      public_id: req.file.filename,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

export default router;
