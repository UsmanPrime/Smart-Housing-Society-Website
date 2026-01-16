import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function approveUser(email) {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log(`❌ User with email "${email}" not found`);
      process.exit(1);
    }

    if (user.status === 'approved') {
      console.log(`✅ User "${email}" is already approved`);
      process.exit(0);
    }

    user.status = 'approved';
    await user.save();

    console.log(`✅ Successfully approved user: ${user.name} (${user.email})`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Status: ${user.status}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Get email from command line
const email = process.argv[2];

if (!email) {
  console.log('Usage: node approve-user.js <email>');
  console.log('Example: node approve-user.js user@example.com');
  process.exit(1);
}

approveUser(email);
