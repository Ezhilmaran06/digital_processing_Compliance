import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import errorHandler, { notFound } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import requestRoutes from './routes/requests.js';
import adminRoutes from './routes/admin.js';
import managerRoutes from './routes/manager.js';
import uploadRoutes from './routes/upload.js';

// Load environment variables
dotenv.config();

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to database
await connectDB();

// Initialize Express app
const app = express();

/**
 * Security Middleware
 */

// Helmet - Set security headers
app.use(helmet());

// CORS - Enable Cross-Origin Resource Sharing
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));

/**
 * Body Parser Middleware
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting - Prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api', limiter);

/**
 * Logging Middleware
 */
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

/**
 * Static Files
 */
// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/**
 * Global Request Logger (Diagnostic)
 */
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// Infrastructure Verification Route
app.get('/api/verify-server', (req, res) => res.json({
    success: true,
    message: 'Infrastructure is active',
    timestamp: new Date().toISOString()
}));

/**
 * API Routes
 */
// Diagnostic Route
app.get('/api/auth/ping', (req, res) => res.json({ success: true, message: 'Auth ping ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api', uploadRoutes);

/**
 * Health Check
 */
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});

/**
 * Root Route
 */
app.get('/', (req, res) => {
    res.json({
        message: 'ChangeFlow API Server',
        version: '1.0.0',
        status: 'active',
    });
});

// Debug Route to list all routes
app.get('/api/debug/routes', (req, res) => {
    const routes = [];
    app._router.stack.forEach((middleware) => {
        if (middleware.route) { // routes registered directly on the app
            routes.push(`${Object.keys(middleware.route.methods)} ${middleware.route.path}`);
        } else if (middleware.name === 'router') { // router middleware 
            middleware.handle.stack.forEach((handler) => {
                const route = handler.route;
                route && routes.push(`${Object.keys(route.methods)} ${middleware.regexp} ${route.path}`);
            });
        }
    });
    res.json({ success: true, routes });
});

/**
 * Error Handling Middleware
 */
app.use(notFound);
app.use(errorHandler);

/**
 * Start Server
 */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log(`❌ Unhandled Rejection: ${err.message}`);
    // Close server & exit process
    process.exit(1);
});
