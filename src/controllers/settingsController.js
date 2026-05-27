import GlobalSettings from '../models/GlobalSettings.js';
import OfflineCode from '../models/OfflineCode.js';

// @desc    Get global registration settings
// @route   GET /api/settings/registration
// @access  Private/Admin
export const getRegistrationSettings = async (req, res) => {
  try {
    let settings = await GlobalSettings.findOne();
    if (!settings) {
      settings = await GlobalSettings.create({});
    }

    const offlineCodes = await OfflineCode.find().sort({ createdAt: -1 });

    res.json({
      fees: settings.fees,
      offlineCodes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update global registration fees
// @route   PUT /api/settings/fees
// @access  Private/Admin
export const updateRegistrationFees = async (req, res) => {
  try {
    const { player, coach } = req.body;

    let settings = await GlobalSettings.findOne();
    if (!settings) {
      settings = new GlobalSettings();
    }

    if (player !== undefined) settings.fees.player = Number(player);
    if (coach !== undefined) settings.fees.coach = Number(coach);

    await settings.save();

    res.json({ message: 'Fees updated successfully', fees: settings.fees });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Generate offline code
// @route   POST /api/settings/offline-code
// @access  Private/Admin
export const generateOfflineCode = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ message: 'Email and role are required' });
    }

    // Generate random 8 character code
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    let code = generateCode();
    // Ensure uniqueness
    let exists = await OfflineCode.findOne({ code });
    while (exists) {
      code = generateCode();
      exists = await OfflineCode.findOne({ code });
    }

    const offlineCode = await OfflineCode.create({
      code,
      assignedEmail: email,
      role: role.toLowerCase(),
    });

    res.status(201).json({ message: 'Offline code generated successfully', offlineCode });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete offline code
// @route   DELETE /api/settings/offline-code/:id
// @access  Private/Admin
export const deleteOfflineCode = async (req, res) => {
  try {
    const code = await OfflineCode.findById(req.params.id);

    if (!code) {
      return res.status(404).json({ message: 'Offline code not found' });
    }

    await code.deleteOne();

    res.json({ message: 'Offline code deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
