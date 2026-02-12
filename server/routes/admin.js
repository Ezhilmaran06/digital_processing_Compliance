import express from 'express';
import {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    getAnalytics,
    getAuditLogs,
    exportAuditLogs,
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { isAdmin } from '../middleware/rbac.js';

const router = express.Router();

/**
 * Admin routes (all require Admin role)
 */

// Apply authentication and admin authorization to all routes
router.use(protect, isAdmin);

// User management
router.route('/users')
    .get(getUsers)
    .post(createUser);

router.route('/users/:id')
    .patch(updateUser)
    .delete(deleteUser);

// Analytics & reporting
router.get('/analytics', getAnalytics);

// Audit logs
router.get('/audit-logs', getAuditLogs);
router.get('/audit-logs/export', exportAuditLogs);

export default router;
