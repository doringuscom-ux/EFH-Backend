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
  image: {
    type: String,
    required: [true, 'Please upload an image URL'],
  }
}, { timestamps: true });

const Gallery = mongoose.model('Gallery', gallerySchema);
export default Gallery;
