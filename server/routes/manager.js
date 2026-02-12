import express from 'express';
import { sendToAudit } from '../controllers/managerController.js';
import { protect } from '../middleware/auth.js';
import { isManager } from '../middleware/rbac.js';

const router = express.Router();

/**
 * Manager routes (all require Manager or Admin role)
 */

// Apply authentication and manager authorization to all routes
router.use(protect, isManager);

// Send approved request to audit
router.patch('/send-to-audit/:requestId', sendToAudit);

export default router;
