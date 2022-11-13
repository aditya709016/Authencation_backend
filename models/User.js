import mongoose from "mongoose";

// Defining Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, trim: true },
  nickname: { type: String, required: true, trim: true },
  password: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true }
})

// Model
const UserModel = mongoose.model("user", userSchema)

export default UserModel