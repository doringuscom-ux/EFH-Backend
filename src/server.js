import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import contactRoutes from './routes/contactRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import authRoutes from './routes/authRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';

dotenv.config();

// Connect to database
// You can uncomment this once MongoDB is running locally or a URI is provided
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('Equestrian API is running...');
});

// Routes
app.use('/api/contact', contactRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/gallery', galleryRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
