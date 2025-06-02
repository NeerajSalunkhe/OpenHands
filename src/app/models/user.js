import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  username: { type: String },
  profilephoto: { type: String },
  razorpayid: { type: String },
  razorpaysecret: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  followers: {type:[String],default:[]},
  following: {type:[String],default:[]},
  earned: { type: Number, default: 0 },
});

// Prevent model overwrite on hot reloads
const User = mongoose.models?.User || mongoose.model("User", userSchema);

export default User;
