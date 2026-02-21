import express from 'express';
import { register, login, getMe, logout, updateMe, updatePassword, updateAvatar } from '../controllers/authController.js';
import { registerSchema, loginSchema, updateProfileSchema, updatePasswordSchema, validate } from '../validations/authValidation.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * Authentication routes
 */

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

// Status check for router mounting
router.get('/status', (req, res) => res.json({ success: true, message: 'Auth router is active' }));

// Protected routes
router.get('/me', protect, getMe);
router.patch('/me', protect, validate(updateProfileSchema), updateMe);
router.patch('/avatar', protect, updateAvatar);
router.patch('/update-password', protect, validate(updatePasswordSchema), updatePassword);
router.post('/logout', protect, logout);

export default router;
