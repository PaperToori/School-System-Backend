import * as mongoose from 'mongoose';

const LessonSchema = new mongoose.Schema({
    classroom: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    teacher: {
        type: String,
        required: true,
    },
    group: {
        type: String,
        required: true,
    },
    week: {
        type: Number,
        required: true,
        min: 1,
        max: 53,
    },
    weekDay: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    startTime: {
        type: Number,
        required: true,
        min: 0,
    },
    endTime: {
        type: Number,
        required: true,
        max: 143,
    },
    date: {
        type: Number,
        min: 1,
        max: 31,
    },
    month: {
        type: Number,
        min: 1,
        max: 12,
    },
});

export const Lesson = mongoose.model("Lesson", LessonSchema);
