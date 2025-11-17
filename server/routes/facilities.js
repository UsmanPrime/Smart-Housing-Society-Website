import express from 'express';
import Facility from '../models/Facility.js';
import Booking from '../models/Booking.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/facilities
 * List all facilities with optional filters
 * Public access (no auth required)
 */
router.get('/', async (req, res) => {
  try {
    const { availability, category } = req.query;
    
    const filter = {};
    
    if (availability !== undefined) {
      filter.availability = availability === 'true';
    }
    
    if (category) {
      filter.category = category;
    }
    
    const facilities = await Facility.find(filter).sort({ name: 1 });
    
    res.json(facilities);
  } catch (error) {
    console.error('Error fetching facilities:', error);
    res.status(500).json({ message: 'Error fetching facilities', error: error.message });
  }
});

/**
 * POST /api/facilities
 * Create a new facility (admin only)
 */
router.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      capacity,
      availability,
      bookingRules,
      operatingHours
    } = req.body;
    
    // Validate required fields
    if (!name || !category) {
      return res.status(400).json({ message: 'Name and category are required' });
    }
    
    // Check if facility with same name already exists
    const existingFacility = await Facility.findOne({ name });
    if (existingFacility) {
      return res.status(400).json({ message: 'Facility with this name already exists' });
    }
    
    // Create new facility
    const facility = new Facility({
      name,
      description,
      category,
      capacity,
      availability,
      bookingRules,
      operatingHours
    });
    
    await facility.save();
    
    res.status(201).json({
      message: 'Facility created successfully',
      facility
    });
  } catch (error) {
    console.error('Error creating facility:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Facility with this name already exists' });
    }
    
    res.status(500).json({ message: 'Error creating facility', error: error.message });
  }
});

/**
 * GET /api/facilities/:id
 * Get facility details by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    
    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }
    
    res.json(facility);
  } catch (error) {
    console.error('Error fetching facility:', error);
    res.status(500).json({ message: 'Error fetching facility', error: error.message });
  }
});

/**
 * PUT /api/facilities/:id
 * Update facility (admin only)
 */
router.put('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      capacity,
      availability,
      bookingRules,
      operatingHours,
      maintenanceSchedule
    } = req.body;
    
    const facility = await Facility.findById(req.params.id);
    
    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }
    
    // Update fields
    if (name !== undefined) facility.name = name;
    if (description !== undefined) facility.description = description;
    if (category !== undefined) facility.category = category;
    if (capacity !== undefined) facility.capacity = capacity;
    if (availability !== undefined) facility.availability = availability;
    if (bookingRules !== undefined) facility.bookingRules = { ...facility.bookingRules, ...bookingRules };
    if (operatingHours !== undefined) facility.operatingHours = { ...facility.operatingHours, ...operatingHours };
    if (maintenanceSchedule !== undefined) facility.maintenanceSchedule = maintenanceSchedule;
    
    await facility.save();
    
    res.json({
      message: 'Facility updated successfully',
      facility
    });
  } catch (error) {
    console.error('Error updating facility:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Facility with this name already exists' });
    }
    
    res.status(500).json({ message: 'Error updating facility', error: error.message });
  }
});

/**
 * DELETE /api/facilities/:id
 * Delete facility (admin only)
 * Checks for future bookings before deletion
 */
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    
    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }
    
    // Check for future bookings
    const now = new Date();
    const futureBookings = await Booking.find({
      facilityId: req.params.id,
      startTime: { $gt: now },
      status: { $in: ['pending', 'approved'] }
    });
    
    if (futureBookings.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete facility with future bookings',
        futureBookingsCount: futureBookings.length
      });
    }
    
    // Soft delete option (set availability to false) or hard delete
    const { softDelete } = req.query;
    
    if (softDelete === 'true') {
      facility.availability = false;
      await facility.save();
      
      res.json({
        message: 'Facility deactivated successfully',
        facility
      });
    } else {
      await Facility.findByIdAndDelete(req.params.id);
      
      res.json({
        message: 'Facility deleted successfully'
      });
    }
  } catch (error) {
    console.error('Error deleting facility:', error);
    res.status(500).json({ message: 'Error deleting facility', error: error.message });
  }
});

export default router;
