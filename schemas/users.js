import * as mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    userID: String,
    permission: Number,
    dataType: [String],
});

export const UserDB = mongoose.model("User", userSchema);