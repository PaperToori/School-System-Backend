import * as mongoose from 'mongoose';

const ClassroomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
});

export const Classroom = mongoose.model("Classroom", ClassroomSchema);