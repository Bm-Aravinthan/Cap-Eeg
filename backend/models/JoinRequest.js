const mongoose = require("mongoose");

const JoinRequestSchema = new mongoose.Schema(
  {
    userId: { type: String, ref: "User", required: true },
    // name: { type: String, required: true },
    // email: { type: String, required: true },

    message: { type: String }, // optional explanation
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("JoinRequest", JoinRequestSchema);
