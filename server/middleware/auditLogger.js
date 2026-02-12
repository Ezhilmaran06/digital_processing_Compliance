import AuditLog from '../models/AuditLog.js';

/**
 * Create audit log entry
 * @param {Object} logData - Audit log data
 */
export const createAuditLog = async (logData) => {
    try {
        await AuditLog.create(logData);
    } catch (error) {
        console.error('Audit logging error:', error);
        // Don't throw error to prevent audit logging from breaking the app
    }
};

/**
 * Middleware to log request actions
 * Usage: Add this middleware after specific route handlers
 */
export const auditLogMiddleware = (action) => {
    return async (req, res, next) => {
        const originalSend = res.send;

        res.send = function (data) {
            // Only log on successful responses
            if (res.statusCode >= 200 && res.statusCode < 400) {
                createAuditLog({
                    userId: req.user?._id,
                    action,
                    requestId: req.params?.id || req.body?.requestId,
                    targetUserId: req.params?.userId || req.body?.userId,
                    ipAddress: req.ip || req.connection.remoteAddress,
                    userAgent: req.get('user-agent'),
                    details: {
                        method: req.method,
                        path: req.path,
                        body: req.body,
                    },
                });
            }

            originalSend.call(this, data);
        };

        next();
    };
};

/**
 * Helper function to get client IP address
 */
export const getClientIp = (req) => {
    return (
        req.headers['x-forwarded-for']?.split(',')[0] ||
        req.headers['x-real-ip'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.ip ||
        'Unknown'
    );
};
