import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { generateToken } from '../config/jwt.js';
import { createAuditLog, getClientIp } from '../middleware/auditLogger.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
    res.status(403);
    throw new Error('Public registration is disabled. Please contact an administrator for account creation.');
});

/**
 * @desc    Login user (with role validation)
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
    const { email, password, role } = req.body;

    // Find user by email and include password field
    const user = await User.findOne({ email }).select('+password');

    // Check if user exists, password matches, AND role matches
    if (user && (await user.comparePassword(password)) && user.role === role) {
        // Check if user is active
        if (!user.isActive) {
            // Log failed login attempt
            await createAuditLog({
                userId: user._id,
                action: 'LOGIN_FAILED',
                ipAddress: getClientIp(req),
                userAgent: req.get('user-agent'),
                details: {
                    reason: 'Account deactivated',
                    email,
                    attemptedRole: role,
                },
            });

            res.status(401);
            throw new Error('Your account has been deactivated. Please contact administrator.');
        }

        // Log successful login
        await createAuditLog({
            userId: user._id,
            action: 'LOGIN_SUCCESS',
            ipAddress: getClientIp(req),
            userAgent: req.get('user-agent'),
            details: {
                email: user.email,
                role: user.role,
            },
        });

        // Update lastLogin timestamp
        await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

        // Generate JWT token
        const token = generateToken({ id: user._id });

        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                auditorType: user.auditorType,
                isActive: user.isActive,
                forcePasswordReset: user.forcePasswordReset,
                avatar: user.avatar || null,
                token,
            },
        });
    } else {
        // Log failed login attempt
        if (user) {
            await createAuditLog({
                userId: user._id,
                action: 'LOGIN_FAILED',
                ipAddress: getClientIp(req),
                userAgent: req.get('user-agent'),
                details: {
                    reason: user.role !== role ? 'Role mismatch' : 'Invalid password',
                    email,
                    attemptedRole: role,
                    actualRole: user.role,
                },
            });
        }

        res.status(401);
        throw new Error('Invalid email, password, or role combination');
    }
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    res.json({
        success: true,
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            auditorType: user.auditorType,
            isActive: user.isActive,
            avatar: user.avatar,
            createdAt: user.createdAt,
        },
    });
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
    // Create audit log
    await createAuditLog({
        userId: req.user._id,
        action: 'LOGOUT',
        ipAddress: getClientIp(req),
        userAgent: req.get('user-agent'),
    });

    res.json({
        success: true,
        message: 'Logged out successfully',
    });
});

/**
 * @desc    Update user profile
 * @route   PATCH /api/auth/me
 * @access  Private
 */
export const updateMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (req.body.name) user.name = req.body.name;
    if (req.body.auditorType !== undefined) user.auditorType = req.body.auditorType;
    if (req.body.email) {
        // Check if email is already taken by another user
        const emailExists = await User.findOne({ email: req.body.email, _id: { $ne: user._id } });
        if (emailExists) {
            res.status(400);
            throw new Error('Email is already in use');
        }
        user.email = req.body.email;
    }

    const updatedUser = await user.save();

    // Create audit log
    await createAuditLog({
        userId: user._id,
        action: 'PROFILE_UPDATED',
        ipAddress: getClientIp(req),
        userAgent: req.get('user-agent'),
        details: {
            updatedFields: Object.keys(req.body),
        },
    });

    res.json({
        success: true,
        data: {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            auditorType: updatedUser.auditorType,
            isActive: updatedUser.isActive,
            avatar: updatedUser.avatar,
        },
    });
});

/**
 * @desc    Update password
 * @route   PATCH /api/auth/update-password
 * @access  Private
 */
export const updatePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
        res.status(401);
        throw new Error('Current password is incorrect');
    }

    user.password = newPassword;
    user.forcePasswordReset = false;
    await user.save();

    // Create audit log
    await createAuditLog({
        userId: user._id,
        action: 'PASSWORD_UPDATED',
        ipAddress: getClientIp(req),
        userAgent: req.get('user-agent'),
    });

    res.json({
        success: true,
        message: 'Password updated successfully',
    });
});

/**
 * @desc    Get current user avatar
 * @route   GET /api/auth/avatar
 * @access  Private
 */
export const getAvatar = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('avatar');
    
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (!user.avatar) {
        // Return a transparent 1x1 pixel gif or just 204
        return res.status(204).end();
    }

    // If it's base64, we can serve it by stripping metadata if we want, 
    // but usually browser handles base64 in src.
    // If someone calls this API via GET, they probably want the path or the data.
    res.json({
        success: true,
        data: {
            avatar: user.avatar
        }
    });
});

/**
 * @desc    Update user avatar (accepts Base64 or path)
 * @route   PATCH /api/auth/avatar
 * @access  Private
 */
export const updateAvatar = asyncHandler(async (req, res) => {
    const { avatar } = req.body;
    
    console.log(`[AVATAR_UPDATE] Submitting update for user: ${req.user?._id}`);
    
    if (!avatar) {
        res.status(400);
        throw new Error('Please provide an avatar path or base64 data');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    try {
        user.avatar = avatar;
        await user.save();

        console.log(`[AVATAR_UPDATE] Successfully updated avatar for user: ${user.email}`);

        // Create audit log
        await createAuditLog({
            userId: user._id,
            action: 'AVATAR_UPDATED',
            ipAddress: getClientIp(req),
            userAgent: req.get('user-agent'),
            details: {
                // Don't log full base64 in audit logs as it bloats DB
                avatarType: avatar.startsWith('data:') ? 'base64' : 'path',
                avatarLength: avatar.length
            }
        });

        res.json({
            success: true,
            data: {
                avatar: user.avatar,
            },
        });
    } catch (saveError) {
        console.error('[AVATAR_UPDATE_ERROR]', saveError);
        res.status(500);
        throw new Error(`Failed to save avatar: ${saveError.message}`);
    }
});
