import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        employeeId: {
            type: String,
            unique: true,
            sparse: true,
        },
        name: {
            type: String,
            required: [true, 'Please provide a name'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email',
            ],
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false, // Don't include password in queries by default
        },
        role: {
            type: String,
            enum: {
                values: ['Employee', 'Manager', 'Admin', 'Client'],
                message: '{VALUE} is not a valid role',
            },
            required: [true, 'Please specify a role'],
        },
        department: {
            type: String,
            trim: true,
            default: '',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        avatar: {
            type: String,
            default: '',
        },
        twoFactorEnabled: {
            type: Boolean,
            default: false,
        },
        lastLogin: {
            type: Date,
            default: null,
        },
        notificationEmail: {
            type: String,
            trim: true,
            lowercase: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid notification email',
            ],
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

// Auto-generate employeeId before first save
userSchema.pre('save', async function (next) {
    if (this.isNew && !this.employeeId) {
        // Find the user with the highest employeeId
        const lastUser = await mongoose.model('User').findOne({}, {}, { sort: { 'employeeId': -1 } });
        let nextNumber = 1;

        if (lastUser && lastUser.employeeId) {
            const lastIdStr = lastUser.employeeId.replace('EMP-', '');
            const lastNumber = parseInt(lastIdStr, 10);
            if (!isNaN(lastNumber)) {
                nextNumber = lastNumber + 1;
            }
        }

        this.employeeId = `EMP-${String(nextNumber).padStart(4, '0')}`;
    }
    // Hash password before saving
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Index for faster queries
userSchema.index({ email: 1, role: 1 });

const User = mongoose.model('User', userSchema);

export default User;
