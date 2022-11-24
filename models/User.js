import mongoose from "mongoose";

// Defining Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, trim: true },
  nickname: { type: String, required: true, trim: true },
  password: { type: String, required: true, trim: true },
  role: {type: String,
  enum: ["user", "admin"],
  default: "user"},
  last_logged_in:{type:Date,default:Date.now}
})

// Model
const UserModel = mongoose.model("user", userSchema)

export default UserModel