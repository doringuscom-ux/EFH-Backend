import mongoose from 'mongoose';

const offlineCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    assignedEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['player', 'coach'],
    },
    status: {
      type: String,
      required: true,
      enum: ['Active', 'Used'],
      default: 'Active',
    },
    usedBy: {
      type: String,
      default: null,
    },
    usedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const OfflineCode = mongoose.model('OfflineCode', offlineCodeSchema);

export default OfflineCode;
