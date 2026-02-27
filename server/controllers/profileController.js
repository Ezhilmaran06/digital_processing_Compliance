import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Request from '../models/Request.js';

/**
 * @desc    Get current user profile with computed stats
 * @route   GET /api/profile
 * @access  Private
 */
export const getProfile = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Fetch full user document
    const user = await User.findById(userId).select('-password');

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Compute request statistics from ChangeRequest collection
    const allRequests = await Request.find({ createdBy: userId });
    const totalSubmissions = allRequests.length;

    const approvedCount = allRequests.filter(r =>
        ['Approved', 'Completed', 'Sent to Audit'].includes(r.status)
    ).length;

    const highRiskCount = allRequests.filter(r => r.riskLevel === 'High').length;

    const approvalRate = totalSubmissions > 0
        ? Math.round((approvedCount / totalSubmissions) * 100)
        : 0;

    // Compliance Score formula: (approved/total)*100 - (highRiskCount * 2)
    const complianceScore = totalSubmissions > 0
        ? Math.max(0, Math.round((approvedCount / totalSubmissions) * 100 - (highRiskCount * 2)))
        : 0;

    res.json({
        success: true,
        data: {
            _id: user._id,
            employeeId: user.employeeId || 'N/A',
            name: user.name,
            email: user.email,
            department: user.department || 'Not Set',
            role: user.role,
            avatar: user.avatar,
            twoFactorEnabled: user.twoFactorEnabled,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            stats: {
                totalSubmissions,
                approvalRate,
                complianceScore,
                approvedCount,
                highRiskCount,
            },
        },
    });
});

/**
 * @desc    Update profile (name & department only)
 * @route   PUT /api/profile/update
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
    const { name, department } = req.body;

    if (!name && !department) {
        res.status(400);
        throw new Error('Please provide at least one field to update (name or department)');
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (name) user.name = name.trim();
    if (department !== undefined) user.department = department.trim();

    await user.save();

    res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            department: user.department,
            role: user.role,
            avatar: user.avatar,
        },
    });
});

/**
 * @desc    Change password
 * @route   PUT /api/profile/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        res.status(400);
        throw new Error('Please provide current password and new password');
    }

    if (newPassword.length < 8) {
        res.status(400);
        throw new Error('New password must be at least 8 characters');
    }

    // Fetch with password (select: false by default)
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Validate current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        res.status(401);
        throw new Error('Current password is incorrect');
    }

    // Set new password (pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    res.json({
        success: true,
        message: 'Password changed successfully',
    });
});

/**
 * @desc    Toggle two-factor authentication
 * @route   PUT /api/profile/toggle-2fa
 * @access  Private
 */
export const toggle2FA = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.twoFactorEnabled = !user.twoFactorEnabled;
    await user.save();

    res.json({
        success: true,
        message: `Two-factor authentication ${user.twoFactorEnabled ? 'enabled' : 'disabled'}`,
        data: {
            twoFactorEnabled: user.twoFactorEnabled,
        },
    });
});
