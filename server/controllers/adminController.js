import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Request from '../models/Request.js';
import AuditLog from '../models/AuditLog.js';
import { createAuditLog, getClientIp } from '../middleware/auditLogger.js';

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
export const getUsers = asyncHandler(async (req, res) => {
    const { role, isActive, search, page = 1, limit = 20 } = req.query;

    const query = {};

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
        ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip);

    const total = await User.countDocuments(query);

    res.json({
        success: true,
        data: users,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
        },
    });
});

/**
 * @desc    Create a new user
 * @route   POST /api/admin/users
 * @access  Private (Admin only)
 */
export const createUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, notificationEmail } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User with this email already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        role,
        notificationEmail: notificationEmail || '',
    });

    // Mock email notification trigger
    if (notificationEmail) {
        console.log(`[IDENTITY_PROVISIONED] Sending credentials for ${user.email} to notification recipient: ${notificationEmail}`);
        console.log(`[IDENTITY_PROVISIONED] Credential Payload: { User: ${user.name}, Role: ${user.role}, Login: ${user.email}, TempPass: ${password} }`);
    }

    // Create audit log
    await createAuditLog({
        userId: req.user._id,
        action: 'USER_CREATED',
        targetUserId: user._id,
        ipAddress: getClientIp(req),
        userAgent: req.get('user-agent'),
        details: {
            createdUserEmail: user.email,
            createdUserRole: user.role,
        },
    });

    res.status(201).json({
        success: true,
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
        },
    });
});

/**
 * @desc    Update user
 * @route   PATCH /api/admin/users/:id
 * @access  Private (Admin only)
 */
export const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const { name, email, role, isActive } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    // Create audit log
    await createAuditLog({
        userId: req.user._id,
        action: isActive === false ? 'USER_DEACTIVATED' : isActive === true ? 'USER_ACTIVATED' : 'USER_UPDATED',
        targetUserId: user._id,
        ipAddress: getClientIp(req),
        userAgent: req.get('user-agent'),
        details: {
            updatedFields: req.body,
        },
    });

    res.json({
        success: true,
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
        },
    });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin only)
 */
export const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
        res.status(400);
        throw new Error('Cannot delete your own account');
    }

    await user.deleteOne();

    // Create audit log
    await createAuditLog({
        userId: req.user._id,
        action: 'USER_DELETED',
        targetUserId: user._id,
        ipAddress: getClientIp(req),
        userAgent: req.get('user-agent'),
        details: {
            deletedUserEmail: user.email,
            deletedUserRole: user.role,
        },
    });

    res.json({
        success: true,
        message: 'User deleted successfully',
    });
});

/**
 * @desc    Get system analytics
 * @route   GET /api/admin/analytics
 * @access  Private (Admin only)
 */
export const getAnalytics = asyncHandler(async (req, res) => {
    // Get request statistics
    const totalRequests = await Request.countDocuments();
    const pendingRequests = await Request.countDocuments({ status: 'Pending' });
    const approvedRequests = await Request.countDocuments({
        status: { $in: ['Approved', 'Completed', 'Sent to Audit'] }
    });
    const rejectedRequests = await Request.countDocuments({ status: 'Rejected' });

    // Get user statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const usersByRole = await User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    // Get requests by type
    const requestsByType = await Request.aggregate([
        { $group: { _id: '$changeType', count: { $sum: 1 } } },
    ]);

    // Get requests by status
    const requestsByStatus = await Request.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRequests = await Request.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
    });

    res.json({
        success: true,
        data: {
            requests: {
                total: totalRequests,
                pending: pendingRequests,
                approved: approvedRequests,
                rejected: rejectedRequests,
                recentCount: recentRequests,
                byType: requestsByType,
                byStatus: requestsByStatus,
            },
            users: {
                total: totalUsers,
                active: activeUsers,
                inactive: totalUsers - activeUsers,
                byRole: usersByRole,
            },
            metrics: {
                approvalRate: totalRequests > 0 ? ((approvedRequests / totalRequests) * 100).toFixed(2) : 0,
                rejectionRate: totalRequests > 0 ? ((rejectedRequests / totalRequests) * 100).toFixed(2) : 0,
            },
        },
    });
});

/**
 * @desc    Get audit logs
 * @route   GET /api/admin/audit-logs
 * @access  Private (Admin only)
 */
export const getAuditLogs = asyncHandler(async (req, res) => {
    const { action, userId, startDate, endDate, page = 1, limit = 50 } = req.query;

    const query = {};

    if (action) query.action = action;
    if (userId) query.userId = userId;
    if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const logs = await AuditLog.find(query)
        .populate('userId', 'name email role avatar')
        .populate('targetUserId', 'name email role')
        .populate('requestId', 'title status')
        .sort({ timestamp: -1 })
        .limit(parseInt(limit))
        .skip(skip);

    const total = await AuditLog.countDocuments(query);

    res.json({
        success: true,
        data: logs,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
        },
    });
});

/**
 * @desc    Export audit logs to CSV
 * @route   GET /api/admin/audit-logs/export
 * @access  Private (Admin only)
 */
export const exportAuditLogs = asyncHandler(async (req, res) => {
    const { action, userId, startDate, endDate } = req.query;

    const query = {};

    if (action) query.action = action;
    if (userId) query.userId = userId;
    if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(query)
        .populate('userId', 'name email role avatar')
        .populate('targetUserId', 'name email role')
        .populate('requestId', 'title')
        .sort({ timestamp: -1 })
        .limit(10000); // Limit for performance

    // Create CSV content
    const csvHeader = 'Timestamp,User,User Email,Action,Request,IP Address,Details\n';
    const csvRows = logs.map((log) => {
        const userName = log.userId?.name || 'Unknown';
        const userEmail = log.userId?.email || 'Unknown';
        const requestTitle = log.requestId?.title || 'N/A';
        const details = log.details ? JSON.stringify(log.details).replace(/"/g, '""') : 'N/A';

        return `"${log.timestamp}","${userName}","${userEmail}","${log.action}","${requestTitle}","${log.ipAddress}","${details}"`;
    }).join('\n');

    const csv = csvHeader + csvRows;

    // Create audit log for export action
    await createAuditLog({
        userId: req.user._id,
        action: 'ADMIN_ACTION',
        ipAddress: getClientIp(req),
        userAgent: req.get('user-agent'),
        details: {
            action: 'EXPORT_AUDIT_LOGS',
            recordCount: logs.length,
        },
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${Date.now()}.csv`);
    res.send(csv);
});
