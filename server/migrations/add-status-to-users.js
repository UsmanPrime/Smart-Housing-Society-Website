/**
 * Migration Script: Add Status Field to Existing Users
 * 
 * This script updates all existing users in the database who don't have a 'status' field
 * and sets them to 'pending' status, requiring admin approval before they can login.
 * 
 * Usage:
 * 1. Make sure MongoDB connection is configured in server/.env
 * 2. Run: cd server && node migrations/add-status-to-users.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: join(__dirname, '..', '.env') });

// Connect to MongoDB
async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGO_URI not found in .env file');
    process.exit(1);
  }
  
  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected successfully!');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
}

// Migration function
async function migrateUsers() {
  try {
    await connectDB();
    
    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      passwordHash: String,
      phone: String,
      role: String,
      status: String
    }));

    // Find all users without a status field
    const usersWithoutStatus = await User.find({ 
      $or: [
        { status: { $exists: false } },
        { status: null }
      ]
    });

    console.log(`\n📊 Found ${usersWithoutStatus.length} users without status field`);

    if (usersWithoutStatus.length === 0) {
      console.log('✅ All users already have status field. No migration needed.');
      process.exit(0);
    }

    // Update each user
    let updated = 0;
    for (const user of usersWithoutStatus) {
      console.log(`   Updating user: ${user.email} (${user.role || 'resident'})`);
      
      // Set status based on role
      // Admins get auto-approved, others need approval
      const newStatus = user.role === 'admin' ? 'approved' : 'pending';
      
      await User.updateOne(
        { _id: user._id },
        { $set: { status: newStatus } }
      );
      updated++;
    }

    console.log(`\n✅ Successfully updated ${updated} users!`);
    console.log('\n📋 Summary:');
    console.log(`   - Admin users: Set to 'approved' (can login immediately)`);
    console.log(`   - Other users: Set to 'pending' (require admin approval)`);
    console.log('\n💡 Next steps:');
    console.log('   1. Restart your backend server');
    console.log('   2. Pending users will need admin approval to login');
    console.log('   3. Admins can approve users from the Admin Dashboard');

  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run migration
migrateUsers();
