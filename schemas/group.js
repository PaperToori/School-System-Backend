import * as mongoose from 'mongoose';

const GroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    members: {
        type: [String],
    },
});

export const Group = mongoose.model("Group", GroupSchema);