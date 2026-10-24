import mongoose from 'mongoose';
import { ENV } from './env';

export const connectDB = async (): Promise<void> => {
  const uri = ENV.MONGODB_URI;

  if (!uri) {
    const errorMsg = 'MONGODB_URI is not defined in backend/.env. Please configure a valid MongoDB Atlas connection string.';
    console.error(`❌ ${errorMsg}`);
    throw new Error(errorMsg);
  }

  try {
    mongoose.set('strictQuery', false);

    const isTls =
      uri.startsWith('mongodb+srv://') ||
      uri.includes('tls=true') ||
      uri.includes('ssl=true');

    const options: mongoose.ConnectOptions = {
      serverSelectionTimeoutMS: 15000,
      ...(isTls ? { tlsAllowInvalidCertificates: true } : {}),
    };

    await mongoose.connect(uri, options);

    console.log(
      `🚀 MongoDB connected successfully to: ${mongoose.connection.host} [database: ${mongoose.connection.name}]`
    );
  } catch (error: any) {
    const safeMsg = (error.message || 'Unknown connection error').replace(
      /:([^:@]+)@/,
      ':****@'
    );
    console.error(`❌ MongoDB connection error: ${safeMsg}`);
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('🛑 MongoDB disconnected');
  } catch (error: any) {
    console.error('❌ Error disconnecting MongoDB:', error.message || error);
  }
};
