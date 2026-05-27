import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
  },
  deadline: {
    type: String,
  },
  location: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
  },
  mapUrl: {
    type: String,
  },
  image: {
    type: String, // Maps to banner image
  },
  visibilityStatus: {
    type: String,
    enum: ['Published', 'Draft'],
    default: 'Published',
  },
  status: { // Registration Status
    type: String,
    enum: ['Registrations Open', 'Upcoming', 'Completed', 'Closed'],
    default: 'Upcoming',
  },
  pricing: {
    athlete: { type: Number, default: 0 },
    coach: { type: Number, default: 0 },
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
}, {
  timestamps: true,
});

const Event = mongoose.model('Event', eventSchema);

export default Event;
