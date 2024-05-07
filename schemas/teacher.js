import * as mongoose from 'mongoose';

const TeacherSchema = new mongoose.Schema({
    socialSecurityNumber: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        unique: true,
    },
    user: {
        type: String,
        required: true,
    },
    gmail: {
        type: String,
    },
    phoneNumber: {
        type: String,
    },
});

export const Teacher = mongoose.model("Teacher", TeacherSchema);