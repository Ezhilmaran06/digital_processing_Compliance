# ChangeFlow - Enterprise Change Management & Compliance Platform

A complete, production-ready MERN stack application for managing change requests with role-based access control, approval workflows, and comprehensive audit logging.

## 🚀 Features

### Core Functionality
- **Role-Based Authentication**: Secure login with role validation (Employee, Manager, Admin, Auditor)
- **Change Request Management**: Create, track, and manage change requests with approval workflows
- **Approval Lifecycle**: Employee creates → Manager approves/rejects → Auditor views
- **Audit Logging**: Immutable security audit trail for compliance tracking
- **Analytics Dashboard**: Real-time system insights and metrics

### Role-Specific Dashboards

#### Employee Dashboard
- Create and track change requests
- View personal request history
- Real-time status updates
- KPI cards (total, pending, approved, rejected)

#### Manager Dashboard
- Approve or reject pending requests
- View team activity and compliance metrics
- Manage approval queue
- Track approval rates

#### Admin Dashboard
- System-wide analytics and metrics
- User and role management
- Complete audit log viewer with CSV export
- Request governance and oversight
- Security controls

#### Auditor Dashboard
- Read-only view of approved changes
- Compliance reporting
- Change history tracking

### Security Features
- JWT-based authentication
- Role-Based Access Control (RBAC)
- Password hashing with bcrypt
- Secure HTTP headers (Helmet)
- Rate limiting
- Audit logging for all critical actions

### UI/UX
- Modern, enterprise-grade design
- Full light/dark mode support
- Responsive design (mobile-friendly)
- Smooth animations and transitions
- Professional color scheme (Indigo/Violet)
- Inter typography

## 📁 Project Structure

```
digital_compilance/
├── server/               # Backend (Node.js + Express)
│   ├── config/          # Database and JWT configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth, RBAC, audit, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── utils/           # Utilities and seed data
│   ├── validations/     # Input validation
│   └── server.js        # Entry point
└── client/              # Frontend (React + Vite)
    ├── public/          # Static assets
    └── src/
        ├── components/  # Reusable components
        ├── context/     # Auth and Theme contexts
        ├── pages/       # Dashboard pages
        ├── services/    # API service layer
        ├── App.jsx      # Main app component
        └── main.jsx     # Entry point
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **Security**: Helmet, CORS, bcrypt, express-rate-limit
- **File Upload**: Multer

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Charts**: Recharts (for analytics)
- **State Management**: Context API

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/changeflow
JWT_SECRET=your_secure_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

5. Seed the database (optional, creates test data):
```bash
npm run seed
```

6. Start the server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## 👤 Test User Credentials

After running the seed script, you can log in with these test accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@changeflow.com | admin123 |
| Manager | sarah.mitchell@company.com | manager123 |
| Employee | john.davis@company.com | employee123 |
| Employee | emily.rodriguez@company.com | employee123 |
| Auditor | client@partner.com | client123 |

⚠️ **Important**: Remember to select the correct role when logging in!

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with role validation
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile

### Requests
- `GET /api/requests` - Get all requests (role-filtered)
- `POST /api/requests` - Create new request (Employee+)
- `GET /api/requests/:id` - Get single request
- `PATCH /api/requests/:id/approve` - Approve request (Manager+)
- `PATCH /api/requests/:id/reject` - Reject request (Manager+)
- `DELETE /api/requests/:id` - Delete request (Admin only)

### Admin
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create user
- `PATCH /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/analytics` - Get system analytics
- `GET /api/admin/audit-logs` - Get audit logs
- `GET /api/admin/audit-logs/export` - Export audit logs as CSV

### File Upload
- `POST /api/upload` - Upload file attachment

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit `.env` files to version control
2. **JWT Secret**: Use a strong, randomly generated secret in production
3. **MongoDB**: Enable authentication on your MongoDB instance
4. **HTTPS**: Always use HTTPS in production
5. **Rate Limiting**: Configured to prevent abuse (100 requests per 15 minutes)
6. **Password Policy**: Minimum 8 characters required
7. **Audit Logging**: All critical actions are logged for compliance

## 🚀 Deployment

### Backend (Render/Railway)

1. Create a new web service
2. Connect your GitHub repository
3. Set environment variables:
   - `NODE_ENV=production`
   - `MONGODB_URI=<your-mongodb-atlas-uri>`
   - `JWT_SECRET=<strong-secret>`
   - `CLIENT_URL=<your-frontend-url>`
4. Build command: `npm install`
5. Start command: `npm start`

### Frontend (Vercel/Netlify)

1. Create a new site
2. Connect your GitHub repository
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Set environment variables if needed
5. Deploy

### Database (MongoDB Atlas)

1. Create a cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user
3. Whitelist your IP or allow from anywhere (0.0.0.0/0)
4. Get connection string and update `MONGODB_URI`

## 📊 Features Checklist

- [x] JWT Authentication with role validation
- [x] Role-Based Access Control (RBAC)
- [x] Employee Dashboard
- [x] Manager Dashboard with approval queue
- [x] Admin Dashboard with analytics
- [x] Auditor Dashboard (read-only)
- [x] Audit Logging System
- [x] Request CRUD operations
- [x] Approval/Rejection workflow
- [x] Light/Dark theme toggle
- [x] Responsive design
- [x] File upload support
- [x] Input validation
- [x] Error handling
- [x] Security middleware
- [x] Seed data script

## 🤝 Contributing

This is an enterprise-grade application template. Feel free to customize it for your specific use case.

## 📝 License

MIT License - feel free to use this project for your organization.

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**:
- Ensure MongoDB is running locally or check your Atlas connection string
- Verify firewall/network settings

**Port Already in Use**:
- Change the PORT in `.env` file
- Kill the process using the port: `lsof -ti:5000 | xargs kill`

**CORS Errors**:
- Verify `CLIENT_URL` in backend `.env` matches your frontend URL
- Check CORS configuration in `server.js`

**Build Errors**:
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Ensure Node.js version is 18 or higher: `node --version`

## 📞 Support

For issues or questions, please create an issue in the repository.

---

**Built with ❤️ using the MERN stack**
