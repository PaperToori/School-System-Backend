import * as mongoose from 'mongoose';

const GroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    members: [ 
        // String
        { name: String, id: String }
    ]
});

export const Group = mongoose.model("Group", GroupSchema);