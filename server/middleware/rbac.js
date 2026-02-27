/**
 * Role-Based Access Control (RBAC) middleware
 * Restrict access based on user roles
 */

/**
 * Check if user has one of the allowed roles
 * @param  {...String} roles - Allowed roles
 */
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401);
            throw new Error('Not authorized - no user found');
        }

        if (!roles.includes(req.user.role)) {
            res.status(403);
            throw new Error(`User role '${req.user.role}' is not authorized to access this route`);
        }

        next();
    };
};

/**
 * Specific role checks for convenience
 */
export const isEmployee = authorize('Employee', 'Manager', 'Admin');
export const isManager = authorize('Manager', 'Admin');
export const isAdmin = authorize('Admin');
export const isClient = authorize('Client', 'Admin');
