import * as mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    subject: {
        type: String,
        required: true,
    },
    group: {
        type: String,
        required: true,
    },
    teacher: {
        type: String,
        required: true,
    }
});

export const Course = mongoose.model("Course", CourseSchema);