import * as mongoose from 'mongoose';

const TeacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    gmail: {
        type: String,
    },
    phoneNumber: {
        type: String,
    },
});

export const Teacher = mongoose.model("Teacher", TeacherSchema);