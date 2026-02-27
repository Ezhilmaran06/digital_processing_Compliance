import asyncHandler from 'express-async-handler';
import Request from '../models/Request.js';
import User from '../models/User.js';
import fs from 'fs';
import { createAuditLog, getClientIp } from '../middleware/auditLogger.js';

/**
 * @desc    Create a new change request
 * @route   POST /api/requests
 * @access  Private (Employee, Manager, Admin)
 */
export const createRequest = asyncHandler(async (req, res) => {
    const requestData = {
        ...req.body,
        createdBy: req.user._id,
        status: 'Pending',
    };

    const request = await Request.create(requestData);

    // Populate creator info
    await request.populate('createdBy', 'name email role');

    // Create audit log
    await createAuditLog({
        userId: req.user._id,
        action: 'REQUEST_CREATED',
        requestId: request._id,
        ipAddress: getClientIp(req),
        userAgent: req.get('user-agent'),
        details: {
            title: request.title,
            changeType: request.changeType,
            riskLevel: request.riskLevel,
        },
    });

    res.status(201).json({
        success: true,
        data: request,
    });
});

/**
 * @desc    Get all requests (filtered by role)
 * @route   GET /api/requests
 * @access  Private
 */
export const getRequests = asyncHandler(async (req, res) => {
    const { status, changeType, riskLevel, search, page = 1, limit = 10 } = req.query;

    const query = {};

    // Role-based filtering
    const userRole = req.user.role.toLowerCase();

    if (userRole === 'employee') {
        // Employees see only their own requests
        query.createdBy = req.user._id;
    } else if (userRole === 'client') {
        // Clients see approved, completed, and sent to audit requests
        query.status = { $in: ['Approved', 'Completed', 'Sent to Audit'] };
    }
    // Managers and Admins see all requests

    // Additional filters
    if (status) {
        if (status.includes(',')) {
            query.status = { $in: status.split(',').map(s => s.trim()) };
        } else {
            query.status = status;
        }
    }
    if (changeType) query.changeType = changeType;
    if (riskLevel) query.riskLevel = riskLevel;
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
        ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let requests = await Request.find(query)
        .populate('createdBy', 'name email role')
        .populate('approvedBy', 'name email role')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip);

    let total = await Request.countDocuments(query);

    // Let empty results be returned for Client if no approved requests exist
    // This allows the frontend to show its own 'empty' state naturally

    res.json({
        success: true,
        data: requests,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
        },
    });
});

/**
 * @desc    Get single request by ID
 * @route   GET /api/requests/:id
 * @access  Private
 */
export const getRequest = asyncHandler(async (req, res) => {
    const request = await Request.findById(req.params.id)
        .populate('createdBy', 'name email role')
        .populate('approvedBy', 'name email role');

    if (!request) {
        res.status(404);
        throw new Error('Request not found');
    }

    // Role-based access control
    if (req.user.role === 'Employee' && request.createdBy._id.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to view this request');
    }

    if (req.user.role === 'Client' && request.status !== 'Approved') {
        res.status(403);
        throw new Error('Not authorized to view this request');
    }


    res.json({
        success: true,
        data: request,
    });
});

/**
 * @desc    Update a request
 * @route   PUT /api/requests/:id
 * @access  Private (Users can update their own pending requests)
 */
export const updateRequest = asyncHandler(async (req, res) => {
    const request = await Request.findById(req.params.id);

    if (!request) {
        res.status(404);
        throw new Error('Request not found');
    }

    // Check ownership: Users can only update their own requests
    const isOwner = request.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';
    const isManager = req.user.role === 'Manager';

    if (!isAdmin && !isManager && !isOwner) {
        res.status(403);
        throw new Error('Not authorized to update this request');
    }

    // Employees can only update their own pending or sent-to-audit requests
    // Managers and Admins can update any request regardless of status
    if (!isAdmin && !isManager && !['Pending', 'Sent to Audit'].includes(request.status)) {
        res.status(400);
        throw new Error('You can only update pending or sent to audit requests. Approved/completed requests cannot be modified.');
    }

    // Update fields
    const {
        title,
        description,
        changeType,
        riskLevel,
        justification,
        plannedStartDate,
        plannedEndDate,
        implementationPlan,
        rollbackPlan,
        impactAssessment,
        affectedDepartments
    } = req.body;

    // Update only provided fields
    if (title) request.title = title;
    if (description) request.description = description;
    if (changeType) request.changeType = changeType;
    if (riskLevel) request.riskLevel = riskLevel;
    if (justification) request.justification = justification;
    if (plannedStartDate) request.plannedStartDate = plannedStartDate;
    if (plannedEndDate) request.plannedEndDate = plannedEndDate;
    if (implementationPlan) request.implementationPlan = implementationPlan;
    if (rollbackPlan) request.rollbackPlan = rollbackPlan;
    if (impactAssessment) request.impactAssessment = impactAssessment;
    if (affectedDepartments) request.affectedDepartments = affectedDepartments;

    await request.save();
    await request.populate('createdBy', 'name email role');

    // Create audit log
    await createAuditLog({
        userId: req.user._id,
        action: 'REQUEST_UPDATED',
        requestId: request._id,
        ipAddress: getClientIp(req),
        userAgent: req.get('user-agent'),
        details: {
            title: request.title,
        },
    });

    res.json({
        success: true,
        data: request,
    });
});

/**
 * @desc    Approve a request
 * @route   PATCH /api/requests/:id/approve
 * @access  Private (Manager, Admin)
 */
export const approveRequest = asyncHandler(async (req, res) => {
    const request = await Request.findById(req.params.id);

    if (!request) {
        res.status(404);
        throw new Error('Request not found');
    }

    if (request.status !== 'Pending') {
        res.status(400);
        throw new Error(`Cannot approve request with status: ${request.status}`);
    }

    // Role Enforcement: Only Managers can approve/reject
    if (req.user.role !== 'Manager') {
        res.status(403);
        throw new Error('Not authorized. Only Managers can approve change requests.');
    }

    request.status = 'Approved';
    request.approvedBy = req.user._id;
    request.approvalDate = new Date();

    await request.save();
    await request.populate('createdBy approvedBy', 'name email role');

    // Create audit log
    await createAuditLog({
        userId: req.user._id,
        action: 'REQUEST_APPROVED',
        requestId: request._id,
        ipAddress: getClientIp(req),
        userAgent: req.get('user-agent'),
        details: {
            title: request.title,
            requestCreator: request.createdBy.email,
        },
    });

    res.json({
        success: true,
        data: request,
    });
});

/**
 * @desc    Reject a request
 * @route   PATCH /api/requests/:id/reject
 * @access  Private (Manager, Admin)
 */
export const rejectRequest = asyncHandler(async (req, res) => {
    const { rejectionReason } = req.body;

    if (!rejectionReason || rejectionReason.trim().length < 10) {
        res.status(400);
        throw new Error('Please provide a detailed rejection reason (at least 10 characters)');
    }

    const request = await Request.findById(req.params.id);

    if (!request) {
        res.status(404);
        throw new Error('Request not found');
    }

    if (request.status !== 'Pending') {
        res.status(400);
        throw new Error(`Cannot reject request with status: ${request.status}`);
    }

    // Role Enforcement: Only Managers can approve/reject
    if (req.user.role !== 'Manager') {
        res.status(403);
        throw new Error('Not authorized. Only Managers can reject change requests.');
    }

    request.status = 'Rejected';
    request.approvedBy = req.user._id;
    request.approvalDate = new Date();
    request.rejectionReason = rejectionReason;

    await request.save();
    await request.populate('createdBy approvedBy', 'name email role');

    // Create audit log
    await createAuditLog({
        userId: req.user._id,
        action: 'REQUEST_REJECTED',
        requestId: request._id,
        ipAddress: getClientIp(req),
        userAgent: req.get('user-agent'),
        details: {
            title: request.title,
            requestCreator: request.createdBy.email,
            rejectionReason,
        },
    });

    res.json({
        success: true,
        data: request,
    });
});

/**
 * @desc    Delete a request
 * @route   DELETE /api/requests/:id
 * @access  Private (Users can delete their own pending requests, Admins can delete any)
 */
export const deleteRequest = asyncHandler(async (req, res) => {
    const request = await Request.findById(req.params.id);

    if (!request) {
        res.status(404);
        throw new Error('Request not found');
    }

    // Check permissions: Admins can delete any, users can only delete their own pending requests
    const isOwner = request.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isAdmin && !isOwner) {
        res.status(403);
        throw new Error('Not authorized to delete this request');
    }

    // Users can only delete their own pending requests
    if (!isAdmin && request.status !== 'Pending') {
        res.status(400);
        throw new Error('You can only delete pending requests. Contact an administrator to delete approved/rejected requests.');
    }

    await request.deleteOne();

    // Create audit log
    await createAuditLog({
        userId: req.user._id,
        action: 'REQUEST_DELETED',
        requestId: request._id,
        ipAddress: getClientIp(req),
        userAgent: req.get('user-agent'),
        details: {
            title: request.title,
        },
    });

    res.json({
        success: true,
        message: 'Request deleted successfully',
    });
});
/**
 * @desc    Get request statistics for analytics
 * @route   GET /api/requests/stats
 * @access  Private
 */
export const getRequestStats = asyncHandler(async (req, res) => {
    const query = {};
    if (req.user.role === 'Employee') {
        query.createdBy = req.user._id;
        query.status = { $in: ['Approved', 'Completed', 'Sent to Audit'] };
    }


    // Status counts
    const statusStats = await Request.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Type counts
    const typeStats = await Request.aggregate([
        { $match: query },
        { $group: { _id: '$changeType', count: { $sum: 1 } } }
    ]);

    // Priority Distribution
    const priorityStats = await Request.aggregate([
        { $match: query },
        { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
    ]);

    // Trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trendStats = await Request.aggregate([
        {
            $match: {
                ...query,
                createdAt: { $gte: sevenDaysAgo }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id': 1 } }
    ]);

    // Workforce stats (active users)
    const totalWorkforce = await User.countDocuments({ isActive: true });

    // Active Changes (In Progress status)
    const activeChanges = await Request.countDocuments({ status: 'In Progress' });

    const statsData = {
        statusDistribution: statusStats.map(s => ({ name: s._id, value: s.count })),
        typeDistribution: typeStats.map(s => ({ name: s._id, value: s.count })),
        priorityDistribution: priorityStats.map(s => ({ name: s._id, value: s.count })),
        trends: trendStats.map(s => ({ name: s._id, value: s.count })),
        totalWorkforce,
        activeChanges,
        summary: {
            total: statusStats.reduce((acc, s) => acc + s.count, 0),
            pending: statusStats.find(s => String(s._id).trim() === 'Pending')?.count || 0,
            approved: (function () {
                const targets = ['approved', 'completed', 'sent to audit'];
                const filtered = statusStats.filter(s => targets.includes(String(s._id).toLowerCase().trim()));
                const sum = filtered.reduce((acc, s) => acc + s.count, 0);
                // Persistent log
                fs.appendFileSync('analytics_debug.log', `[${new Date().toISOString()}] DIAG: role=${req.user.role} user=${req.user.email} stats=${JSON.stringify(statusStats)} filtered=${JSON.stringify(filtered)} result=${sum}\n`);
                return sum;
            })(),
            rejected: statusStats.find(s => String(s._id).trim() === 'Rejected')?.count || 0,
            inProgress: statusStats.find(s => String(s._id).trim() === 'In Progress')?.count || 0,
            completed: statusStats.find(s => String(s._id).trim() === 'Completed')?.count || 0
        }
    };

    res.json({
        success: true,
        data: statsData
    });
});
