import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { storage as cloudinaryStorage, isCloudinaryConfigured } from '../utils/cloudinary.js';

// --- PERSISTENCE INSTRUCTIONS ---
// 1. Install dependencies: 
//    npm install cloudinary multer-storage-cloudinary
// 2. Set environment variables in Render/Local .env:
//    CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
// --------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const debugLog = (msg) => {
    try {
        fs.appendFileSync(path.join(__dirname, '../upload_debug.log'), `[${new Date().toISOString()}] ${msg}\n`);
    } catch (e) { }
};

// Ensure upload directory exists - absolute path to server/uploads
const uploadDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    try {
        fs.mkdirSync(uploadDir, { recursive: true });
    } catch (err) {
        debugLog(`Failed to create local uploadDir: ${err.message}`);
    }
}

const router = express.Router();

// Local Multer Configuration (Fallback)
const localStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(uploadDir)) {
            try {
                fs.mkdirSync(uploadDir, { recursive: true });
            } catch (err) {
                return cb(err);
            }
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const name = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname).toLowerCase();
        cb(null, name);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only standard image formats (JPG, PNG, GIF, WebP, SVG) are allowed'));
    }
};

// INITIALIZE UPLOADER
// Use Cloudinary if configured, otherwise fallback to local
let storageToUse = localStorage;
let usingCloudinary = false;

if (isCloudinaryConfigured()) {
    try {
        storageToUse = cloudinaryStorage;
        usingCloudinary = true;
        debugLog('Using Cloudinary for image storage');
    } catch (e) {
        debugLog(`Failed to initialize Cloudinary storage: ${e.message}. Falling back to local.`);
    }
} else {
    debugLog('Cloudinary not configured. Using local storage (ephemeral on Render).');
}

const upload = multer({
    storage: storageToUse,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: fileFilter,
});

/**
 * Image upload route for profile pictures
 */
router.post('/upload', (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file received',
            });
        }

        // Return a path that is consistent and serves relative to backend host or absolute cloud URL
        // Frontend 'getAvatarUrl' will handle both cases
        const finalPath = usingCloudinary ? req.file.path : `/uploads/${req.file.filename}`;

        res.json({
            success: true,
            data: {
                filename: req.file.filename || req.file.originalname,
                originalName: req.file.originalname,
                path: finalPath,
                size: req.file.size,
                mimetype: req.file.mimetype,
                storage: usingCloudinary ? 'cloudinary' : 'local'
            },
        });
    });
});

export default router;
