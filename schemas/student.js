import * as mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    tags: {
        type: [String],
        required: true,
    },
    gmail: {
        type: String,
    },
    phoneNumber: {
        type: String,
    },
});

export const Student = mongoose.model("Student", StudentSchema);