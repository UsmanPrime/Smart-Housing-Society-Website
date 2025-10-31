# Admin Approval Flow Documentation

## Overview
The admin approval flow ensures that all new user registrations must be approved by an administrator before users can log in to the system. This provides control over who can access the Smart Housing Society platform.

## How It Works

### 1. User Registration
- When a user registers, their account is created with `status: 'pending'`
- User receives a success message: "Please wait for admin approval"
- User data is stored in MongoDB with the following fields:
  - name
  - email
  - passwordHash (bcrypt hashed)
  - phone
  - role (resident/vendor/admin)
  - **status** (pending/approved/rejected) - **default: 'pending'**

### 2. Login Restriction
- Users with `status: 'pending'` cannot log in
- Error message: "Your account is pending approval. Please wait for admin verification."
- Users with `status: 'rejected'` cannot log in
- Error message: "Your account has been rejected. Please contact the administrator."
- Only users with `status: 'approved'` can successfully log in

### 3. Admin Dashboard
Admins can view and manage pending registrations:

**Location:** `/dashboard/admin`

**Features:**
- View list of all pending users
- See user details (name, email, phone, role)
- Approve or reject users with a single click
- Real-time count of pending registrations

### 4. Approval Actions

#### Approve User
- Endpoint: `PUT /api/admin/approve/:userId`
- Changes user status from 'pending' to 'approved'
- User can now log in successfully
- User is removed from pending list

#### Reject User
- Endpoint: `PUT /api/admin/reject/:userId`
- Changes user status from 'pending' to 'rejected'
- User cannot log in
- User is removed from pending list
- Admin gets confirmation dialog before rejecting

## API Endpoints

### Get Pending Users
```
GET /api/admin/pending-users
Authorization: Bearer <token>
Role: Admin only
```

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "resident",
      "status": "pending",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Approve User
```
PUT /api/admin/approve/:userId
Authorization: Bearer <token>
Role: Admin only
```

**Response:**
```json
{
  "success": true,
  "message": "User approved successfully",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "resident",
    "status": "approved"
  }
}
```

### Reject User
```
PUT /api/admin/reject/:userId
Authorization: Bearer <token>
Role: Admin only
```

**Response:**
```json
{
  "success": true,
  "message": "User rejected successfully",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "resident",
    "status": "rejected"
  }
}
```

## Security Features

1. **Authentication Required:** All admin endpoints require valid JWT token
2. **Role-Based Access:** Only users with `role: 'admin'` can access admin endpoints
3. **Status Validation:** Users can only be approved/rejected if currently pending
4. **Password Protection:** Passwords are hashed with bcrypt (10 rounds)

## User Experience Flow

```
┌─────────────────────┐
│   User Registers    │
│   status: pending   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Cannot Login Yet   │
│  (Pending Message)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Admin Reviews in    │
│ Admin Dashboard     │
└──────────┬──────────┘
           │
      ┌────┴────┐
      ▼         ▼
┌──────────┐  ┌──────────┐
│ Approve  │  │  Reject  │
│ status:  │  │ status:  │
│ approved │  │ rejected │
└────┬─────┘  └────┬─────┘
     │             │
     ▼             ▼
┌─────────┐   ┌──────────┐
│ Can Now │   │  Cannot  │
│  Login  │   │  Login   │
└─────────┘   └──────────┘
```

## Files Modified

1. **server/models/User.js** - Added `status` field with enum validation
2. **server/routes/auth.js** - Added status checks in login endpoint
3. **server/routes/admin.js** - NEW: Admin endpoints for user management
4. **server/server.js** - Mounted admin routes at `/api/admin`
5. **src/pages/dashboard/AdminDashboard.jsx** - Added pending users UI with approve/reject buttons
6. **src/pages/Register.jsx** - Updated success message to mention approval
7. **src/pages/Login.jsx** - Already displays backend error messages

## Testing the Flow

### Test as User:
1. Go to `/register`
2. Fill in details and submit
3. You'll see: "Please wait for admin approval"
4. Try to login - you'll get: "Your account is pending approval..."

### Test as Admin:
1. Login with admin credentials
2. Go to `/dashboard/admin`
3. You'll see pending users in "Pending Registrations" section
4. Click "Approve" or "Reject"
5. User status is updated immediately

### Verify Database:
```javascript
// In MongoDB, check user document:
{
  "name": "John Doe",
  "email": "john@example.com",
  "status": "approved"  // or "pending" or "rejected"
}
```

## Future Enhancements

- [ ] Email notifications when user is approved/rejected
- [ ] Bulk approve/reject functionality
- [ ] Reason field for rejections
- [ ] Ability to re-approve rejected users
- [ ] Activity log for admin actions
- [ ] Search and filter pending users
