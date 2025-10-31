/**
 * Create Admin User Script
 * 
 * This script promotes an existing user to admin status with approved access,
 * OR creates a new admin user if the email doesn't exist.
 * 
 * Usage:
 * node migrations/create-admin.js <email>
 * 
 * Example:
 * node migrations/create-admin.js uarmy285@gmail.com
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

// Get email from command line
const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address');
  console.log('\nUsage: node migrations/create-admin.js <email>');
  console.log('Example: node migrations/create-admin.js uarmy285@gmail.com');
  process.exit(1);
}

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

// Create or promote admin
async function createAdmin() {
  try {
    await connectDB();
    
    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      passwordHash: String,
      phone: String,
      role: String,
      status: String
    }, { timestamps: true }));

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // User exists - promote to admin
      console.log(`\n👤 Found existing user: ${user.name} (${user.email})`);
      console.log(`   Current role: ${user.role || 'resident'}`);
      console.log(`   Current status: ${user.status || 'none'}`);
      
      await User.updateOne(
        { _id: user._id },
        { 
          $set: { 
            role: 'admin',
            status: 'approved'
          }
        }
      );
      
      console.log('\n✅ User promoted to Admin with approved status!');
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: admin`);
      console.log(`   Status: approved`);
      console.log('\n💡 You can now login with this account and access the Admin Dashboard!');
      
    } else {
      // User doesn't exist - create new admin
      console.log(`\n🆕 User not found. Creating new admin account...`);
      
      // Default password (user should change after first login)
      const defaultPassword = 'Admin@123';
      const passwordHash = await bcrypt.hash(defaultPassword, 10);
      
      const newAdmin = await User.create({
        name: 'Administrator',
        email: email.toLowerCase(),
        passwordHash,
        phone: '',
        role: 'admin',
        status: 'approved'
      });
      
      console.log('\n✅ Admin account created successfully!');
      console.log(`   Email: ${newAdmin.email}`);
      console.log(`   Password: ${defaultPassword}`);
      console.log(`   Role: admin`);
      console.log(`   Status: approved`);
      console.log('\n⚠️  IMPORTANT: Login and change the password immediately!');
    }

  } catch (err) {
    console.error('❌ Operation failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB\n');
  }
}

// Run
createAdmin();
