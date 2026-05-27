import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  role: {
    type: String,
    enum: ['admin', 'player', 'coach', 'club', 'viewer', 'user'],
    default: 'user',
  },
  // Profile Data (filled during registration)
  clubInfo: {
    clubName: String,
    contactPerson: String,
  },
  personalInfo: {
    firstName: String,
    lastName: String,
    gender: String,
    birthDate: Date,
    bloodGroup: String,
    aadhaarNumber: {
      type: String,
      match: [/^(?:\d{12})?$/, 'Aadhaar number must be exactly 12 digits']
    },
  },
  guardianInfo: {
    fatherName: String,
    motherName: String,
    guardianName: String,
  },
  contactInfo: {
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      match: [/^(?:\d{10})?$/, 'Phone number must be exactly 10 digits']
    },
    address: {
      line1: String,
      pinCode: {
        type: String,
        match: [/^(?:\d{6})?$/, 'PIN code must be exactly 6 digits']
      },
      city: String,
      district: String,
      state: String,
      village: String,
      postOffice: String,
    },
  },
  documents: {
    photograph: String,
    dobProof: String,
    aadhaarFront: String,
    aadhaarBack: String,
    idProof: String,
    addressProof: String,
    signature: String,
    clubLogo: String,
    clubLegalDoc: String,
  },
  isRegistered: {
    type: Boolean,
    default: false,
  },
  // Payment Tracking
  paymentMethod: {
    type: String,
    enum: ['online', 'offline', 'manual'],
    default: 'online',
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid',
  },
  isFeeReceived: {
    type: Boolean,
    default: false,
  },
  // Verification System
  isVerified: {
    type: Boolean,
    default: false,
  },
    verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  adminMessage: {
    type: String,
  },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  // Always normalize email to lowercase
  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }
  if (this.contactInfo?.email) {
    this.contactInfo.email = this.contactInfo.email.toLowerCase().trim();
  }
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
