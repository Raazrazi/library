import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Book from './server/models/Book.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/libon';

const seedBooks = [
  { title: 'Neon Horizons', author: 'J.A. Sterling', coverImage: '/assets/book_cover_scifi.png', rating: 4.8, category: 'Sci-Fi', barcode: '1000000001', status: 'available', borrowedBy: null },
  { title: 'Whispers of the Aether', author: 'Elena Vance', coverImage: '/assets/book_cover_fantasy.png', rating: 4.9, category: 'Fantasy', barcode: '1000000002', status: 'available', borrowedBy: null },
  { title: 'Midnight Shadows', author: 'Marcus Black', coverImage: '/assets/book_cover_thriller.png', rating: 4.6, category: 'Thriller', barcode: '1000000003', status: 'available', borrowedBy: null },
  { title: 'Echoes of Summer', author: 'Lily Rose', coverImage: '/assets/book_cover_romance.png', rating: 4.7, category: 'Romance', barcode: '1000000004', status: 'available', borrowedBy: null }
];

async function seedDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');
    
    // Clear existing books
    await Book.deleteMany({});
    console.log('Cleared existing books.');

    // Insert new books
    await Book.insertMany(seedBooks);
    console.log('Successfully seeded database with sample books!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDB();
