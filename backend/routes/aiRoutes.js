const express = require("express");
const router = express.Router();
const { protect, protectClerk } = require("../middlewares/authMiddleware");
const {
  generateResearchPost,
  generateResearchPostIdeas,
  generateCommentReply,
  generatePostSummary,
} = require("../controllers/aiController");

router.post("/generate", protectClerk, generateResearchPost);
router.post("/generate-ideas", protectClerk, generateResearchPostIdeas);
router.post("/generate-reply", protectClerk, generateCommentReply);
router.post("/generate-summary", generatePostSummary);

module.exports = router;
