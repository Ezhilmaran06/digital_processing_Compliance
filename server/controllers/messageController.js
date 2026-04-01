import asyncHandler from 'express-async-handler';
import Message from '../models/ChatMessage.js';
import User from '../models/User.js';
import Group from '../models/Group.js';
import { getIo } from '../socket.js';

/**
 * @desc    Send a new message
 * @route   POST /api/messages
 * @access  Private 
 */
export const sendMessage = asyncHandler(async (req, res) => {
    const { receiverId, groupId, message } = req.body;
    const sender = req.user;

    let targetGroup = null;
    let targetReceiver = null;

    if (groupId) {
        targetGroup = await Group.findById(groupId);
        if (!targetGroup) {
            res.status(404);
            throw new Error('Group not found.');
        }

        // Validate access
        if (sender.role === 'Employee' && targetGroup.name !== 'Employees') {
            res.status(403); throw new Error('Not authorized to message this group.');
        }
        if (sender.role === 'Auditor' && targetGroup.name !== 'Auditors') {
            res.status(403); throw new Error('Not authorized to message this group.');
        }
    } else if (receiverId) {
        targetReceiver = await User.findById(receiverId);
        if (!targetReceiver) {
            res.status(404);
            throw new Error('Message recipient not found.');
        }
    } else {
        res.status(400); throw new Error('Must provide receiverId or groupId.');
    }

    try {
        const newMessage = await Message.create({
            senderRole: sender.role,
            receiverRole: targetReceiver ? targetReceiver.role : 'Group',
            senderId: sender._id,
            receiverId: receiverId || null,
            groupId: groupId || null,
            message,
        });

        // Populate to send back
        const populatedMessage = await Message.findById(newMessage._id)
            .populate('senderId', 'name role avatar auditorType')
            .populate('receiverId', 'name role avatar auditorType')
            .populate('groupId', 'name');

        const io = getIo();
        if (groupId) {
            io.to(groupId.toString()).emit('receiveMessage', populatedMessage);
        } else if (receiverId) {
            io.to(receiverId.toString()).emit('receiveMessage', populatedMessage);
            io.to(sender._id.toString()).emit('receiveMessage', populatedMessage);
        }

        res.status(201).json({
            success: true,
            data: populatedMessage,
        });
    } catch (error) {
        res.status(400);
        throw new Error(`Message delivery failed: ${error.message}`);
    }
});

/**
 * @desc    Get messages
 * @route   GET /api/messages
 * @access  Private
 */
export const getMessages = asyncHandler(async (req, res) => {
    const allowedGroupNames = [];
    if (req.user.role === 'Manager' || req.user.role === 'Admin') {
        allowedGroupNames.push('Employees', 'Auditors');
    } else if (req.user.role === 'Employee') {
        allowedGroupNames.push('Employees');
    } else if (req.user.role === 'Auditor') {
        allowedGroupNames.push('Auditors');
    }

    const groups = await Group.find({ name: { $in: allowedGroupNames } });
    const groupIds = groups.map(g => g._id);

    let query = {};
    if (req.user.role !== 'Manager' && req.user.role !== 'Admin') {
        query = {
            $or: [
                { receiverId: req.user._id },
                { senderId: req.user._id },
                { groupId: { $in: groupIds } }
            ]
        };
    }

    const messages = await Message.find(query)
        .sort({ createdAt: -1 })
        .populate('senderId', 'name role avatar auditorType')
        .populate('receiverId', 'name role avatar auditorType')
        .populate('groupId', 'name');

    res.status(200).json({
        success: true,
        data: messages,
    });
});

/**
 * @desc    Get potential message recipients & groups
 * @route   GET /api/messages/users
 * @access  Private
 */
export const getMessageRecipients = asyncHandler(async (req, res) => {
    let roles = [];
    if (req.user.role === 'Manager' || req.user.role === 'Admin') {
        roles = ['Employee', 'Auditor', 'Manager', 'Admin'];
    } else if (req.user.role === 'Employee') {
        roles = ['Employee', 'Manager'];
    } else if (req.user.role === 'Auditor') {
        roles = ['Auditor', 'Manager'];
    }

    const users = await User.find({
        role: { $in: roles },
        _id: { $ne: req.user._id }
    }).select('name role email avatar auditorType department');

    const allowedGroupNames = [];
    if (req.user.role === 'Manager' || req.user.role === 'Admin') {
        allowedGroupNames.push('Employees', 'Auditors');
    } else if (req.user.role === 'Employee') {
        allowedGroupNames.push('Employees');
    } else if (req.user.role === 'Auditor') {
        allowedGroupNames.push('Auditors');
    }

    // Auto-create Groups if they don't exist
    for (const gName of allowedGroupNames) {
        await Group.findOneAndUpdate({ name: gName }, { name: gName }, { upsert: true, new: true, setDefaultsOnInsert: true });
    }
    
    const groups = await Group.find({ name: { $in: allowedGroupNames } });

    res.status(200).json({
        success: true,
        data: { users, groups },
    });
});

/**
 * @desc    Get unread count
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

    // Since anyone can view group messages, we don't strictly restrict read flags here 
    // Usually group message read receipts are more complex. We'll simplify.
    message.read = true;
    await message.save();

    res.status(200).json({
        success: true,
        data: message,
    });
});
