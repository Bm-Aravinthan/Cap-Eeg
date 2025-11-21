const express = require("express");
const { protectClerk } = require("../middlewares/authMiddleware");
const {
  createJoinRequest,
  getAllJoinRequests,
  acceptJoinRequest,
  rejectJoinRequest,
  requestStatus,
  deleteJoinRequest,
} = require("../controllers/joinRequestController");

const router = express.Router();

// Super-Admin-only middleware
const superadminOnly = (req, res, next) => {
  if (req.user && req.user.role == "superadmin") {
    next();
  } else {
    res.status(403).json({ message: "Admin access only" });
  }
};

router.post("/", protectClerk, createJoinRequest);
router.get("/", protectClerk, getAllJoinRequests);
router.get("/status", protectClerk, requestStatus);
router.put("/accept/:requestId", protectClerk, superadminOnly, acceptJoinRequest);
router.put("/reject/:requestId", protectClerk, superadminOnly, rejectJoinRequest);
router.delete("/:requestId", protectClerk, superadminOnly, deleteJoinRequest);

module.exports = router;
