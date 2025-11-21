const express = require("express");
const router = express.Router();
const {
  createPost,
  updatePost,
  deletePost,
  getAllPosts,
  getAllPostsForDashboard,
  getPostBySlug,
  getPostsByTag,
  searchPosts,
  incrementView,
  likePost,
  getTopPosts,
} = require("../controllers/researchPostController");
const { protect, protectClerk } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const { uploadMultiple } = require("../middlewares/uploadMiddleware");

// Admin-only middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role == 'admin' || req.user.role == 'superadmin') {
    next();
  } else {
    res.status(403).json({ message: "Admin access only" });
  }
};

// Cloudinary Image Upload Route
// router.post("/upload-cloudinary", upload.array("images", 5), protectClerk, createPost);

// router.post("/", protectClerk, adminOnly, createPost);
router.post("/", protectClerk, adminOnly, uploadMultiple, createPost);
router.get("/", getAllPosts);
router.get("/dashboard", protectClerk, getAllPostsForDashboard);
router.get("/slug/:slug", getPostBySlug);
router.put("/:id", protectClerk, adminOnly, uploadMultiple, updatePost);
router.delete("/:id", protectClerk, adminOnly, deletePost);
router.get("/tag/:tag", getPostsByTag);
router.get("/search", searchPosts);
router.post("/:id/view", incrementView);
// router.post("/:id/like", protectClerk, likePost);
router.put("/:id/like", protectClerk, likePost);
router.get("/trending", getTopPosts);

module.exports = router;
