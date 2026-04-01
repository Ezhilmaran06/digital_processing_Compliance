import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true, // E.g. "Employees", "Auditors"
        },
    },
    {
        timestamps: true,
    }
);

const Group = mongoose.models.Group || mongoose.model('Group', groupSchema);

export default Group;
