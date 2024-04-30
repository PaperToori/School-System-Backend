import * as mongoose from 'mongoose';

const LessonTimeSchema = new mongoose.Schema({
    weekDay: Number,
    startTime: Number,
    endTime: Number,
});

export const LessonTime = mongoose.model("LessonTime", LessonTimeSchema);