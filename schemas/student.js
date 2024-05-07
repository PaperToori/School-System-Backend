import * as mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
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
    tags: {
        type: [String],
    },
    email: {
        type: String,
    },
    phoneNumber: {
        type: String,
    },
    group: {
        type: String,
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
    guardian: {
        type: [String],
    },
});

export const Student = mongoose.model("Student", StudentSchema);