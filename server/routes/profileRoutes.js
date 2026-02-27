import express from 'express';
import {
    getProfile,
    updateProfile,
    changePassword,
    toggle2FA,
} from '../controllers/profileController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All profile routes require authentication
router.get('/', protect, getProfile);
router.put('/update', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.put('/toggle-2fa', protect, toggle2FA);

export default router;
