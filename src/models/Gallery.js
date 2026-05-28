import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for the image'],
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['Events', 'Championships', 'Trainings', 'Dressage', 'Show Jumping', 'Eventing', 'Tent Pegging', 'Endurance', 'General'],
    default: 'General'
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    default: 'image'
  },
  videoUrl: {
    type: String
  },
  image: {
    type: String,
    // Note: not required anymore since we might just have a video without cover, 
    // but the original image says cover is optional for video. If it's image, it should be required.
    // We will validate in controller.
  }
}, { timestamps: true });

const Gallery = mongoose.model('Gallery', gallerySchema);
export default Gallery;
