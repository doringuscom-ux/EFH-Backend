import mongoose from 'mongoose';

const globalSettingsSchema = new mongoose.Schema(
  {
    fees: {
      player: { type: Number, default: 0 },
      coach: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

const GlobalSettings = mongoose.model('GlobalSettings', globalSettingsSchema);

export default GlobalSettings;
