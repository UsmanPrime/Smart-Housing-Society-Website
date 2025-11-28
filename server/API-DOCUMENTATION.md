# 📚 Smart Housing Society - API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication
Most endpoints require authentication via JWT token. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📝 Table of Contents
1. [Authentication](#authentication-endpoints)
2. [Users](#user-endpoints)
3. [Complaints](#complaint-endpoints)
4. [Vendors](#vendor-endpoints)
5. [Facilities](#facility-endpoints)
6. [Bookings](#booking-endpoints)
7. [Analytics](#analytics-endpoints)
8. [File Upload](#file-upload-endpoints)
9. [Announcements](#announcement-endpoints)

---

## Authentication Endpoints

### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "1234567890",
  "address": "123 Main St",
  "role": "resident"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful. Your account is pending approval.",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "resident",
      "status": "pending"
    }
  }
}
```

---

### POST /api/auth/login
Login to get JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "resident",
      "status": "approved"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### POST /api/auth/forgot-password
Request password reset OTP.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "OTP sent to your email"
}
```

---

## Complaint Endpoints

### POST /api/complaints
Create a new complaint (Resident only).

**Authentication:** Required  
**Role:** resident

**Request Body:**
```json
{
  "title": "Leaking pipe in bathroom",
  "category": "plumbing",
  "priority": "high",
  "description": "The pipe under the sink is leaking continuously",
  "location": "Apartment 301, Building A",
  "attachments": ["/uploads/complaints/image1.jpg"]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Complaint created successfully",
  "data": {
    "_id": "complaint_id",
    "title": "Leaking pipe in bathroom",
    "category": "plumbing",
    "priority": "high",
    "status": "open",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### GET /api/complaints
List complaints with filters.

**Authentication:** Required  
**Query Parameters:**
- `status` - Filter by status (open, in-progress, resolved, closed)
- `category` - Filter by category (plumbing, electrical, etc.)
- `priority` - Filter by priority (low, medium, high)
- `limit` - Pagination limit (default: 50)
- `skip` - Pagination skip

**Response (200):**
```json
{
  "success": true,
  "data": {
    "complaints": [...],
    "total": 25
  }
}
```

---

### GET /api/complaints/:id
Get single complaint details.

**Authentication:** Required  
**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "complaint_id",
    "title": "Leaking pipe in bathroom",
    "category": "plumbing",
    "priority": "high",
    "status": "in-progress",
    "description": "...",
    "submittedBy": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "assignedTo": {
      "_id": "vendor_id",
      "name": "Plumber Joe"
    },
    "comments": [...]
  }
}
```

---

### PUT /api/complaints/:id
Update complaint.

**Authentication:** Required  
**Permissions:**
- Admin: Can update any field
- Resident: Can update own complaint (title, description, location)
- Vendor: Can update status

**Request Body:**
```json
{
  "status": "in-progress"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Complaint updated successfully",
  "data": {...}
}
```

---

### POST /api/complaints/:id/comments
Add comment to complaint.

**Authentication:** Required  
**Request Body:**
```json
{
  "text": "I've inspected the issue. Will fix it tomorrow."
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {...}
}
```

---

### PUT /api/complaints/:id/assign
Assign complaint to vendor (Admin only).

**Authentication:** Required  
**Role:** admin

**Request Body:**
```json
{
  "vendorId": "vendor_user_id"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Complaint assigned successfully"
}
```

---

## Vendor Endpoints

### GET /api/vendors
List all vendors (Admin only).

**Authentication:** Required  
**Role:** admin

**Query Parameters:**
- `specialization` - Filter by specialization
- `available` - Filter by availability (true/false)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "vendor_id",
      "name": "Plumber Joe",
      "email": "joe@example.com",
      "specialization": ["plumbing", "maintenance"],
      "isAvailable": true,
      "stats": {
        "open": 2,
        "in-progress": 3,
        "resolved": 15
      }
    }
  ]
}
```

---

### GET /api/vendors/my-work
Get vendor's assigned complaints.

**Authentication:** Required  
**Role:** vendor

**Response (200):**
```json
{
  "success": true,
  "data": {
    "complaints": [...],
    "stats": {
      "total": 20,
      "open": 2,
      "in-progress": 3,
      "resolved": 15
    }
  }
}
```

---

### GET /api/vendors/stats
Get vendor statistics.

**Authentication:** Required  
**Role:** vendor

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalJobs": 20,
    "open": 2,
    "inProgress": 3,
    "completed": 15,
    "completedToday": 2,
    "thisWeek": 8,
    "avgResolutionTime": 24,
    "completionRate": 75,
    "byCategory": {
      "plumbing": 10,
      "electrical": 5,
      "maintenance": 5
    }
  }
}
```

---

### PUT /api/vendors/availability
Toggle vendor availability.

**Authentication:** Required  
**Role:** vendor

**Request Body:**
```json
{
  "isAvailable": false
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Availability updated to unavailable"
}
```

---

## Facility Endpoints

### GET /api/facilities
List all facilities.

**Authentication:** Not required

**Query Parameters:**
- `availability` - Filter by availability (true/false)
- `category` - Filter by category (indoor, outdoor, amenity)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "facility_id",
      "name": "Swimming Pool",
      "description": "Olympic-size swimming pool",
      "category": "outdoor",
      "capacity": 50,
      "availability": true,
      "bookingRules": {...},
      "operatingHours": {...}
    }
  ]
}
```

---

### POST /api/facilities
Create new facility (Admin only).

**Authentication:** Required  
**Role:** admin

**Request Body:**
```json
{
  "name": "Tennis Court",
  "description": "Professional tennis court",
  "category": "outdoor",
  "capacity": 4,
  "bookingRules": {
    "minDuration": 60,
    "maxDuration": 120,
    "advanceBookingDays": 7
  }
}
```

---

## Booking Endpoints

### POST /api/bookings
Create new booking.

**Authentication:** Required  
**Role:** resident, admin

**Request Body:**
```json
{
  "facilityId": "facility_id",
  "startTime": "2024-01-20T14:00:00.000Z",
  "endTime": "2024-01-20T16:00:00.000Z",
  "purpose": "Birthday party",
  "attendees": 20
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Booking created successfully. Pending admin approval.",
  "data": {
    "_id": "booking_id",
    "status": "pending",
    "startTime": "2024-01-20T14:00:00.000Z"
  }
}
```

---

### GET /api/bookings
List bookings with filters.

**Authentication:** Required  
**Query Parameters:**
- `facilityId` - Filter by facility
- `userId` - Filter by user
- `status` - Filter by status (pending, approved, rejected, cancelled)
- `startDate` - Filter from start date
- `endDate` - Filter to end date

---

### PUT /api/bookings/:id/approve
Approve booking (Admin only).

**Authentication:** Required  
**Role:** admin

**Response (200):**
```json
{
  "success": true,
  "message": "Booking approved successfully"
}
```

---

### PUT /api/bookings/:id/reject
Reject booking (Admin only).

**Authentication:** Required  
**Role:** admin

**Request Body:**
```json
{
  "rejectionReason": "Facility is under maintenance on that date"
}
```

---

## Analytics Endpoints

### GET /api/analytics/complaints
Get complaints analytics (Admin only).

**Authentication:** Required  
**Role:** admin

**Query Parameters:**
- `startDate` - Filter from date
- `endDate` - Filter to date

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalComplaints": 150,
    "byStatus": {
      "open": 20,
      "in-progress": 30,
      "resolved": 80,
      "closed": 20
    },
    "byCategory": {...},
    "avgResolutionTime": 36,
    "vendorPerformance": [...]
  }
}
```

---

### GET /api/analytics/bookings
Get bookings analytics (Admin only).

**Authentication:** Required  
**Role:** admin

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalBookings": 500,
    "approvalRate": 85,
    "mostBooked": [...],
    "peakHours": [...],
    "byDayOfWeek": [...]
  }
}
```

---

### GET /api/analytics/overview
Get dashboard overview (Admin only).

**Authentication:** Required  
**Role:** admin

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalComplaints": 150,
    "totalBookings": 500,
    "totalResidents": 200,
    "totalVendors": 15,
    "openComplaints": 20,
    "pendingBookings": 10
  }
}
```

---

## File Upload Endpoints

### POST /api/upload/complaint-image
Upload single image for complaint.

**Authentication:** Required  
**Content-Type:** multipart/form-data  
**Rate Limit:** 10 requests per 15 minutes

**Form Data:**
- `image` - Image file (max 5MB, formats: jpeg, jpg, png, gif, webp)

**Response (200):**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "filename": "image-1234567890.jpg",
    "url": "/uploads/complaints/image-1234567890.jpg",
    "size": 245678,
    "mimetype": "image/jpeg"
  }
}
```

---

### POST /api/upload/complaint-images
Upload multiple images (max 5).

**Authentication:** Required  
**Form Data:**
- `images` - Array of image files

**Response (200):**
```json
{
  "success": true,
  "message": "3 image(s) uploaded successfully",
  "data": [
    {
      "filename": "image1.jpg",
      "url": "/uploads/complaints/image1.jpg"
    },
    ...
  ]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid input data",
  "errors": [...]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "An error occurred on the server",
  "error": "Error details..."
}
```

---

## Rate Limiting

Some endpoints have rate limiting to prevent abuse:
- File uploads: 10 requests per 15 minutes
- Authentication: 5 requests per 15 minutes (login/register)

---

## Notes

1. All dates should be in ISO 8601 format
2. Timestamps are in UTC
3. File uploads are stored locally in `/uploads` directory
4. Email notifications are sent asynchronously via queue system
5. WebSocket support for real-time updates (optional feature)

---

## Support

For issues or questions, contact: support@smarthousing.com
