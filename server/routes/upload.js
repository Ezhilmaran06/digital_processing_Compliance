import express from 'express';
import multer from 'multer';

// --- DATABASE STORAGE VERSION ---
// This version stores images as Base64 strings directly in MongoDB.
// This is the most reliable way to handle images on ephemeral platforms like Render & Netlify
// without using external cloud storage like Cloudinary or S3.
// --------------------------------

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
    const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only standard image formats (JPG, PNG, GIF, WebP, SVG) are allowed'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Limit to 2MB for DB storage
    fileFilter: fileFilter,
}).single('file');

const router = express.Router();

/**
 * Image upload route - Converts to Base64 for database storage
 */
router.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file received' });
        }

        try {
            // Convert file buffer to Base64 string
            const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
            
            res.json({
                success: true,
                data: {
                    filename: req.file.originalname,
                    originalName: req.file.originalname,
                    path: base64Image, // This will be stored in the User.avatar field in the DB
                    size: req.file.size,
                    mimetype: req.file.mimetype,
                    storage: 'database'
                },
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error processing image' });
        }
    });
});

export default router;

