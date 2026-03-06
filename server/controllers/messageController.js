import asyncHandler from 'express-async-handler';
import Message from '../models/Message.js';
import User from '../models/User.js';

/**
 * @desc    Send a new message
 * @route   POST /api/messages
 * @access  Private (Manager, Auditor)
 */
export const sendMessage = asyncHandler(async (req, res) => {
    const { receiverId, message } = req.body;
    const sender = req.user;

    // Reject employees completely
    if (sender.role === 'Employee') {
        res.status(403);
        throw new Error('Employees cannot send messages.');
    }

    // Verify Receiver
    const receiver = await User.findById(receiverId);
    if (!receiver) {
        res.status(404);
        throw new Error('Message recipient not found.');
    }

    // Auditor checks: can ONLY send to Manager
    if (sender.role === 'Auditor' && receiver.role !== 'Manager') {
        res.status(403);
        throw new Error('Auditors can only send messages to Managers.');
    }

    // Manager checks: can send to Auditor or Employee (or other managers technically, but prompt specified employee/auditor)
    // No specific block needed for manager sending.

    // Create message
    const newMessage = await Message.create({
        senderRole: sender.role,
        receiverRole: receiver.role,
        senderId: sender._id,
        receiverId: receiver._id,
        message,
    });

    res.status(201).json({
        success: true,
        data: newMessage,
    });
});

/**
 * @desc    Get messages for the current user
 * @route   GET /api/messages
 * @access  Private
 */
export const getMessages = asyncHandler(async (req, res) => {
    // If user is Employee: only show messages WHERE receiverId = currentUser
    // If user is Auditor: show messages WHERE receiverId = currentUser OR senderId = currentUser
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
    // Only Managers need to list users to send to (Employees & Auditors)
    if (req.user.role !== 'Manager') {
        res.status(403);
        throw new Error('Only managers can bulk query recipients');
    }

    const users = await User.find({
        role: { $in: ['Employee', 'Auditor'] },
        isActive: true
    }).select('name role email avatar auditorType department');

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
