import * as mongoose from 'mongoose';

const SubjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
});

export const Subject = mongoose.model("Subject", SubjectSchema);