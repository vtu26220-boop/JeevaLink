import { createApp } from './app';
import { connectDB, disconnectDB } from './config/db';
import { ENV } from './config/env';
import { seedInitialData } from './scripts/seed';

const startServer = async () => {
  try {
    // Connect to database (with automatic in-memory fallback if no MONGODB_URI)
    await connectDB();

    // Auto-seed verified healthcare resources & default admin if DB is fresh
    await seedInitialData();

    const app = createApp();

    const server = app.listen(ENV.PORT, () => {
      console.log('========================================================');
      console.log(`❤️  JeevaLink Backend Server running on port ${ENV.PORT}`);
      console.log(`🌐 Base API URL: http://localhost:${ENV.PORT}/api/v1`);
      console.log(`📊 Mode: ${ENV.NODE_ENV}`);
      console.log('========================================================');
    });

    const shutdown = async () => {
      console.log('\n🛑 Gracefully shutting down JeevaLink server...');
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
};

startServer();
