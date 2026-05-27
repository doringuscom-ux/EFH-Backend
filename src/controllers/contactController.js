import ContactMessage from '../models/ContactMessage.js';
import { sendAdminContactNotification } from '../utils/emailService.js';

// @desc    Submit a contact message
// @route   POST /api/contact
// @access  Public
export const submitContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message, image } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const contactMessage = await ContactMessage.create({
      name,
      email,
      subject,
      message,
      image,
    });

    if (contactMessage) {
      // Send background email notification
      sendAdminContactNotification(contactMessage).catch(err => console.error('Failed to send contact email:', err));

      res.status(201).json({
        success: true,
        data: contactMessage,
        message: 'Message sent successfully!',
      });
    } else {
      res.status(400).json({ message: 'Invalid message data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all inquiries
// @route   GET /api/contact
// @access  Private/Admin
export const getInquiries = async (req, res) => {
  try {
    const inquiries = await ContactMessage.find({}).sort('-createdAt');
    res.status(200).json(inquiries);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update inquiry status
// @route   PUT /api/contact/:id
// @access  Private/Admin
export const updateInquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const inquiry = await ContactMessage.findById(req.params.id);

    if (inquiry) {
      inquiry.status = status || inquiry.status;
      const updatedInquiry = await inquiry.save();
      res.status(200).json(updatedInquiry);
    } else {
      res.status(404).json({ message: 'Inquiry not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete inquiry
// @route   DELETE /api/contact/:id
// @access  Private/Admin
export const deleteInquiry = async (req, res) => {
  try {
    const inquiry = await ContactMessage.findByIdAndDelete(req.params.id);

    if (inquiry) {
      res.status(200).json({ message: 'Inquiry removed' });
    } else {
      res.status(404).json({ message: 'Inquiry not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
