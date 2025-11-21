const mongoose = require("mongoose");

const ResearchPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true }, // markdown
    coverImageUrl: { type: String, default: null },
    images: [{ type: String }],
    documentUrl: { type: String },
    tags: [{ type: String }],
    author: {
      type: String,
      ref: "User",
      required: true,
    },
    isDraft: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: String, ref: "User" }],
    generatedByAI: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ResearchPost", ResearchPostSchema);
