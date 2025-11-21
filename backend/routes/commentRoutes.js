const express = require("express");
const router = express.Router();
const {
  addComment,
  getCommentsByPost,
  deleteComment,
  getAllComments,
} = require("../controllers/commentController");
const { protectClerk } = require("../middlewares/authMiddleware");

router.post("/:postId", protectClerk, addComment);
router.get("/:postId", getCommentsByPost);
router.get("/", protectClerk, getAllComments);
router.delete("/:commentId", protectClerk, deleteComment);

module.exports = router;
