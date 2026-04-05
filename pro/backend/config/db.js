import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from backend directory
dotenv.config({ path: join(__dirname, '..', '.env') });

let db = null;

export async function connectDB() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined. Please create a .env file in the backend directory with your MongoDB connection string.');
    }
    
    // Log connection attempt (without password)
    const uriWithoutPassword = process.env.MONGODB_URI.replace(/:[^:@]+@/, ':****@');
    console.log('Connecting to MongoDB:', uriWithoutPassword);
    
    const client = new MongoClient(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s
    });
    await client.connect();
    db = client.db();
    console.log('✅ Connected to MongoDB successfully');
    
    // Create indexes
    await createIndexes();
    
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

async function createIndexes() {
  try {
    // Text indexes for search
    await db.collection('courses').createIndex({ 
      title: 'text', 
      description: 'text',
      tags: 'text'
    });
    
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('lessons').createIndex({ courseId: 1, order: 1 });
    await db.collection('progress').createIndex({ userId: 1, lessonId: 1 }, { unique: true });
    await db.collection('messages').createIndex({ userId: 1, createdAt: -1 });
    
    console.log('Indexes created');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
}

export function getDB() {
  if (!db) {
    throw new Error('Database not connected');
  }
  return db;
}
