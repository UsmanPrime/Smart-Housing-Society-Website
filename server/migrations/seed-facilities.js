import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Facility from '../models/Facility.js';

// Load environment variables
dotenv.config();

const sampleFacilities = [
  {
    name: 'Community Swimming Pool',
    description: 'Olympic-sized swimming pool with separate sections for adults and children',
    category: 'outdoor',
    capacity: 50,
    availability: true,
    bookingRules: {
      minDuration: 60,
      maxDuration: 180,
      advanceBookingDays: 14,
      minAdvanceHours: 2,
      allowedRoles: ['resident', 'admin']
    },
    operatingHours: {
      monday: { start: '06:00', end: '21:00' },
      tuesday: { start: '06:00', end: '21:00' },
      wednesday: { start: '06:00', end: '21:00' },
      thursday: { start: '06:00', end: '21:00' },
      friday: { start: '06:00', end: '21:00' },
      saturday: { start: '07:00', end: '22:00' },
      sunday: { start: '07:00', end: '22:00' }
    }
  },
  {
    name: 'Fitness Center',
    description: 'Modern gym equipped with cardio machines, weights, and fitness equipment',
    category: 'indoor',
    capacity: 30,
    availability: true,
    bookingRules: {
      minDuration: 60,
      maxDuration: 120,
      advanceBookingDays: 7,
      minAdvanceHours: 1,
      allowedRoles: ['resident', 'admin']
    },
    operatingHours: {
      monday: { start: '05:00', end: '23:00' },
      tuesday: { start: '05:00', end: '23:00' },
      wednesday: { start: '05:00', end: '23:00' },
      thursday: { start: '05:00', end: '23:00' },
      friday: { start: '05:00', end: '23:00' },
      saturday: { start: '06:00', end: '22:00' },
      sunday: { start: '06:00', end: '22:00' }
    }
  },
  {
    name: 'Tennis Court',
    description: 'Professional tennis court with night lighting',
    category: 'outdoor',
    capacity: 4,
    availability: true,
    bookingRules: {
      minDuration: 60,
      maxDuration: 120,
      advanceBookingDays: 14,
      minAdvanceHours: 3,
      allowedRoles: ['resident', 'admin']
    },
    operatingHours: {
      monday: { start: '06:00', end: '22:00' },
      tuesday: { start: '06:00', end: '22:00' },
      wednesday: { start: '06:00', end: '22:00' },
      thursday: { start: '06:00', end: '22:00' },
      friday: { start: '06:00', end: '22:00' },
      saturday: { start: '07:00', end: '23:00' },
      sunday: { start: '07:00', end: '23:00' }
    }
  },
  {
    name: 'Community Hall',
    description: 'Large hall for events, parties, and gatherings',
    category: 'indoor',
    capacity: 100,
    availability: true,
    bookingRules: {
      minDuration: 120,
      maxDuration: 480,
      advanceBookingDays: 60,
      minAdvanceHours: 48,
      allowedRoles: ['resident', 'admin']
    },
    operatingHours: {
      monday: { start: '08:00', end: '23:00' },
      tuesday: { start: '08:00', end: '23:00' },
      wednesday: { start: '08:00', end: '23:00' },
      thursday: { start: '08:00', end: '23:00' },
      friday: { start: '08:00', end: '23:00' },
      saturday: { start: '08:00', end: '23:59' },
      sunday: { start: '08:00', end: '23:59' }
    }
  },
  {
    name: 'Basketball Court',
    description: 'Full-size basketball court with quality flooring',
    category: 'outdoor',
    capacity: 10,
    availability: true,
    bookingRules: {
      minDuration: 60,
      maxDuration: 120,
      advanceBookingDays: 7,
      minAdvanceHours: 2,
      allowedRoles: ['resident', 'admin']
    },
    operatingHours: {
      monday: { start: '06:00', end: '22:00' },
      tuesday: { start: '06:00', end: '22:00' },
      wednesday: { start: '06:00', end: '22:00' },
      thursday: { start: '06:00', end: '22:00' },
      friday: { start: '06:00', end: '22:00' },
      saturday: { start: '07:00', end: '23:00' },
      sunday: { start: '07:00', end: '23:00' }
    }
  },
  {
    name: 'Children\'s Play Area',
    description: 'Safe and fun play area for children with swings, slides, and climbing equipment',
    category: 'outdoor',
    capacity: 20,
    availability: true,
    bookingRules: {
      minDuration: 60,
      maxDuration: 180,
      advanceBookingDays: 7,
      minAdvanceHours: 1,
      allowedRoles: ['resident', 'admin']
    },
    operatingHours: {
      monday: { start: '07:00', end: '20:00' },
      tuesday: { start: '07:00', end: '20:00' },
      wednesday: { start: '07:00', end: '20:00' },
      thursday: { start: '07:00', end: '20:00' },
      friday: { start: '07:00', end: '20:00' },
      saturday: { start: '08:00', end: '21:00' },
      sunday: { start: '08:00', end: '21:00' }
    }
  },
  {
    name: 'BBQ Area',
    description: 'Outdoor BBQ area with grills, tables, and seating',
    category: 'outdoor',
    capacity: 25,
    availability: true,
    bookingRules: {
      minDuration: 120,
      maxDuration: 300,
      advanceBookingDays: 14,
      minAdvanceHours: 24,
      allowedRoles: ['resident', 'admin']
    },
    operatingHours: {
      monday: { start: '10:00', end: '22:00' },
      tuesday: { start: '10:00', end: '22:00' },
      wednesday: { start: '10:00', end: '22:00' },
      thursday: { start: '10:00', end: '22:00' },
      friday: { start: '10:00', end: '23:00' },
      saturday: { start: '09:00', end: '23:00' },
      sunday: { start: '09:00', end: '23:00' }
    }
  }
];

async function seedFacilities() {
  try {
    // Connect to MongoDB using environment variable
    const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/housing-society';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if facilities already exist
    const existingCount = await Facility.countDocuments();
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing facilities.`);
      console.log('Do you want to clear existing facilities and reseed? (yes/no)');
      // For automation, we'll skip if facilities exist
      console.log('Skipping seed - facilities already exist');
      await mongoose.connection.close();
      return;
    }

    // Insert facilities
    console.log('Seeding facilities...');
    const result = await Facility.insertMany(sampleFacilities);
    console.log(`✓ Successfully created ${result.length} facilities:`);
    result.forEach(facility => {
      console.log(`  - ${facility.name} (${facility.category})`);
    });

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    console.log('Facilities seeded successfully!');
  } catch (error) {
    console.error('Error seeding facilities:', error);
    process.exit(1);
  }
}

// Run the seed function
seedFacilities();
