import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { ENV } from '../config/env';

const run = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({ email: ENV.ADMIN_EMAIL });
    if (existingAdmin) {
      existingAdmin.role = 'admin';
      existingAdmin.password = ENV.ADMIN_PASSWORD;
      await existingAdmin.save();
      console.log(`✅ Admin account updated successfully: ${ENV.ADMIN_EMAIL}`);
    } else {
      await User.create({
        name: ENV.ADMIN_NAME,
        email: ENV.ADMIN_EMAIL,
        password: ENV.ADMIN_PASSWORD,
        phone: '+91 98765 43210',
        city: 'New Delhi',
        state: 'Delhi',
        role: 'admin',
        termsAccepted: true,
      });
      console.log(`✅ Admin account created successfully: ${ENV.ADMIN_EMAIL}`);
    }

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin account:', error);
    process.exit(1);
  }
};

run();
