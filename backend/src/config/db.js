import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  
  if (uri) {
    try {
      mongoose.set('strictQuery', false);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 3000,
      });
      console.log(`[MongoDB] Connected to external MongoDB at ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(`[MongoDB] External MongoDB connection failed (${err.message}). Falling back to In-Memory MongoDB...`);
    }
  } else {
    // Check if local mongod is running on default port
    try {
      mongoose.set('strictQuery', false);
      const conn = await mongoose.connect('mongodb://127.0.0.1:27017/multivendor_ecommerce', {
        serverSelectionTimeoutMS: 1200,
      });
      console.log(`[MongoDB] Connected to local MongoDB at ${conn.connection.host}`);
      return conn;
    } catch (err) {
      // Local mongo not running, proceed to in-memory
    }
  }

  // Self-contained In-Memory MongoDB (Zero external configuration or setup needed)
  try {
    console.log('[MongoDB] Starting self-contained In-Memory MongoDB (no external database needed)...');
    mongoMemoryServer = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryServer.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`[MongoDB] Connected to In-Memory MongoDB Server successfully.`);
    return conn;
  } catch (memErr) {
    console.warn('[MongoDB] In-Memory MongoDB notice:', memErr.message);
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};

