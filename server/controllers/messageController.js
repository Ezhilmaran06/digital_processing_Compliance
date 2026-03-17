import asyncHandler from 'express-async-handler';
import Message from '../models/ChatMessage.js';
import User from '../models/User.js';
import fs from 'fs';

/**
 * @desc    Send a new message
 * @route   POST /api/messages
 * @access  Private (Manager, Auditor, Admin)
 */
export const sendMessage = asyncHandler(async (req, res) => {
    const { receiverId, message } = req.body;
    const sender = req.user;

    // Verify Receiver
    const receiver = await User.findById(receiverId);
    if (!receiver) {
        res.status(404);
        throw new Error('Message recipient not found.');
    }

    // Auditors can send to Managers and Admins
    if (sender.role === 'Auditor' && !['Manager', 'Admin'].includes(receiver.role)) {
        res.status(403);
        throw new Error('Auditors can only send messages to Managers or Admins.');
    }

    // Admins can send to anyone
    // No explicit restriction needed for Admin unless specified otherwise.


    const s_role = sender.role.charAt(0).toUpperCase() + sender.role.slice(1).toLowerCase();
    const r_role = receiver.role.charAt(0).toUpperCase() + receiver.role.slice(1).toLowerCase();

    console.log(`[CHAT] SENDING MESSAGE: ${s_role} -> ${r_role}`);

    try {
        const newMessage = await Message.create({
            senderRole: s_role,
            receiverRole: r_role,
            senderId: sender._id,
            receiverId: receiver._id,
            message,
        });

        res.status(201).json({
            success: true,
            data: newMessage,
        });
    } catch (error) {
        console.error('❌ MESSAGE CREATE ERROR:', error.message);
        if (error.name === 'ValidationError') {
            console.error('Validation Details:', JSON.stringify(error.errors, null, 2));
        }
        res.status(400);
        throw new Error(`Message delivery failed: ${error.message}`);
    }
});

/**
 * @desc    Get messages for the current user
 * @route   GET /api/messages
 * @access  Private
 */
export const getMessages = asyncHandler(async (req, res) => {
    // If user is Employee: only show messages WHERE receiverId = currentUser
    // If user is Auditor/Admin: show messages WHERE receiverId = currentUser OR senderId = currentUser
    // If user is Manager: show all messages WHERE receiverId = currentUser OR senderId = currentUser, OR just show all messages for oversight.

    let query = {};

    if (req.user.role !== 'Manager') {
        // We fetch conversations they are part of
        query = {
            $or: [
                { receiverId: req.user._id },
                { senderId: req.user._id }
            ]
        };
    }
    // If Manager, query remains {} to fetch all messages

    const messages = await Message.find(query)
        .sort({ createdAt: -1 })
        .populate('senderId', 'name role avatar auditorType')
        .populate('receiverId', 'name role avatar auditorType');

    res.status(200).json({
        success: true,
        data: messages,
    });
});

/**
 * @desc    Get potential message recipients
 * @route   GET /api/messages/users
 * @access  Private
 */
export const getMessageRecipients = asyncHandler(async (req, res) => {
    // Only Managers and Admins can bulk query recipients
    if (req.user.role !== 'Manager' && req.user.role !== 'Admin') {
        res.status(403);
        throw new Error('Not authorized to query recipients');
    }

    let roles = [];
    if (req.user.role === 'Manager') {
        roles = ['Employee', 'Auditor', 'Admin'];
    } else if (req.user.role === 'Admin') {
        roles = ['Manager'];
    }

    const users = await User.find({
        role: { $in: roles },
        _id: { $ne: req.user._id }
    }).select('name role email avatar auditorType department');

    console.log(`Found ${users.length} potential recipients for ${req.user.name} (${req.user.role})`);

    res.status(200).json({
        success: true,
        data: users,
    });
});

/**
 * @desc    Get unread message count
 * @route   GET /api/messages/unread
 * @access  Private
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
    const count = await Message.countDocuments({
        receiverId: req.user._id,
        read: false,
    });

    res.status(200).json({
        success: true,
        data: { count },
    });
});

/**
 * @desc    Mark a message as read
 * @route   PATCH /api/messages/:id/read
 * @access  Private
 */
export const markAsRead = asyncHandler(async (req, res) => {
    const message = await Message.findById(req.params.id);

    if (!message) {
        res.status(404);
        throw new Error('Message not found');
    }

    // Ensure the person marking it read is the receiver
    if (message.receiverId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this message');
    }

    message.read = true;
    await message.save();

    res.status(200).json({
        success: true,
        data: message,
    });
});
