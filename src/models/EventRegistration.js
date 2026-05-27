import mongoose from 'mongoose';

const eventRegistrationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  role: {
    type: String,
    required: true
  },
  paymentId: {
    type: String
  },
  orderId: {
    type: String
  },
  amount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'pending'],
    default: 'confirmed'
  },
  cancellationReason: {
    type: String
  }
}, {
  timestamps: true
});

const EventRegistration = mongoose.model('EventRegistration', eventRegistrationSchema);

export default EventRegistration;
