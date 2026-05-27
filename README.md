# 🏠 NextGen Residency — Smart Housing Society Management Platform

<div align="center">

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Security](https://img.shields.io/badge/Security-Hardened-FF0000?style=for-the-badge&logo=shield&logoColor=white)](.)

**A modern, secure, and full-featured web platform for digitizing housing society operations.**

*Built with enterprise-grade security practices by a cybersecurity student.*

---

</div>

## 📋 Overview

NextGen Residency is a centralized web platform designed to digitize and streamline the operational workflow of modern housing societies. It replaces inefficient manual processes with a unified, transparent, and automated system built on the **MERN Stack** (MongoDB, Express.js, React.js, Node.js).

The platform implements a **Triple-Portal Architecture**:

| Portal | Description |
|--------|-------------|
| 👤 **Resident** | Complaint registration, facility booking, payment management |
| 🛡️ **Administrator** | User management, financial verification, announcements |
| 🛠️ **Vendor** | Task management, work status updates, service accountability |

## 🚀 Features

### Resident Portal
- 🏠 Personalized dashboard with quick access to all services
- 📢 Real-time community announcements
- 🛠️ Submit and track maintenance complaints with status updates
- 🎾 Book community facilities (pool, gym, tennis court, etc.)
- 💳 Upload payment receipts and track dues
- 👤 Profile management with secure account settings
- 📧 Email notifications for bookings, complaints, and updates

### Vendor Portal
- 📋 View and manage assigned complaints/work orders
- ✅ Real-time work status updates (in-progress → resolved)
- 💬 Add work notes and communicate with admins
- 📊 Performance dashboard with statistics
- 🔔 Email notifications for new assignments

### Administrator Portal
- 👥 User management with approval workflow
- 🛠️ Complaint lifecycle management (assign → track → resolve)
- 📅 Facility booking approvals and scheduling
- 📊 Analytics dashboard with interactive charts and reports
- 📢 Community announcement broadcasting
- 📈 System-wide statistics, trends, and audit logs
- 💰 Payment verification and financial oversight

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | Component-based UI library |
| **Vite** | Next-gen build tool & dev server |
| **Tailwind CSS** | Utility-first styling framework |
| **React Router v7** | Client-side routing & navigation |
| **TanStack Query** | Server state management & caching |
| **Axios** | HTTP client with interceptors |
| **Recharts** | Interactive data visualization |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js + Express** | RESTful API server |
| **MongoDB + Mongoose** | NoSQL database & ODM |
| **JWT** | Stateless authentication with refresh tokens |
| **bcryptjs** | Password hashing (salted) |
| **Nodemailer** | Transactional email service |
| **Multer** | Secure file upload handling |

## 🔐 Security Architecture

This platform was developed with a **security-first mindset**, implementing multiple layers of defense:

### Authentication & Authorization
- 🔑 **JWT with Refresh Tokens** — Short-lived access tokens + long-lived refresh tokens
- 🔒 **Token Fingerprinting** — Binds tokens to client characteristics to prevent token theft
- 🛡️ **Role-Based Access Control (RBAC)** — Granular permissions across three user roles
- 🔐 **bcrypt Password Hashing** — Salted hashing with configurable work factor
- 📱 **Two-Factor Authentication (2FA)** — Optional TOTP-based second factor

### API Security
- 🧱 **Helmet.js** — Comprehensive HTTP security headers (CSP, HSTS, X-Frame-Options)
- 🚫 **CSRF Protection** — Double-submit cookie pattern with `csurf` middleware
- 🛑 **Rate Limiting** — Configurable per-endpoint request throttling
- 🧹 **Input Sanitization** — NoSQL injection prevention via `express-mongo-sanitize`
- ✅ **Server-side Validation** — All inputs validated before processing

### Data Protection
- 🔐 **Field-Level Encryption** — Sensitive data encrypted at rest
- 📁 **Secure File Handling** — Authenticated file access (no direct static serving)
- 🦠 **Upload Validation** — File type verification and size limits
- 📝 **Audit Logging** — Comprehensive trail of security-relevant events
- 🔍 **Security Event Monitoring** — Suspicious activity detection and logging

### Frontend Security
- 🤖 **Google reCAPTCHA v2** — Bot prevention on authentication and contact forms
- 🔒 **Protected Routes** — Client-side route guards with role verification
- 🔄 **Automatic Token Refresh** — Seamless re-authentication without user interruption
- 🧹 **Secure Session Cleanup** — Complete credential clearing on logout

## 📋 Prerequisites

- **Node.js** v16 or higher
- **MongoDB** (local instance or MongoDB Atlas cloud)
- **Gmail account** with App Password for email notifications

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/UsmanPrime/Smart-Housing-Society-Website.git
cd Smart-Housing-Society-Website
```

### 2. Install Dependencies

```bash
# Frontend dependencies
npm install

# Backend dependencies
cd server
npm install
cd ..
```

### 3. Configure Environment Variables

Copy the example files and configure with your own credentials:

```bash
# Frontend
cp .env.example .env.development

# Backend
cd server
# Create .env file with your database, email, and security keys
```

> ⚠️ **Security Note:** Never commit `.env` files to version control. All sensitive configuration is excluded via `.gitignore`.

### 4. Start the Application

```bash
# Terminal 1 — Backend Server
cd server
npm start

# Terminal 2 — Frontend Dev Server
npm run dev
```

The application will be available at:
- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000`

## 📁 Project Structure

```
Smart-Housing-Society-Website/
├── server/                      # Backend API
│   ├── middleware/               # Auth, rate limiting, validation, upload security
│   ├── models/                   # MongoDB schemas (User, Complaint, Booking, etc.)
│   ├── routes/                   # RESTful API endpoints
│   ├── utils/                    # Email, encryption, logging, token services
│   ├── migrations/               # Database seeding scripts
│   └── server.js                 # Express application entry point
│
├── src/                          # React Frontend
│   ├── components/               # Reusable UI components
│   │   ├── Admin/                # Admin-specific components
│   │   ├── Security/             # 2FA, security prompts
│   │   ├── complaints/           # Complaint management UI
│   │   ├── facility/             # Facility booking UI
│   │   ├── vendor/               # Vendor portal components
│   │   └── Payment/              # Payment management UI
│   ├── pages/                    # Page-level components
│   │   ├── admin/                # Admin pages (audit, reports, charges)
│   │   └── dashboard/            # Role-specific dashboards
│   ├── hooks/                    # Custom React hooks (auth, CSRF, state)
│   ├── services/                 # API service layer
│   ├── lib/                      # HTTP client, utilities
│   ├── styles/                   # Global CSS & animations
│   └── assets/                   # Images, icons
│
├── public/                       # Static assets
├── .env.example                  # Environment variable template
├── vite.config.js                # Build configuration
└── tailwind.config.cjs           # Styling configuration
```

## 🎨 Design & UX

- **Glassmorphism** navigation with dynamic blur effects
- **Parallax scrolling** hero section with gradient overlays
- **Intersection Observer** powered scroll-reveal animations
- **Staggered card transitions** with cubic-bezier timing
- **Responsive design** with mobile hamburger navigation
- **Custom scrollbar** and smooth scroll-to-top functionality
- **Premium gradient** color system throughout all components

## 📦 Production Deployment

### Build Frontend
```bash
npm run build
```

### Deploy
1. **Frontend** → Vercel or any static hosting
2. **Backend** → Render, Railway, or any Node.js hosting
3. **Database** → MongoDB Atlas (cloud)

> Set all environment variables on your hosting platform. Never hardcode credentials.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit changes (`git commit -m 'Add YourFeature'`)
4. Push to branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 📧 Contact

For questions or issues:
- **GitHub Issues:** [Create an issue](https://github.com/UsmanPrime/Smart-Housing-Society-Website/issues)

---

<div align="center">

**Built with security in mind for smart housing communities** 🏠🔐

</div>
