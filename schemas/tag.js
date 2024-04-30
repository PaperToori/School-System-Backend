import * as mongoose from 'mongoose';

const TagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
});

export const Tag = mongoose.model('Tag', TagSchema);