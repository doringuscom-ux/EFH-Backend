import mongoose from 'mongoose';
import dotenv from 'dotenv';
import News from './models/News.js';

dotenv.config();

const seedNews = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding.');

    const newsData = [
      {
        headline: 'Guidelines for Haryana State Equestrian Championship 2026',
        category: 'Circular',
        summary: 'Ref: EFH/2026/CIR-045',
        date: new Date('2026-10-15'),
        pdfLink: '#',
        slug: 'guidelines-for-haryana-state-equestrian-championship-2026',
      },
      {
        headline: 'Selection Criteria for National Endurance Qualifier',
        category: 'Notice',
        summary: 'Ref: EFH/2026/NOT-089',
        date: new Date('2026-09-28'),
        pdfLink: '#',
        slug: 'selection-criteria-for-national-endurance-qualifier',
      },
      {
        headline: 'Updated Veterinary Rules & Regulations 2026-27',
        category: 'Rules',
        summary: 'Ref: EFH/2026/RUL-012',
        date: new Date('2026-09-10'),
        pdfLink: '#',
        slug: 'updated-veterinary-rules-regulations-2026-27',
      },
      {
        headline: 'Affiliation Renewal Notice for Equestrian Clubs',
        category: 'Circular',
        summary: 'Ref: EFH/2026/CIR-044',
        date: new Date('2026-08-25'),
        pdfLink: '#',
        slug: 'affiliation-renewal-notice-for-equestrian-clubs',
      },
      {
        headline: 'Results: Regional Show Jumping Qualifiers',
        category: 'Results',
        summary: 'Ref: EFH/2026/RES-005',
        date: new Date('2026-08-10'),
        pdfLink: '#',
        slug: 'results-regional-show-jumping-qualifiers',
      },
    ];

    await News.insertMany(newsData);
    console.log('Data Successfully Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedNews();
