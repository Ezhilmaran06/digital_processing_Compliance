import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getCloudinaryStorage, isCloudinaryConfigured } from '../utils/cloudinary.js';

// --- PERSISTENCE INSTRUCTIONS ---
// 1. Install dependencies (Optional, code will fallback automatically if missing):
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

// Local storage fallback
const uploadDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    try {
        fs.mkdirSync(uploadDir, { recursive: true });
    } catch (err) {
        debugLog(`Failed to create local uploadDir: ${err.message}`);
    }
}

const localStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname).toLowerCase());
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

const router = express.Router();

/**
 * Image upload route for profile pictures
 */
router.post('/upload', async (req, res, next) => {
    let storageToUse = localStorage;
    let usingCloudinary = false;

    // Try to get cloud storage if configured
    if (isCloudinaryConfigured()) {
        try {
            const cloudStorage = await getCloudinaryStorage();
            if (cloudStorage) {
                storageToUse = cloudStorage;
                usingCloudinary = true;
            }
        } catch (e) {
            debugLog(`Failed to load Cloudinary storage: ${e.message}`);
        }
    }

    const upload = multer({
        storage: storageToUse,
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: fileFilter,
    }).single('file');

    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file received' });
        }

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
