import User from '../models/User.js';
import Event from '../models/Event.js';
import Gallery from '../models/Gallery.js';
import ContactMessage from '../models/ContactMessage.js';
import EventRegistration from '../models/EventRegistration.js';

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/dashboard/stats
 * @access  Private/Admin
 */
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalGalleryItems = await Gallery.countDocuments();
    const totalInquiries = await ContactMessage.countDocuments();
    const totalRegistrations = await EventRegistration.countDocuments();

    // Get recent registrations (last 5)
    const recentRegistrations = await EventRegistration.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'username email personalInfo.firstName personalInfo.lastName')
      .populate('event', 'title date');

    // Get recent inquiries (last 5)
    const recentInquiries = await ContactMessage.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalEvents,
          totalGalleryItems,
          totalInquiries,
          totalRegistrations
        },
        recentActivity: {
          registrations: recentRegistrations,
          inquiries: recentInquiries
        }
      }
    });
  } catch (error) {
    console.error('[Dashboard Controller] Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard stats',
      error: error.message
    });
  }
};
