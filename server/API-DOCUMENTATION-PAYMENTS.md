# Payment Management API Documentation

## Overview
This document describes the Payment Management API endpoints for the Smart Housing Society Website. These APIs handle charge creation, due management, receipt uploads, and payment verification.

---

## Base URL
```
http://localhost:5000/api/payments
```

---

## Authentication
All endpoints require JWT authentication via the `Authorization` header:
```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Create Charge (Admin Only)

**POST** `/charges/create`

Create a new monthly charge and automatically assign it to all approved residents.

#### Request Headers
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "title": "December 2024 Maintenance",
  "description": "Monthly maintenance fee for December 2024",
  "amount": 2000,
  "chargeMonth": "2024-12",
  "dueDate": "2024-12-15"
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "message": "Charge created and assigned to 50 residents",
  "data": {
    "charge": {
      "_id": "674...",
      "title": "December 2024 Maintenance",
      "description": "Monthly maintenance fee for December 2024",
      "amount": 2000,
      "chargeMonth": "2024-12",
      "createdBy": "673...",
      "status": "active",
      "createdAt": "2024-11-29T12:00:00.000Z"
    },
    "assignedCount": 50
  }
}
```

#### Error Responses
- `400 Bad Request` - Missing required fields or invalid format
- `403 Forbidden` - User is not an admin
- `500 Internal Server Error` - Server error

---

### 2. Get My Dues (Resident Only)

**GET** `/dues/my-dues?status=pending`

Get the current user's payment dues.

#### Request Headers
```
Authorization: Bearer <resident_token>
```

#### Query Parameters
- `status` (optional): Filter by status (`pending`, `paid`, `overdue`)

#### Response (200 OK)
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "674...",
      "chargeId": {
        "_id": "673...",
        "title": "December 2024 Maintenance",
        "description": "Monthly maintenance fee",
        "chargeMonth": "2024-12"
      },
      "residentId": "672...",
      "residentName": "John Doe",
      "houseNumber": "A-123",
      "email": "john@example.com",
      "amount": 2000,
      "dueDate": "2024-12-15T00:00:00.000Z",
      "status": "pending",
      "createdAt": "2024-11-29T12:00:00.000Z"
    }
  ]
}
```

#### Error Responses
- `403 Forbidden` - User is not a resident
- `500 Internal Server Error` - Server error

---

### 3. Get Specific Due Details

**GET** `/dues/:dueId`

Get details of a specific due including payment history.

#### Request Headers
```
Authorization: Bearer <token>
```

#### Path Parameters
- `dueId`: The ID of the due

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "due": {
      "_id": "674...",
      "chargeId": {
        "title": "December 2024 Maintenance",
        "amount": 2000
      },
      "residentId": {
        "name": "John Doe",
        "email": "john@example.com",
        "houseNumber": "A-123"
      },
      "amount": 2000,
      "dueDate": "2024-12-15T00:00:00.000Z",
      "status": "pending"
    },
    "payments": [
      {
        "_id": "675...",
        "amount": 2000,
        "transactionDate": "2024-12-10T00:00:00.000Z",
        "status": "verified",
        "verifiedBy": {
          "name": "Admin User"
        }
      }
    ]
  }
}
```

#### Error Responses
- `403 Forbidden` - User cannot access this due
- `404 Not Found` - Due not found
- `500 Internal Server Error` - Server error

---

### 4. Upload Payment Receipt (Resident Only)

**POST** `/receipts/upload/:dueId`

Upload a payment receipt for a specific due.

#### Request Headers
```
Authorization: Bearer <resident_token>
Content-Type: multipart/form-data
```

#### Path Parameters
- `dueId`: The ID of the due being paid

#### Request Body (Form Data)
```
receipt: <file> (image or PDF, max 5MB)
amount: 2000
transactionDate: 2024-12-10
transactionTime: 14:30
remarks: Paid via bank transfer (optional)
```

#### Response (201 Created)
```json
{
  "success": true,
  "message": "Receipt uploaded successfully. Awaiting admin verification.",
  "data": {
    "_id": "675...",
    "dueId": "674...",
    "residentId": "672...",
    "amount": 2000,
    "transactionDate": "2024-12-10T00:00:00.000Z",
    "transactionTime": "14:30",
    "receiptImageUrl": "/uploads/receipts/receipt-1732892400000-123456789.jpg",
    "remarks": "Paid via bank transfer",
    "status": "pending",
    "createdAt": "2024-11-29T14:30:00.000Z"
  }
}
```

#### Error Responses
- `400 Bad Request` - Missing file or required fields
- `403 Forbidden` - User is not a resident or doesn't own the due
- `404 Not Found` - Due not found
- `500 Internal Server Error` - Server error

---

### 5. Get Pending Payment Verifications (Admin Only)

**GET** `/receipts/pending?page=1&limit=20`

Get all pending payment verifications.

#### Request Headers
```
Authorization: Bearer <admin_token>
```

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

#### Response (200 OK)
```json
{
  "success": true,
  "count": 5,
  "total": 5,
  "data": [
    {
      "_id": "675...",
      "residentId": {
        "name": "John Doe",
        "email": "john@example.com",
        "houseNumber": "A-123"
      },
      "dueId": {
        "_id": "674...",
        "chargeId": {
          "title": "December 2024 Maintenance",
          "chargeMonth": "2024-12"
        }
      },
      "amount": 2000,
      "transactionDate": "2024-12-10T00:00:00.000Z",
      "transactionTime": "14:30",
      "receiptImageUrl": "/uploads/receipts/receipt-1732892400000-123456789.jpg",
      "remarks": "Paid via bank transfer",
      "status": "pending",
      "createdAt": "2024-11-29T14:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

#### Error Responses
- `403 Forbidden` - User is not an admin
- `500 Internal Server Error` - Server error

---

### 6. Verify Payment (Admin Only)

**PUT** `/verification/verify/:paymentId`

Approve a payment receipt and mark the due as paid.

#### Request Headers
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

#### Path Parameters
- `paymentId`: The ID of the payment to verify

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "_id": "675...",
    "dueId": "674...",
    "residentId": "672...",
    "amount": 2000,
    "status": "verified",
    "verifiedBy": "673...",
    "verifiedAt": "2024-11-29T15:00:00.000Z"
  }
}
```

#### Error Responses
- `400 Bad Request` - Payment is already verified/rejected
- `403 Forbidden` - User is not an admin
- `404 Not Found` - Payment not found
- `500 Internal Server Error` - Server error

---

### 7. Reject Payment (Admin Only)

**PUT** `/verification/reject/:paymentId`

Reject a payment receipt with a reason.

#### Request Headers
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

#### Path Parameters
- `paymentId`: The ID of the payment to reject

#### Request Body
```json
{
  "rejectionReason": "Receipt image is not clear. Please upload a clearer image."
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Payment rejected",
  "data": {
    "_id": "675...",
    "dueId": "674...",
    "residentId": "672...",
    "amount": 2000,
    "status": "rejected",
    "rejectionReason": "Receipt image is not clear. Please upload a clearer image.",
    "verifiedBy": "673...",
    "verifiedAt": "2024-11-29T15:00:00.000Z"
  }
}
```

#### Error Responses
- `400 Bad Request` - Missing rejection reason or payment already verified/rejected
- `403 Forbidden` - User is not an admin
- `404 Not Found` - Payment not found
- `500 Internal Server Error` - Server error

---

### 8. Get Payment History (Resident Only)

**GET** `/history?status=verified&from=2024-01-01&to=2024-12-31`

Get the current user's payment submission history.

#### Request Headers
```
Authorization: Bearer <resident_token>
```

#### Query Parameters
- `status` (optional): Filter by status (`pending`, `verified`, `rejected`)
- `from` (optional): Start date (YYYY-MM-DD)
- `to` (optional): End date (YYYY-MM-DD)

#### Response (200 OK)
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "675...",
      "dueId": {
        "_id": "674...",
        "chargeId": {
          "title": "December 2024 Maintenance",
          "chargeMonth": "2024-12"
        }
      },
      "amount": 2000,
      "transactionDate": "2024-12-10T00:00:00.000Z",
      "transactionTime": "14:30",
      "receiptImageUrl": "/uploads/receipts/receipt-1732892400000-123456789.jpg",
      "remarks": "Paid via bank transfer",
      "status": "verified",
      "verifiedBy": {
        "name": "Admin User"
      },
      "verifiedAt": "2024-11-29T15:00:00.000Z",
      "createdAt": "2024-11-29T14:30:00.000Z"
    }
  ]
}
```

#### Error Responses
- `403 Forbidden` - User is not a resident
- `500 Internal Server Error` - Server error

---

## Database Models

### Charge Model
```javascript
{
  title: String,              // "December 2024 Maintenance"
  description: String,        // Optional description
  amount: Number,             // PKR amount
  chargeMonth: String,        // "YYYY-MM" format
  createdBy: ObjectId,        // Admin user ID
  status: String,             // 'active' | 'archived'
  createdAt: Date,
  updatedAt: Date
}
```

### ResidentDue Model
```javascript
{
  chargeId: ObjectId,         // Reference to Charge
  residentId: ObjectId,       // Reference to User
  residentName: String,       // Denormalized
  houseNumber: String,        // Denormalized
  email: String,              // Denormalized
  amount: Number,             // PKR amount
  dueDate: Date,              // Payment deadline
  status: String,             // 'pending' | 'paid' | 'overdue'
  paidAt: Date,               // Timestamp when paid
  createdAt: Date,
  updatedAt: Date
}
```

### Payment Model
```javascript
{
  dueId: ObjectId,            // Reference to ResidentDue
  residentId: ObjectId,       // Reference to User
  amount: Number,             // PKR amount
  transactionDate: Date,      // Date of transaction
  transactionTime: String,    // Time of transaction
  receiptImageUrl: String,    // Path to uploaded file
  remarks: String,            // Optional note
  status: String,             // 'pending' | 'verified' | 'rejected'
  verifiedBy: ObjectId,       // Admin user ID
  verifiedAt: Date,           // Timestamp when verified/rejected
  rejectionReason: String,    // Reason if rejected
  createdAt: Date,
  updatedAt: Date
}
```

### AuditLog Model
```javascript
{
  userId: ObjectId,           // User who performed action
  userName: String,           // Denormalized
  userRole: String,           // 'admin' | 'resident' | 'vendor'
  action: String,             // Action type enum
  resourceType: String,       // Resource type enum
  resourceId: String,         // ID of affected resource
  details: Object,            // Additional details (JSON)
  ipAddress: String,          // Optional IP address
  timestamp: Date
}
```

---

## Testing with Postman

### 1. Create a Charge (Admin)
```
POST http://localhost:5000/api/payments/charges/create
Headers:
  Authorization: Bearer <admin_token>
  Content-Type: application/json
Body:
{
  "title": "Test Charge Dec 2024",
  "description": "Test charge",
  "amount": 2000,
  "chargeMonth": "2024-12",
  "dueDate": "2024-12-31"
}
```

### 2. Get My Dues (Resident)
```
GET http://localhost:5000/api/payments/dues/my-dues
Headers:
  Authorization: Bearer <resident_token>
```

### 3. Upload Receipt (Resident)
```
POST http://localhost:5000/api/payments/receipts/upload/<dueId>
Headers:
  Authorization: Bearer <resident_token>
Body (form-data):
  receipt: <select file>
  amount: 2000
  transactionDate: 2024-12-10
  transactionTime: 14:30
  remarks: Test payment
```

### 4. Get Pending Verifications (Admin)
```
GET http://localhost:5000/api/payments/receipts/pending
Headers:
  Authorization: Bearer <admin_token>
```

### 5. Verify Payment (Admin)
```
PUT http://localhost:5000/api/payments/verification/verify/<paymentId>
Headers:
  Authorization: Bearer <admin_token>
```

### 6. Reject Payment (Admin)
```
PUT http://localhost:5000/api/payments/verification/reject/<paymentId>
Headers:
  Authorization: Bearer <admin_token>
  Content-Type: application/json
Body:
{
  "rejectionReason": "Receipt not clear"
}
```

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid input or validation error
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User lacks required permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server-side error

---

## Audit Logging

All major actions are automatically logged to the AuditLog collection:
- `CHARGE_CREATED` - When admin creates a charge
- `PAYMENT_UPLOADED` - When resident uploads receipt
- `PAYMENT_VERIFIED` - When admin verifies payment
- `PAYMENT_REJECTED` - When admin rejects payment

Logs include:
- User ID, name, and role
- Action type
- Resource type and ID
- Additional details (JSON)
- Timestamp
- IP address (optional)

---

## Notes

1. **File Uploads**: Receipt files are stored in `server/uploads/receipts/`
2. **File Size Limit**: Maximum 5MB per file
3. **Allowed File Types**: JPG, JPEG, PNG, GIF, WEBP, PDF
4. **Auto-Assignment**: Creating a charge automatically creates dues for all approved residents
5. **Overdue Detection**: The system automatically updates pending dues to overdue when accessed after the due date
6. **Authorization**: Residents can only access their own dues and payments; admins have full access

---

*Last Updated: November 29, 2024*
