import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/multivendor_ecommerce';
  
  try {
    // Attempt local MongoDB connection with 2.5 second timeout
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[MongoDB] Connected to real MongoDB at ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.warn(`[MongoDB] Local MongoDB connection failed (${err.message}). Starting in-memory MongoDB fallback...`);
    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[MongoDB] Connected to In-Memory MongoDB Server at ${memoryUri}`);
      return conn;
    } catch (memErr) {
      console.error('[MongoDB] Fatal error initializing In-Memory MongoDB:', memErr.message);
      process.exit(1);
    }
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
