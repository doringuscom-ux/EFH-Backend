import mongoose from 'mongoose';

const contactMessageSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
    },
    subject: {
      type: String,
      required: [true, 'Please add a subject'],
    },
    message: {
      type: String,
      required: [true, 'Please add a message'],
    },
    image: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['new', 'read', 'resolved'],
      default: 'new',
    },
  },
  {
    timestamps: true,
  }
);

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);

export default ContactMessage;
