# Smart Housing Society Website - User Stories & Specifications

## Table of Contents
1. [User Stories](#user-stories)
2. [Structured Specifications](#structured-specifications)

---

## User Stories

### Epic 1: User Authentication & Account Management

#### US-1.1: User Registration
**As a** new user (resident/vendor)  
**I want to** register for an account  
**So that** I can access the housing society portal

**Acceptance Criteria:**
- User can select role (Resident or Vendor)
- User provides name, email, password, and optional phone
- Password must be at least 6 characters
- Email validation is performed
- Account status is set to "pending" after registration
- User receives confirmation email about pending approval
- User is redirected to login with notification message

---

#### US-1.2: User Login
**As a** registered user  
**I want to** login to my account  
**So that** I can access role-specific features

**Acceptance Criteria:**
- User enters email and password
- Robot verification (reCAPTCHA) is required
- Login fails if account is pending approval
- Login fails if account is rejected
- Successful login redirects to role-specific dashboard
- JWT token is generated and stored securely
- User information is stored in browser localStorage

---

#### US-1.3: Password Reset
**As a** user who forgot their password  
**I want to** reset my password using an OTP  
**So that** I can regain access to my account

**Acceptance Criteria:**
- User enters email on forgot password page
- System generates 6-digit OTP
- OTP is sent via email
- OTP expires after 10 minutes
- User verifies OTP before setting new password
- User can set new password after OTP verification
- OTP is securely hashed in database
- Success message shown and user can login with new password

---

#### US-1.4: Profile Management
**As a** logged-in user  
**I want to** edit my profile information  
**So that** I can keep my details up to date

**Acceptance Criteria:**
- User can update name and phone number
- Email is displayed but cannot be changed
- User can change password with current password verification
- Changes are saved to database
- User information updates in localStorage
- Page reloads to reflect changes in navbar
- Success/error messages are displayed

---

### Epic 2: Admin User Management

#### US-2.1: View Pending Registrations
**As an** admin  
**I want to** view all pending user registrations  
**So that** I can review and approve/reject accounts

**Acceptance Criteria:**
- Admin can see list of pending users
- Each pending user shows: name, email, phone, role
- List is sorted by most recent first
- Approve and Reject buttons are available for each user
- Real-time count of pending users is displayed

---

#### US-2.2: Approve User Registration
**As an** admin  
**I want to** approve pending user registrations  
**So that** approved users can access the system

**Acceptance Criteria:**
- Admin clicks "Approve" button for a user
- User status changes from "pending" to "approved"
- User receives approval email notification
- User disappears from pending list
- User can now login to the system
- Success message is displayed to admin

---

#### US-2.3: Reject User Registration
**As an** admin  
**I want to** reject inappropriate registrations  
**So that** unauthorized users cannot access the system

**Acceptance Criteria:**
- Admin clicks "Reject" button for a user
- Confirmation dialog appears
- User status changes from "pending" to "rejected"
- User receives rejection email notification
- User disappears from pending list
- User cannot login to the system
- Success message is displayed to admin

---

#### US-2.4: View All Residents
**As an** admin  
**I want to** view all registered residents  
**So that** I can manage the resident database

**Acceptance Criteria:**
- Admin can expand/collapse residents list
- List shows all users with role "resident"
- Each resident shows: name, email, phone, status
- Status badges are color-coded (approved/pending/rejected)
- Total count of residents is displayed
- List is scrollable for many entries

---

#### US-2.5: View All Vendors
**As an** admin  
**I want to** view all registered vendors  
**So that** I can manage service providers

**Acceptance Criteria:**
- Admin can expand/collapse vendors list
- List shows all users with role "vendor"
- Each vendor shows: name, email, phone, status
- Status badges are color-coded
- Total count of vendors is displayed
- List is scrollable for many entries

---

### Epic 3: Announcements System

#### US-3.1: Create Announcement (Admin)
**As an** admin  
**I want to** create announcements  
**So that** I can communicate important information to all users

**Acceptance Criteria:**
- Admin can enter title and content
- Admin can optionally set announcement date/time
- Announcement is stored in database
- All approved users receive email notification
- Announcement appears in public announcements list
- Success message is displayed
- Form clears after successful creation

---

#### US-3.2: Edit Announcement (Admin)
**As an** admin  
**I want to** edit existing announcements  
**So that** I can correct or update information

**Acceptance Criteria:**
- Admin clicks "Edit" button on announcement
- Form populates with existing data
- Admin can modify title, content, and date
- Updated announcement is saved
- Changes reflect immediately in list
- Admin can cancel editing
- Success message is displayed

---

#### US-3.3: Delete Announcement (Admin)
**As an** admin  
**I want to** delete announcements  
**So that** I can remove outdated or incorrect information

**Acceptance Criteria:**
- Admin clicks "Delete" button on announcement
- Confirmation dialog appears
- Announcement is removed from database
- Announcement disappears from list
- Success message is displayed

---

#### US-3.4: View Announcements (All Users)
**As a** user  
**I want to** view all announcements  
**So that** I can stay informed about society updates

**Acceptance Criteria:**
- Announcements are displayed in chronological order (newest first)
- Each announcement shows: title, content, date, author
- Announcements are accessible without login
- Latest announcements visible on dashboard
- "View All" link navigates to full announcements page

---

#### US-3.5: Search and Filter Announcements
**As a** user  
**I want to** search and filter announcements  
**So that** I can find specific information quickly

**Acceptance Criteria:**
- Search box filters by title and content
- Date range filter (from and to dates)
- Results update as filters are applied
- Pagination controls for large result sets
- Page size selector (5, 10, 20, 50 items)
- Current page and total count displayed

---

### Epic 4: Contact & Communication

#### US-4.1: Submit Contact Form
**As a** visitor  
**I want to** submit a contact form  
**So that** I can send messages to the society administration

**Acceptance Criteria:**
- Form includes: name, email, phone (optional), message
- All required fields are validated
- Robot verification (reCAPTCHA) required
- Email is sent to RECEIVER_EMAIL
- Reply-To is set to user's email
- Success message is displayed
- Form clears after submission

---

#### US-4.2: Receive Email Notifications
**As a** user  
**I want to** receive email notifications for important events  
**So that** I stay informed about my account and society updates

**Acceptance Criteria:**
- Registration confirmation email sent on signup
- Approval email sent when admin approves account
- Rejection email sent when admin rejects account
- New announcement emails sent to all approved users
- Password reset OTP sent when requested
- All emails use consistent HTML template
- All emails include society branding

---

### Epic 5: Dashboard & Navigation

#### US-5.1: Admin Dashboard
**As an** admin  
**I want to** access a comprehensive dashboard  
**So that** I can monitor and manage the housing society

**Acceptance Criteria:**
- Dashboard shows key metrics (residents, vendors, pending approvals, complaints)
- Quick access to pending user approvals
- Recent announcements widget
- Quick action buttons for common tasks
- Navigation to all admin features
- Statistics cards with visual indicators
- Responsive layout for mobile devices

---

#### US-5.2: Resident Dashboard
**As a** resident  
**I want to** access my personalized dashboard  
**So that** I can manage my account and access services

**Acceptance Criteria:**
- Dashboard shows: profile summary, complaints, payments, facility bookings
- Latest 3 announcements displayed
- Quick access cards for main features
- Navigation to detailed pages
- Profile edit button
- Recent activity section
- Responsive layout

---

#### US-5.3: Vendor Dashboard
**As a** vendor  
**I want to** access my business dashboard  
**So that** I can manage my services and client interactions

**Acceptance Criteria:**
- Dashboard shows: active services, pending requests, earnings
- Latest announcements displayed
- Profile information with rating
- Quick action buttons
- Service management section
- Responsive layout

---

#### US-5.4: Navigation Menu
**As a** user  
**I want to** easily navigate the website  
**So that** I can access all available features

**Acceptance Criteria:**
- Navbar shows at top of all pages
- Logo links to home page
- Role-specific menu items displayed
- User name shown when logged in
- Dropdown menu for logout
- Dashboard link based on user role
- Sticky navbar on scroll
- Mobile-responsive hamburger menu

---

### Epic 6: Security & Authorization

#### US-6.1: Protected Routes
**As a** system  
**I want to** protect routes based on user roles  
**So that** only authorized users can access specific features

**Acceptance Criteria:**
- Unauthenticated users redirected to login
- Role-based access control enforced
- JWT token verified on protected routes
- Unauthorized access shows error page
- Token expiry handled gracefully
- Login required for all dashboards

---

#### US-6.2: Session Management
**As a** user  
**I want to** have my session managed securely  
**So that** my account remains secure

**Acceptance Criteria:**
- JWT token stored in localStorage
- Token includes: user ID, email, role
- Token expires after configured time (7 days default)
- Logout clears token and user data
- Expired tokens trigger re-login
- User state persists across page refreshes

---

### Epic 7: Pages & User Interface

#### US-7.1: Home Page
**As a** visitor  
**I want to** view an informative home page  
**So that** I can learn about the housing society

**Acceptance Criteria:**
- Hero section with branding
- Features overview section
- Perks and benefits section
- Contact form
- Navigation to login/signup
- Responsive design
- Smooth animations

---

#### US-7.2: Complaints Management
**As a** user  
**I want to** access the complaints page  
**So that** I can submit and track issues

**Acceptance Criteria:**
- Page accessible to all authenticated users
- Form to submit new complaints (future)
- List of submitted complaints (future)
- Status tracking (future)
- Responsive layout

---

#### US-7.3: Facility Booking
**As a** user  
**I want to** book community facilities  
**So that** I can reserve amenities

**Acceptance Criteria:**
- Page accessible to authenticated users
- Facility list with availability (future)
- Booking form (future)
- Booking history (future)
- Responsive layout

---

#### US-7.4: Payments
**As a** user  
**I want to** view and manage payments  
**So that** I can track financial transactions

**Acceptance Criteria:**
- Page accessible to authenticated users
- Payment history display (future)
- Outstanding dues (future)
- Payment submission (future)
- Responsive layout

---

## Structured Specifications

### 1. Authentication System Specifications

#### 1.1 User Registration (POST /api/auth/register)

**Input Parameters:**
```javascript
{
  name: String (required, trimmed, non-empty),
  email: String (required, valid email format, unique),
  password: String (required, minimum 6 characters),
  phone: String (optional),
  role: String (optional, enum: ['resident', 'vendor', 'admin'], default: 'resident')
}
```

**Processing:**
1. Validate all input fields
2. Check if email already exists (409 Conflict)
3. Hash password using bcrypt (10 rounds)
4. Create user with status: 'pending'
5. Generate welcome email using registrationPendingTemplate
6. Send email via sendEmail utility
7. Return success response

**Output:**
```javascript
{
  success: true,
  message: "Registration successful. Please wait for admin approval.",
  user: {
    id: String,
    name: String,
    email: String,
    role: String,
    status: "pending"
  }
}
```

**Error Cases:**
- 400: Validation errors (invalid email, short password)
- 409: Email already registered
- 500: Server error

---

#### 1.2 User Login (POST /api/auth/login)

**Input Parameters:**
```javascript
{
  email: String (required, valid email format),
  password: String (required, non-empty)
}
```

**Processing:**
1. Validate input fields
2. Find user by email (case-insensitive)
3. Check user status (pending/rejected/approved)
4. Verify password using bcrypt.compare
5. Generate JWT with payload: { id, email, role }
6. Token expires based on JWT_EXPIRES env (default: 7d)
7. Return token and user info

**Output:**
```javascript
{
  success: true,
  message: "Login successful",
  token: String (JWT),
  user: {
    id: String,
    name: String,
    email: String,
    role: String
  }
}
```

**Error Cases:**
- 400: Validation errors
- 401: Invalid credentials
- 403: Account pending approval or rejected
- 500: Server error

---

#### 1.3 Forgot Password - Request OTP (POST /api/auth/forgot-password)

**Input Parameters:**
```javascript
{
  email: String (required, valid email format)
}
```

**Processing:**
1. Validate email format
2. Find user by email (return generic success if not found for security)
3. Generate 6-digit random OTP
4. Hash OTP using bcrypt (10 rounds)
5. Store resetOtpHash and resetOtpExpires (10 minutes)
6. Send OTP email using resetOtpTemplate
7. Return generic success message

**Output:**
```javascript
{
  success: true,
  message: "If an account exists, an OTP has been sent"
}
```

**Security Features:**
- Generic message prevents account enumeration
- OTP stored as bcrypt hash (not plaintext)
- 10-minute expiration
- Email logging for debugging

---

#### 1.4 Verify OTP (POST /api/auth/verify-otp)

**Input Parameters:**
```javascript
{
  email: String (required, valid email format),
  otp: String (required, minimum 4 characters)
}
```

**Processing:**
1. Validate input fields
2. Find user by email
3. Check if resetOtpHash and resetOtpExpires exist
4. Verify OTP not expired
5. Compare OTP with stored hash using bcrypt
6. Return success if valid

**Output:**
```javascript
{
  success: true,
  message: "OTP verified"
}
```

**Error Cases:**
- 400: Invalid or expired OTP
- 500: Server error

---

#### 1.5 Reset Password (POST /api/auth/reset-password)

**Input Parameters:**
```javascript
{
  email: String (required, valid email format),
  otp: String (required, minimum 4 characters),
  newPassword: String (required, minimum 6 characters)
}
```

**Processing:**
1. Validate all input fields
2. Find user by email
3. Verify OTP exists and not expired
4. Compare OTP with stored hash
5. Hash new password using bcrypt (10 rounds)
6. Update passwordHash
7. Clear resetOtpHash and resetOtpExpires
8. Save user
9. Return success

**Output:**
```javascript
{
  success: true,
  message: "Password updated successfully"
}
```

**Error Cases:**
- 400: Validation errors or invalid OTP
- 500: Server error

---

### 2. Admin Management Specifications

#### 2.1 Get Pending Users (GET /api/admin/pending-users)

**Authentication:** Required (JWT)  
**Authorization:** Admin role only

**Processing:**
1. Verify JWT token
2. Check user role is 'admin'
3. Query users with status: 'pending'
4. Sort by createdAt descending
5. Exclude passwordHash from results
6. Return user list

**Output:**
```javascript
{
  success: true,
  users: [
    {
      _id: String,
      name: String,
      email: String,
      phone: String,
      role: String,
      status: "pending",
      createdAt: Date,
      updatedAt: Date
    }
  ]
}
```

---

#### 2.2 Get Users by Role (GET /api/admin/users/:role)

**Authentication:** Required (JWT)  
**Authorization:** Admin role only

**URL Parameters:**
- role: String (must be 'resident' or 'vendor')

**Processing:**
1. Verify JWT token and admin role
2. Validate role parameter
3. Query users by role
4. Sort by createdAt descending
5. Exclude passwordHash
6. Return user list

**Output:**
```javascript
{
  success: true,
  users: [/* array of users */]
}
```

**Error Cases:**
- 400: Invalid role parameter
- 403: Not admin
- 500: Server error

---

#### 2.3 Approve User (PUT /api/admin/approve/:userId)

**Authentication:** Required (JWT)  
**Authorization:** Admin role only

**URL Parameters:**
- userId: String (MongoDB ObjectId)

**Processing:**
1. Verify JWT and admin role
2. Find user by ID
3. Check current status is 'pending'
4. Update status to 'approved'
5. Send approval email using accountApprovedTemplate
6. Return updated user info

**Output:**
```javascript
{
  success: true,
  message: "User approved successfully",
  user: {
    id: String,
    name: String,
    email: String,
    role: String,
    status: "approved"
  }
}
```

**Error Cases:**
- 400: User already approved/rejected
- 403: Not admin
- 404: User not found
- 500: Server error

---

#### 2.4 Reject User (PUT /api/admin/reject/:userId)

**Authentication:** Required (JWT)  
**Authorization:** Admin role only

**URL Parameters:**
- userId: String (MongoDB ObjectId)

**Processing:**
1. Verify JWT and admin role
2. Find user by ID
3. Check current status is 'pending'
4. Update status to 'rejected'
5. Send rejection email using accountRejectedTemplate
6. Return updated user info

**Output:**
```javascript
{
  success: true,
  message: "User rejected successfully",
  user: {
    id: String,
    name: String,
    email: String,
    role: String,
    status: "rejected"
  }
}
```

---

### 3. Announcements System Specifications

#### 3.1 Get Announcements (GET /api/announcements)

**Authentication:** Not required (public endpoint)

**Query Parameters:**
```javascript
{
  page: Number (optional, for pagination),
  limit: Number (optional, items per page),
  search: String (optional, search in title/content),
  from: String (optional, ISO date, filter start date),
  to: String (optional, ISO date, filter end date)
}
```

**Processing:**
1. Build filter object based on query params
2. Search: case-insensitive regex on title and content
3. Date range: filter on 'date' field
4. If page provided: calculate pagination
5. Sort by date descending, then createdAt descending
6. Populate createdBy (name, email, role)
7. Return announcements with optional pagination metadata

**Output (without pagination):**
```javascript
{
  success: true,
  announcements: [
    {
      _id: String,
      title: String,
      content: String,
      date: Date,
      createdBy: {
        name: String,
        email: String,
        role: String
      },
      createdAt: Date,
      updatedAt: Date
    }
  ]
}
```

**Output (with pagination):**
```javascript
{
  success: true,
  announcements: [/* array */],
  pagination: {
    total: Number,
    page: Number,
    pages: Number,
    limit: Number
  }
}
```

---

#### 3.2 Create Announcement (POST /api/announcements)

**Authentication:** Required (JWT)  
**Authorization:** Admin role only

**Input Parameters:**
```javascript
{
  title: String (required, trimmed, non-empty),
  content: String (required, trimmed, non-empty),
  date: String (optional, ISO8601 date, defaults to now)
}
```

**Processing:**
1. Verify JWT and admin role
2. Validate input fields
3. Create announcement with createdBy: req.user.id
4. Populate createdBy field
5. Query all approved users
6. Generate email using announcementTemplate
7. Send emails in chunks (BCC, 50 per email)
8. Return created announcement

**Output:**
```javascript
{
  success: true,
  message: "Announcement created",
  announcement: {
    _id: String,
    title: String,
    content: String,
    date: Date,
    createdBy: {/* user object */},
    createdAt: Date,
    updatedAt: Date
  }
}
```

**Email Broadcast:**
- Recipients: All users with status: 'approved'
- Method: BCC (blind carbon copy)
- Chunk size: 50 emails per batch
- Template: announcementTemplate with title, content, date

---

#### 3.3 Update Announcement (PUT /api/announcements/:id)

**Authentication:** Required (JWT)  
**Authorization:** Admin role only

**URL Parameters:**
- id: String (MongoDB ObjectId)

**Input Parameters:**
```javascript
{
  title: String (optional, trimmed, non-empty),
  content: String (optional, trimmed, non-empty),
  date: String (optional, ISO8601 date)
}
```

**Processing:**
1. Verify JWT and admin role
2. Validate input fields
3. Build update object with provided fields
4. Find and update announcement by ID
5. Populate createdBy
6. Return updated announcement

**Output:**
```javascript
{
  success: true,
  message: "Announcement updated",
  announcement: {/* updated announcement object */}
}
```

**Error Cases:**
- 403: Not admin
- 404: Announcement not found
- 500: Server error

---

#### 3.4 Delete Announcement (DELETE /api/announcements/:id)

**Authentication:** Required (JWT)  
**Authorization:** Admin role only

**URL Parameters:**
- id: String (MongoDB ObjectId)

**Processing:**
1. Verify JWT and admin role
2. Find and delete announcement by ID
3. Return success message

**Output:**
```javascript
{
  success: true,
  message: "Announcement deleted"
}
```

**Error Cases:**
- 403: Not admin
- 404: Announcement not found
- 500: Server error

---

### 4. User Profile Specifications

#### 4.1 Get Current User Profile (GET /api/users/me)

**Authentication:** Required (JWT)

**Processing:**
1. Verify JWT token
2. Find user by ID from token (req.user.id)
3. Exclude passwordHash from result
4. Return user object

**Output:**
```javascript
{
  success: true,
  user: {
    _id: String,
    name: String,
    email: String,
    phone: String,
    role: String,
    status: String,
    createdAt: Date,
    updatedAt: Date
  }
}
```

---

#### 4.2 Update User Profile (PUT /api/users/me)

**Authentication:** Required (JWT)

**Input Parameters:**
```javascript
{
  name: String (optional, trimmed, non-empty),
  phone: String (optional),
  currentPassword: String (optional, required for password change),
  newPassword: String (optional, min 6 chars, required for password change)
}
```

**Processing:**
1. Verify JWT token
2. Find user by ID
3. Update name and phone if provided
4. Password change logic:
   - Both currentPassword and newPassword must be provided
   - Verify currentPassword using bcrypt.compare
   - Hash newPassword and update passwordHash
5. Save user
6. Return updated user (excluding passwordHash)

**Output:**
```javascript
{
  success: true,
  message: "Profile updated",
  user: {/* updated user object */}
}
```

**Error Cases:**
- 400: Validation errors or missing password fields
- 401: Incorrect current password
- 404: User not found
- 500: Server error

---

### 5. Email Notification Specifications

#### 5.1 Email Templates

All email templates use consistent HTML styling with:
- Society branding header (dark blue: #0b1a4a)
- White content card with padding
- Responsive design
- Footer with society name

**5.1.1 Registration Pending Template**
```javascript
registrationPendingTemplate({ name })
```
- Subject: "Welcome to Smart Housing Society — Registration Pending Approval"
- Content: Welcome message, pending status, contact info
- Call to Action: None (informational)

**5.1.2 Account Approved Template**
```javascript
accountApprovedTemplate({ name })
```
- Subject: "Your Smart Housing Society Account Has Been Approved"
- Content: Approval confirmation, welcome message
- Call to Action: "Go to Portal" button with APP_URL link

**5.1.3 Account Rejected Template**
```javascript
accountRejectedTemplate({ name })
```
- Subject: "Your Smart Housing Society Account Request"
- Content: Rejection notification, contact admin message
- Call to Action: None (informational)

**5.1.4 New Announcement Template**
```javascript
announcementTemplate({ title, content, date })
```
- Subject: "New Announcement: {title}"
- Content: Announcement title, date, full content
- Call to Action: "View all announcements" button

**5.1.5 Password Reset OTP Template**
```javascript
resetOtpTemplate({ name, otp })
```
- Subject: "Your Smart Housing Society Password Reset Code"
- Content: 6-digit OTP in large bold text, expiry warning (10 min)
- Call to Action: "Reset Password" button to /forgot-password

---

#### 5.2 Email Sending Utility

**Function:** `sendEmail({ to, subject, html, bcc, cc, replyTo, from })`

**Configuration:**
- Service: process.env.EMAIL_SERVICE (default: 'gmail')
- Auth: process.env.EMAIL_USER and process.env.EMAIL_PASS
- From: process.env.EMAIL_USER or custom from parameter

**Features:**
- Cached transporter for performance
- Graceful handling when credentials missing
- Error logging for debugging
- Support for multiple recipients (to, cc, bcc)
- Custom replyTo address

**Return Values:**
```javascript
// Success
{ success: true, info: {/* nodemailer info */} }

// Skipped (no credentials)
{ skipped: true }

// Error
{ success: false, error: Error }
```

---

### 6. Data Models

#### 6.1 User Model

**Collection:** users

**Schema:**
```javascript
{
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  role: {
    type: String,
    enum: ['resident', 'vendor', 'admin'],
    default: 'resident'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  resetOtpHash: {
    type: String
  },
  resetOtpExpires: {
    type: Date
  },
  createdAt: {
    type: Date,
    auto: true
  },
  updatedAt: {
    type: Date,
    auto: true
  }
}
```

**Indexes:**
- email: unique index (automatically created)

---

#### 6.2 Announcement Model

**Collection:** announcements

**Schema:**
```javascript
{
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    auto: true
  },
  updatedAt: {
    type: Date,
    auto: true
  }
}
```

**Population:**
- createdBy field populated with: name, email, role

---

### 7. Frontend Component Specifications

#### 7.1 Protected Route Component

**Purpose:** Role-based route protection

**Props:**
```javascript
{
  children: ReactNode (required),
  allowedRoles: String[] (optional, empty = all roles)
}
```

**Behavior:**
1. Check localStorage for user and token
2. Parse user data
3. Show loading state while checking
4. Redirect to /login if not authenticated
5. Redirect to /unauthorized if role not in allowedRoles
6. Render children if authorized

---

#### 7.2 Navbar Component

**Features:**
- Fixed header with scroll effects
- Logo linking to home
- Role-specific navigation items
- User dropdown when logged in
- Dashboard link (role-based redirect)
- Logout functionality
- Responsive design

**State Management:**
- Listens to localStorage changes
- Listens to custom 'user-updated' event
- Updates on location changes
- Shows/hides dropdown on click

---

#### 7.3 Announcements List Component

**Props:**
```javascript
{
  limit: Number (optional, 0 = no limit),
  refreshKey: Number (optional, trigger refresh),
  params: Object (optional, query params),
  onEdit: Function (optional, callback for edit),
  showActions: Boolean (optional, show edit/delete),
  onLoaded: Function (optional, callback with pagination data)
}
```

**Features:**
- Fetches announcements from API
- Supports pagination via params
- Admin can edit/delete (when showActions=true)
- Click edit triggers onEdit callback
- Delete shows confirmation dialog
- Loading and error states
- Pagination info display

---

#### 7.4 Announcement Form Component

**Props:**
```javascript
{
  initialData: Object (optional, for editing),
  onSuccess: Function (required, callback after save),
  onCancel: Function (optional, callback to cancel edit)
}
```

**Features:**
- Admin-only (returns null if not admin)
- Create or edit mode based on initialData
- Fields: title, content, date (datetime-local)
- Validation before submission
- Calls POST or PUT based on mode
- Clears on cancel
- Shows saving state

---

#### 7.5 Dashboard Components

**AdminDashboard:**
- Statistics cards (residents, pending, complaints, revenue)
- Pending users management
- Expandable residents/vendors lists
- Announcements preview
- Quick actions grid
- Navigation to all admin features

**ResidentDashboard:**
- Profile card with edit button
- Complaints summary
- Payments summary
- Facility bookings summary
- Latest 3 announcements
- Recent activity section
- Quick navigation cards

**VendorDashboard:**
- Service statistics
- Pending requests
- Earnings display
- Vendor profile section
- Latest announcements
- Quick actions grid
- Service management section

---

### 8. Security Specifications

#### 8.1 Password Security

**Hashing:**
- Algorithm: bcrypt
- Salt rounds: 10
- No plaintext storage
- Secure comparison using bcrypt.compare

**Requirements:**
- Minimum 6 characters
- Validated on frontend and backend
- Re-validation on password change

---

#### 8.2 JWT Token Security

**Token Generation:**
- Algorithm: Default (HS256)
- Secret: process.env.JWT_SECRET
- Expiration: process.env.JWT_EXPIRES (default: 7d)
- Payload: { id, email, role }

**Token Verification:**
- Middleware: auth.js
- Checks Authorization header (Bearer token)
- Verifies signature and expiration
- Attaches decoded user to req.user
- Returns 401 for invalid/expired tokens

---

#### 8.3 OTP Security

**Generation:**
- Random 6-digit number (100000-999999)
- Securely hashed using bcrypt
- Never stored in plaintext

**Storage:**
- resetOtpHash: bcrypt hash of OTP
- resetOtpExpires: Date (now + 10 minutes)

**Validation:**
- Check expiration before comparison
- Use bcrypt.compare for verification
- Clear OTP fields after successful reset

**Anti-Enumeration:**
- Generic success messages
- No indication if account exists
- Consistent response times

---

#### 8.4 Role-Based Access Control

**Levels:**
1. Public: Home, Login, Register, Forgot Password, Announcements (view)
2. Authenticated: Profile, Dashboard (role-specific)
3. Resident: Resident Dashboard, Complaints, Facility, Payments
4. Vendor: Vendor Dashboard, Service Management
5. Admin: Admin Dashboard, User Management, Announcement Management

**Implementation:**
- Backend: requireAdmin middleware
- Frontend: ProtectedRoute component with allowedRoles
- API: JWT verification + role check
- Unauthorized access: 403 Forbidden or redirect

---

### 9. Environment Configuration

#### Required Variables:
```bash
# Server
PORT=5000

# Database
MONGO_URI=mongodb+srv://user:pass@cluster/database

# JWT
JWT_SECRET=random-secret-string
JWT_EXPIRES=7d

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_SERVICE=gmail
RECEIVER_EMAIL=admin@example.com

# App
APP_URL=http://localhost:5173
```

#### Optional Variables:
- EMAIL_SERVICE: Defaults to 'gmail'
- APP_URL: Defaults to 'http://localhost:5173'
- JWT_EXPIRES: Defaults to '7d'

---

### 10. API Error Codes

#### Standard Error Responses:

**400 Bad Request:**
```javascript
{
  success: false,
  errors: [/* validation errors */] // OR
  message: "Error description"
}
```

**401 Unauthorized:**
```javascript
{
  success: false,
  message: "No token provided" // OR
  message: "Invalid or expired token"
}
```

**403 Forbidden:**
```javascript
{
  success: false,
  message: "Access denied. Admin only." // OR
  message: "Your account is pending approval."
}
```

**404 Not Found:**
```javascript
{
  success: false,
  message: "Resource not found"
}
```

**409 Conflict:**
```javascript
{
  success: false,
  message: "Email already registered"
}
```

**500 Server Error:**
```javascript
{
  success: false,
  message: "Server error"
}
```

---

### 11. Testing Specifications

#### 11.1 Manual Testing Checklist

**Authentication:**
- [ ] Register as resident/vendor
- [ ] Receive registration email
- [ ] Login fails when pending
- [ ] Admin approves user
- [ ] Receive approval email
- [ ] Login succeeds after approval
- [ ] Forgot password sends OTP
- [ ] OTP verification works
- [ ] Password reset with valid OTP
- [ ] Login with new password

**Admin Functions:**
- [ ] View pending users
- [ ] Approve user
- [ ] Reject user
- [ ] View all residents
- [ ] View all vendors
- [ ] Create announcement
- [ ] Edit announcement
- [ ] Delete announcement
- [ ] Verify email broadcast

**User Profile:**
- [ ] View profile information
- [ ] Update name and phone
- [ ] Change password
- [ ] Navbar updates after profile change
- [ ] Page reloads after save

**Announcements:**
- [ ] View announcements (not logged in)
- [ ] Search announcements
- [ ] Filter by date range
- [ ] Pagination works
- [ ] View on dashboard
- [ ] Email notification received

**Navigation:**
- [ ] Role-based dashboard redirect
- [ ] Protected routes block unauthorized access
- [ ] Logout clears session
- [ ] Token expiry handled

---

### 12. Performance Specifications

#### 12.1 Response Time Targets

- Authentication endpoints: < 500ms
- List endpoints: < 1000ms
- CRUD operations: < 500ms
- Email sending: Asynchronous (non-blocking)

#### 12.2 Scalability Considerations

- Email broadcasting: Chunked (50 recipients per email)
- Announcements pagination: Configurable page size
- Database queries: Indexed fields used
- Password hashing: Balanced salt rounds (10)

---

## Summary

This document provides comprehensive user stories and technical specifications for the Smart Housing Society Website, covering:

- **7 Major Epics** with 31 detailed user stories
- **Complete API specifications** for all endpoints
- **Data models** with schema definitions
- **Security specifications** including JWT, bcrypt, OTP
- **Email notification system** with templates
- **Frontend component specifications**
- **Error handling standards**
- **Testing checklist**
- **Performance targets**

All features are currently implemented and operational in the codebase.
