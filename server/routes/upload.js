import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const debugLog = (msg) => {
    try {
        fs.appendFileSync(path.join(__dirname, '../upload_debug.log'), `[${new Date().toISOString()}] ${msg}\n`);
    } catch (e) { }
};

const uploadDir = path.resolve(__dirname, '../uploads');
debugLog(`Resolved uploadDir: ${uploadDir}`);

if (!fs.existsSync(uploadDir)) {
    try {
        fs.mkdirSync(uploadDir, { recursive: true });
        debugLog('Created uploadDir in initialization');
    } catch (err) {
        debugLog(`Failed to create uploadDir in initialization: ${err.message}`);
    }
} else {
    debugLog('uploadDir already exists in initialization');
}

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        debugLog(`Destination called for: ${file.originalname}`);
        if (!fs.existsSync(uploadDir)) {
            try {
                fs.mkdirSync(uploadDir, { recursive: true });
                debugLog('Created uploadDir in destination');
            } catch (err) {
                debugLog(`Failed to create uploadDir in destination: ${err.message}`);
                return cb(err);
            }
        } else {
            debugLog('uploadDir exists in destination');
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const name = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
        debugLog(`Generated filename: ${name}`);
        cb(null, name);
    },
});

const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|xls|xlsx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only images, PDFs, and documents are allowed'));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    },
    fileFilter: fileFilter,
});

/**
 * File upload route
 */
router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'Please upload a file',
        });
    }

    res.json({
        success: true,
        data: {
            filename: req.file.filename,
            originalName: req.file.originalname,
            path: req.file.path,
            size: req.file.size,
            mimetype: req.file.mimetype,
        },
    });
});

export default router;
