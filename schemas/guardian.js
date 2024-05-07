import * as mongoose from 'mongoose';

const GuardiansSchema = new mongoose.Schema({
    socialSecurityNumber: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    tags: {
        type: [String],
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
    adress: {
        type: String,
    },
    zip: {
        type: String,
    },
    city: {
        type: String,
    },
    child: {
        type: [String],
    },
});

export const Guardian = mongoose.model("Guardian", GuardiansSchema);