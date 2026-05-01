import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function cleanDB() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in .env');
    process.exit(1);
  }

  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to database.');

    // Drop all collections
    const collections = await mongoose.connection.db?.collections();
    if (collections) {
      for (const collection of collections) {
        console.log(`Dropping collection: ${collection.collectionName}`);
        await collection.drop();
      }
    }

    console.log('Database successfully cleaned! Fresh start.');
  } catch (error) {
    console.error('Error cleaning database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database.');
    process.exit(0);
  }
}

cleanDB();
