import Gallery from '../models/Gallery.js';

// @desc    Get all gallery images
// @route   GET /api/gallery
// @access  Public
export const getGallery = async (req, res) => {
  try {
    const galleryItems = await Gallery.find().sort({ createdAt: -1 });
    res.json(galleryItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a gallery image
// @route   POST /api/gallery
// @access  Private/Admin
export const addGalleryItem = async (req, res) => {
  try {
    const { title, category, image, mediaType, videoUrl } = req.body;
    
    if (!title || !category) {
      return res.status(400).json({ message: 'Title and category are required' });
    }

    if (mediaType === 'image' && !image) {
      return res.status(400).json({ message: 'Image is required for image media type' });
    }

    if (mediaType === 'video' && !videoUrl) {
      return res.status(400).json({ message: 'Video URL is required for video media type' });
    }

    const newGalleryItem = await Gallery.create({
      title,
      category,
      image,
      mediaType: mediaType || 'image',
      videoUrl
    });

    res.status(201).json(newGalleryItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a gallery image
// @route   DELETE /api/gallery/:id
// @access  Private/Admin
export const deleteGalleryItem = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    
    if (item) {
      await item.deleteOne();
      res.json({ message: 'Gallery item removed' });
    } else {
      res.status(404).json({ message: 'Gallery item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
