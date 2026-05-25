import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    const adminExists = await User.findOne({ email: 'admin@gmail.com' });

    if (adminExists) {
      console.log('Admin user already exists');
      process.exit();
    }

    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@gmail.com',
      password: '12345678',
      role: 'admin',
      isRegistered: true,
      isVerified: true
    });

    console.log(`Admin user created successfully!`);
    console.log(`Username: admin`);
    console.log(`Email: admin@gmail.com`);
    console.log(`Password: 12345678`);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
