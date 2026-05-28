# 🏠 NextGen Residency — Smart Housing Society Management Platform

<div align="center">

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_Site-0078D4?style=for-the-badge)](https://nextgen-residency.vercel.app/)
[![MERN Stack](https://img.shields.io/badge/Stack-MERN-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Security](https://img.shields.io/badge/Security-Hardened-FF0000?style=for-the-badge&logo=shield&logoColor=white)](.)

**A modern, secure, and full-featured web platform for digitizing housing society operations.**

*Built with enterprise-grade security practices by a cybersecurity student.*

🔗 **[View Live Application →](https://nextgen-residency.vercel.app/)**

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
- 🏠 Personalized dashboard with live, dynamically updating data
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
- 📊 Performance dashboard with live statistics
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
- 📱 **Two-Factor Authentication (2FA)** — Optional TOTP-based second factor with backup codes

### API Security
- 🧱 **Helmet.js** — Comprehensive HTTP security headers (CSP, HSTS, X-Frame-Options)
- 🚫 **CSRF Protection** — Double-submit cookie pattern with `csurf` middleware
- 🛑 **Rate Limiting** — Configurable per-endpoint request throttling with progressive delays
- 🧹 **Input Sanitization** — NoSQL injection prevention via `express-mongo-sanitize`
- ✅ **Server-side Validation** — All inputs validated before processing

### Data Protection
- 🔐 **Field-Level Encryption** — Sensitive data encrypted at rest
- 📁 **Secure File Handling** — Authenticated file access with no direct static serving
- 🦠 **Upload Validation** — File type verification and size limits
- 📝 **Audit Logging** — Comprehensive trail of all security-relevant events
- 🔍 **Security Event Monitoring** — Suspicious activity detection and alerting

### Frontend Security
- 🤖 **Google reCAPTCHA v2** — Bot prevention on authentication and contact forms
- 🔒 **Protected Routes** — Client-side route guards with role verification
- 🔄 **Automatic Token Refresh** — Seamless re-authentication without user interruption
- 🧹 **Secure Session Cleanup** — Complete credential clearing on logout

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
- **Live dashboard polling** — Data refreshes automatically every 15 seconds

## 📧 Contact

For questions or feedback:
- **GitHub Issues:** [Create an issue](https://github.com/UsmanPrime/Smart-Housing-Society-Website/issues)

---

<div align="center">

🔗 **[View Live Application →](https://nextgen-residency.vercel.app/)**

**Built with security in mind for smart housing communities** 🏠🔐

</div>
