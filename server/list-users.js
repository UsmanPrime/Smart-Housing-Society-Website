import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    const users = await User.find({}).select('name email role status createdAt').sort({ createdAt: -1 });
    
    if (users.length === 0) {
      console.log('No users found in database');
      process.exit(0);
    }

    console.log(`Found ${users.length} user(s):\n`);
    console.log('─'.repeat(80));
    
    users.forEach((user, index) => {
      const statusIcon = user.status === 'approved' ? '✅' : user.status === 'pending' ? '⏳' : '❌';
      console.log(`${index + 1}. ${statusIcon} ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.status}`);
      console.log(`   Created: ${user.createdAt.toLocaleString()}`);
      console.log('─'.repeat(80));
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

listUsers();
