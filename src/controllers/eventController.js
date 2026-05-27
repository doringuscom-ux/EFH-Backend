import Event from '../models/Event.js';
import User from '../models/User.js';
import EventRegistration from '../models/EventRegistration.js';

// @desc    Get all events
// @route   GET /api/events
// @access  Public
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find({}).sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Admin
export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      time,
      deadline,
      location,
      duration,
      mapUrl,
      image,
      visibilityStatus,
      status,
      pricing
    } = req.body;

    const event = new Event({
      title,
      description,
      date,
      time,
      deadline,
      location,
      duration,
      mapUrl,
      image,
      visibilityStatus,
      status,
      pricing
    });

    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Admin
export const updateEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      time,
      deadline,
      location,
      duration,
      mapUrl,
      image,
      visibilityStatus,
      status,
      pricing
    } = req.body;

    const event = await Event.findById(req.params.id);

    if (event) {
      event.title = title || event.title;
      event.description = description !== undefined ? description : event.description;
      event.date = date || event.date;
      event.time = time !== undefined ? time : event.time;
      event.deadline = deadline !== undefined ? deadline : event.deadline;
      event.location = location || event.location;
      event.duration = duration !== undefined ? duration : event.duration;
      event.mapUrl = mapUrl !== undefined ? mapUrl : event.mapUrl;
      event.image = image !== undefined ? image : event.image;
      event.visibilityStatus = visibilityStatus || event.visibilityStatus;
      event.status = status || event.status;
      if (pricing) {
        event.pricing = { ...event.pricing, ...pricing };
      }

      const updatedEvent = await event.save();
      res.json(updatedEvent);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Admin
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      await Event.deleteOne({ _id: event._id });
      res.json({ message: 'Event removed' });
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get participants for an event
// @route   GET /api/events/:id/participants
// @access  Admin
export const getEventParticipants = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Fetch all registrations for this event
    const registrations = await EventRegistration.find({ event: req.params.id }).populate('user', '-password');
    
    // Transform into the format expected by the frontend
    const participantsData = registrations.map(reg => {
      const user = reg.user;
      return {
        _id: user._id, // User ID
        registrationId: reg._id, // Registration ID
        name: user.personalInfo?.firstName ? `${user.personalInfo.firstName} ${user.personalInfo.lastName || ''}`.trim() : user.username,
        email: user.email,
        role: reg.role,
        image: user.documents?.photograph || '',
        registrationDate: reg.createdAt,
        paymentStatus: reg.amount > 0 ? (reg.status === 'confirmed' ? 'PAID' : 'PENDING') : 'FREE',
        status: reg.status.toUpperCase(),
        amount: reg.amount,
        cancellationReason: reg.cancellationReason || ''
      };
    });

    res.json(participantsData);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Cancel a user's registration
// @route   PUT /api/events/registration/:registrationId/cancel
// @access  Admin
export const cancelEventRegistration = async (req, res) => {
  try {
    const { reason } = req.body;
    const reg = await EventRegistration.findById(req.params.registrationId);
    if (!reg) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    
    reg.status = 'cancelled';
    if (reason) {
      reg.cancellationReason = reason;
    }
    await reg.save();

    res.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get recent registrations across all events for notifications
// @route   GET /api/events/admin/recent-registrations
// @access  Admin
export const getRecentRegistrations = async (req, res) => {
  try {
    // Get registrations from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentRegs = await EventRegistration.find({
      createdAt: { $gte: sevenDaysAgo },
      status: 'confirmed'
    }).populate('event', 'title').populate('user', 'username email');

    res.json(recentRegs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
