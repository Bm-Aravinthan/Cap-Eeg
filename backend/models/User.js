const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    
    _id: { type: String, required: true },
    // name: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    // password: { type: String, required: true },
    // profileImageUrl: { type: String, default: null },
    image: { type: String, default: null },
    bio: { type: String, default: "" }, // optional short bio
    role: { type: String, enum: ["admin", "member"], default: "member" }, // Role-based access
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);