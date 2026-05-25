import mongoose from 'mongoose';

const newsSchema = mongoose.Schema(
  {
    headline: {
      type: String,
      required: [true, 'Please add a headline'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    summary: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: ['Official Results', 'News Update', 'Announcement', 'Circular', 'Notice', 'Rules', 'Results'],
      default: 'Official Results',
    },
    date: {
      type: Date,
      required: [true, 'Please add a date'],
    },
    pdfLink: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const News = mongoose.model('News', newsSchema);

export default News;
