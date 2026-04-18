import express from 'express';
import mongoose from 'mongoose';
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

import http from 'http';
import { initIo } from './socket.js';

// Import routes
import authRoutes from './routes/auth.js';
import requestRoutes from './routes/requests.js';
import adminRoutes from './routes/admin.js';
import managerRoutes from './routes/manager.js';
import uploadRoutes from './routes/upload.js';
import profileRoutes from './routes/profileRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

// Load environment variables
dotenv.config();

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to database
await connectDB();

// Initialize Express app
const app = express();

const server = http.createServer(app);

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'https://digital-processing-compliance-tool.netlify.app',
    ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : []),
    ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : [])
].map(url => url.trim()).filter(Boolean);

// Initialize Socket.io
initIo(server, {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"]
});

/**
 * Security Middleware
 */

// Helmet - Set security headers (relaxed for development image serving)
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
}));

// CORS - Enable Cross-Origin Resource Sharing
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        const isAllowed = allowedOrigins.some(allowed => 
            allowed === origin || 
            (allowed.includes('localhost') && origin.includes('localhost'))
        );
        
        if (isAllowed || origin.endsWith('netlify.app')) {
            callback(null, true);
        } else {
            console.warn(`[CORS] Rejected origin: ${origin}`);
            callback(null, false); // Just reject, don't throw error to avoid crashing
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

/**
 * Body Parser Middleware
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting - Prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Raised limit for development (was 100)
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path.startsWith('/profile'), // never rate-limit profile
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
app.use('/uploads', (req, res, next) => {
    next();
}, express.static(path.join(__dirname, 'uploads')));

/**
 * API Routes
 */
// Infrastructure Verification Route
app.get('/api/verify-server', (req, res) => res.json({
    success: true,
    message: 'Infrastructure is active',
    timestamp: new Date().toISOString()
}));

// Diagnostic Route
app.get('/api/auth/ping', (req, res) => res.json({ success: true, message: 'Auth ping ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api', uploadRoutes);

import Message from './models/ChatMessage.js';
app.get('/api/schema-check', (req, res) => {
    res.json({
        activeModel: Message.modelName,
        paths: Object.keys(Message.schema.paths),
        env: process.env.NODE_ENV,
        db: mongoose.connection.name
    });
});

// TEMPORARY DEBUG SEED ROUTE
app.get('/api/debug/force-seed', async (req, res) => {
    try {
        const User = (await import('./models/User.js')).default;
        const Request = (await import('./models/Request.js')).default;

        // Case-insensitive role check
        let admin = await User.findOne({ role: { $regex: /^admin$/i } });
        if (!admin) {
            admin = await User.create({
                name: 'System Admin',
                email: 'admin@changeflow.com',
                password: 'admin123',
                role: 'Admin',
                isActive: true
            });
        }

        await Request.deleteMany();

        const types = ['Infrastructure', 'Application', 'Database', 'Network', 'Security'];
        const risks = ['Low', 'Medium', 'High', 'Critical'];
        const statuses = ['Approved', 'Pending', 'Rejected', 'In Progress', 'Completed'];

        const reqData = [];
        for (let i = 1; i <= 20; i++) {
            const status = i <= 8 ? 'Approved' : statuses[Math.floor(Math.random() * statuses.length)];
            reqData.push({
                title: `Change #${i}: ${types[i % types.length]} System Upgrade`,
                description: `Comprehensive upgrade of the ${types[i % types.length].toLowerCase()} component to improve compliance.`,
                changeType: types[i % types.length],
                riskLevel: risks[i % risks.length],
                justification: `Business necessity for the ${types[i % types.length]} upgrade.`,
                impactAssessment: `Potential impact analysis for the ${types[i % types.length]} system update.`,
                affectedDepartments: ['IT', 'Engineering'],
                status: status,
                priority: status === 'Approved' ? 'High' : 'Medium',
                createdBy: admin._id,
                approvedBy: status === 'Approved' ? admin._id : null,
                approvalDate: status === 'Approved' ? new Date() : null
            });
        }

        await Request.insertMany(reqData);

        res.json({ success: true, message: 'Database forcefully seeded with 20 requests (8 Approved)', admin: admin.email });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * Health Check
 */
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        database: process.env.MONGODB_URI?.split('/').pop()?.split('?')[0] || 'changeflow',
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

server.listen(PORT, () => {
    console.log(`🚀 Server & Socket.IO running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log(`❌ Unhandled Rejection: ${err.message}`);
    // Close server & exit process
    process.exit(1);
});







// Server updated for ChatMessage collection switch: 2026-03-13 10:05:00
