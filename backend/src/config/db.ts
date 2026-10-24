import mongoose from 'mongoose';
import { ENV } from './env';

let mongodInstance: any = null;

export const connectDB = async (): Promise<void> => {
  try {
    let uri = ENV.MONGODB_URI;

    if (!uri) {
      console.log('ℹ️  No MONGODB_URI provided in environment. Initializing local in-memory MongoDB instance for development/testing...');
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongodInstance = await MongoMemoryServer.create();
        uri = mongodInstance.getUri();
        console.log(`✅ In-memory MongoDB running at: ${uri}`);
      } catch (err) {
        console.warn('⚠️  Could not initialize in-memory MongoDB. Falling back to default localhost:27017/jeevalink');
        uri = 'mongodb://127.0.0.1:27017/jeevalink';
      }
    }

    mongoose.set('strictQuery', false);
    await mongoose.connect(uri);

    console.log(`🚀 MongoDB connected successfully to: ${mongoose.connection.host} [database: ${mongoose.connection.name}]`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    // Don't crash immediately in dev, but log clearly
    if (ENV.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
    console.log('🛑 MongoDB disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting MongoDB:', error);
  }
};
