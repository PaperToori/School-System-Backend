import * as mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    userID: String,
    permission: Number
});

export const UserDB  = mongoose.model("User", userSchema);