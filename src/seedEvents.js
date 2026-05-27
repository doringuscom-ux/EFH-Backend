import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Event from './models/Event.js';
import connectDB from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const upcomingEvents = [
  {
    title: 'Haryana State Dressage Championship 2026',
    date: 'Oct 15 - Oct 18, 2026',
    time: '08:00 AM - 05:00 PM',
    location: 'Equestrian Center, Gurugram',
    image: '/IMG/Horse/2.jpg',
    status: 'Registrations Open',
  },
  {
    title: 'National Endurance Qualifier',
    date: 'Nov 05, 2026',
    time: '06:00 AM - 02:00 PM',
    location: 'Aravalli Trails, Faridabad',
    image: '/IMG/Horse/5.jpg',
    status: 'Upcoming',
  },
  {
    title: 'Annual Show Jumping Gala',
    date: 'Dec 12 - Dec 14, 2026',
    time: '09:00 AM - 06:00 PM',
    location: 'EFH Main Arena, Rohtak',
    image: '/IMG/Horse/1.jpg',
    status: 'Upcoming',
  }
];

const completedEvents = [
  {
    title: 'Spring Eventing Classic 2026',
    date: 'Mar 10 - Mar 12, 2026',
    time: '09:00 AM - 05:00 PM',
    location: 'Gurugram',
    image: '/IMG/Horse/3.jpg',
    status: 'Completed'
  },
  {
    title: 'EFH Tent Pegging Tournament',
    date: 'Jan 22 - Jan 24, 2026',
    time: '10:00 AM - 04:00 PM',
    location: 'Karnal',
    image: '/IMG/Horse/4.jpg',
    status: 'Completed'
  },
  {
    title: 'Winter Dressage Showcase',
    date: 'Dec 05 - Dec 07, 2025',
    time: '08:30 AM - 03:00 PM',
    location: 'Panipat',
    image: '/IMG/Horse/6.jpg',
    status: 'Completed'
  }
];

const importData = async () => {
  try {
    await connectDB();

    await Event.deleteMany();
    
    // Add default pricing and visibility to all events
    const allEvents = [...upcomingEvents, ...completedEvents].map(event => ({
      ...event,
      visibilityStatus: 'Published',
      pricing: { athlete: 200, coach: 500 }
    }));

    await Event.insertMany(allEvents);

    console.log('Events Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
