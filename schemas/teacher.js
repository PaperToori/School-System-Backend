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
    },
    user: {
        type: String,
        required: true,
    },
    email: {
        type: String,
    },
    phoneNumber: {
        type: String,
    },
    tags: {
        type: [String],
    },
    adress: {
        type: String,
    },
    zip: {
        type: String,
    },
    city: {
        type: String,
    },
    course: {
        type: [String],
    },
});

export const Teacher = mongoose.model("Teacher", TeacherSchema);