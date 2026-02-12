import express from 'express';
import {
    createRequest,
    getRequests,
    getRequest,
    updateRequest,
    approveRequest,
    rejectRequest,
    deleteRequest,
    getRequestStats,
} from '../controllers/requestController.js';
import { createRequestSchema, updateRequestSchema, validate } from '../validations/requestValidation.js';
import { protect } from '../middleware/auth.js';
import { authorize, isEmployee, isManager, isAdmin } from '../middleware/rbac.js';

const router = express.Router();

/**
 * Request routes
 */

// Get statistics (Role-based filtering in controller)
router.get('/stats', protect, getRequestStats);

// Get all requests (role-based filtering applied in controller)
router.get('/', protect, getRequests);

// Create new request (Employee, Manager, Admin can create)
router.post('/', protect, isEmployee, validate(createRequestSchema), createRequest);

// Update request (Users can update their own pending requests)
router.put('/:id', protect, validate(updateRequestSchema), updateRequest);

// Get single request by ID
router.get('/:id', protect, getRequest);

// Approve request (Manager and Admin only)
router.patch('/:id/approve', protect, isManager, approveRequest);

// Reject request (Manager and Admin only)
router.patch('/:id/reject', protect, isManager, rejectRequest);

// Delete request (Users can delete their own requests, Admins can delete any)
router.delete('/:id', protect, deleteRequest);

export default router;
