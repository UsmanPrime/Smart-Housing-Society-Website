# 🏠 NextGen Residency

NextGen Residency is a centralized web platform designed to digitize and streamline the operational workflow of modern housing societies. Built by Team RDX, this solution replaces inefficient manual processes with a unified, transparent, and automated system.

The platform features a robust Triple-Portal Architecture:

👤 Resident Portal: For seamless complaint registration, facility booking, and payment receipt uploads.

🛡️ Administrator Portal: For managing users, verifying financial records, and broadcasting announcements.

🛠️ Vendor Portal: For receiving tasks, updating work status, and ensuring service accountability.

Built With: MongoDB, Express.js, React.js, Node.js (MERN Stack).

## 🚀 Features

### For Residents
- 🏠 Dashboard with quick access to all services
- 📢 View community announcements
- 🛠️ Submit and track maintenance complaints
- 🎾 Book facilities (swimming pool, gym, tennis court, etc.)
- 👤 Manage profile and account settings
- 📧 Receive email notifications for bookings and complaints

### For Vendors
- 📋 View assigned work/complaints
- ✅ Update work status (in-progress, resolved)
- 💬 Add work notes and comments
- 📊 Performance dashboard with statistics
- 🔔 Email notifications for new assignments

### For Administrators
- 👥 User management (approve/reject registrations)
- 🛠️ Complaint management (assign to vendors, track status)
- 📅 Facility booking management (approve/reject)
- 📊 Analytics dashboard with charts and reports
- 📢 Create announcements for community
- 📈 View system-wide statistics and trends

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Icon library
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Nodemailer** - Email service
- **Multer** - File upload handling
- **bcryptjs** - Password hashing

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Gmail account for email notifications (or other SMTP)

## 🚀 Installation

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd Smart-Housing-Society-Website
```

### 2. Install dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd server
npm install
```

### 3. Configure environment variables

Create `.env` file in the `server/` directory:

```env
# Database
MONGO_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/smart-housing-db

# JWT
JWT_SECRET=your-secret-key-here

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
RECEIVER_EMAIL=admin@example.com

# Server
PORT=5000

# Frontend URL (for email links)
APP_URL=http://localhost:5173
```

**Important:** 
- For Gmail, you need to use an [App Password](https://support.google.com/accounts/answer/185833)
- Never commit the `.env` file to version control

### 4. Start the application

**Start Backend (Terminal 1):**
```bash
cd server
npm start
```

**Start Frontend (Terminal 2):**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📁 Project Structure

```
Smart-Housing-Society-Website/
├── server/                      # Backend
│   ├── models/                  # MongoDB schemas
│   ├── routes/                  # API endpoints
│   ├── middleware/              # Custom middleware
│   ├── utils/                   # Utility functions
│   ├── uploads/                 # Uploaded files
│   ├── server.js                # Main server file
│   └── API-DOCUMENTATION.md     # API reference
│
├── src/                         # Frontend
│   ├── components/              # React components
│   ├── pages/                   # Page components
│   ├── hooks/                   # Custom React hooks
│   ├── services/                # API services
│   ├── lib/                     # Utilities
│   ├── assets/                  # Static assets
│   ├── App.jsx                  # Main app component
│   └── main.jsx                 # Entry point
│
├── public/                      # Public assets
├── vite.config.js               # Vite configuration
└── tailwind.config.cjs          # Tailwind configuration
```

## 📖 API Documentation

Complete API documentation is available in `server/API-DOCUMENTATION.md`.

### Key Endpoints:

**Authentication:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Request password reset

**Complaints:**
- `POST /api/complaints` - Create complaint
- `GET /api/complaints` - List complaints
- `PUT /api/complaints/:id` - Update complaint
- `POST /api/complaints/:id/comments` - Add comment

**Bookings:**
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - List bookings
- `PUT /api/bookings/:id/approve` - Approve booking (admin)
- `PUT /api/bookings/:id/reject` - Reject booking (admin)

**Analytics:**
- `GET /api/analytics/complaints` - Complaints analytics
- `GET /api/analytics/bookings` - Bookings analytics
- `GET /api/analytics/overview` - System overview

## 🧪 Testing

### Manual Testing

1. **User Registration Flow:**
   - Go to `/register`
   - Fill form and submit
   - Check email for registration notification
   - Admin approves user
   - User receives approval email

2. **Complaint Flow:**
   - Resident creates complaint
   - Admin assigns to vendor
   - Vendor receives email notification
   - Vendor updates status
   - Resident receives status update email

3. **Booking Flow:**
   - Resident books facility
   - Admin receives notification
   - Admin approves/rejects
   - Resident receives confirmation email
   - 1 hour before booking, reminder email sent

## 🔐 Default Admin Account

For initial setup, you can create an admin account manually in MongoDB:

```javascript
{
  name: "Admin",
  email: "admin@smarthousing.com",
  password: "$2a$10$...", // Use bcryptjs to hash password
  role: "admin",
  status: "approved"
}
```

Or use the migration script:
```bash
cd server
node migrations/create-admin.js
```

## 🎨 Customization

### Update Branding
- Logo: Replace `public/logo.svg`
- Colors: Edit `tailwind.config.cjs`
- Email templates: Edit `server/utils/emailTemplates.js`

### Add New Features
- Frontend: Add components in `src/components/`
- Backend: Add routes in `server/routes/`
- Models: Add schemas in `server/models/`

## 📦 Production Deployment

### Build Frontend
```bash
npm run build
```

### Deploy Backend
1. Set up MongoDB Atlas
2. Configure environment variables on hosting platform
3. Deploy to Heroku, Vercel, or AWS

### Environment Variables (Production)
Update all URLs to production values:
- `APP_URL` - Your production frontend URL
- `MONGO_URI` - Production MongoDB connection string

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 📧 Support

For issues or questions:
- Email: uarmy285@gmail.com
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)

## 🙏 Acknowledgments

- React team for the amazing library
- Tailwind CSS for the utility-first framework
- MongoDB for the flexible database
- All contributors and testers

---

**Built with ❤️ for Smart Housing Communities**
