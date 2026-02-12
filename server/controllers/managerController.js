import asyncHandler from 'express-async-handler';
import Request from '../models/Request.js';
import { createAuditLog, getClientIp } from '../middleware/auditLogger.js';

/**
 * @desc    Send approved request to audit
 * @route   PATCH /api/manager/send-to-audit/:requestId
 * @access  Private (Manager, Admin)
 */
export const sendToAudit = asyncHandler(async (req, res) => {
    const request = await Request.findById(req.params.requestId);

    if (!request) {
        res.status(404);
        throw new Error('Request not found');
    }

    // Only approved requests can be sent to audit
    if (request.status !== 'Approved') {
        res.status(400);
        throw new Error(`Cannot send request with status "${request.status}" to audit. Only approved requests can be sent to audit.`);
    }

    // Update status
    request.status = 'Sent to Audit';
    await request.save();

    // Populate fields for response
    await request.populate('createdBy', 'name email role');
    await request.populate('approvedBy', 'name email role');

    // Create audit log
    await createAuditLog({
        userId: req.user._id,
        action: 'REQUEST_SENT_TO_AUDIT',
        requestId: request._id,
        ipAddress: getClientIp(req),
        userAgent: req.get('user-agent'),
        details: {
            title: request.title,
            previousStatus: 'Approved',
            newStatus: 'Sent to Audit',
            requestCreator: request.createdBy.email,
        },
    });

    res.json({
        success: true,
        data: request,
        message: 'Request successfully sent to audit',
    });
});
