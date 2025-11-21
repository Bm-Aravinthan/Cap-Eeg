const express = require("express");
const router = express.Router();
const { protectClerk } = require("../middlewares/authMiddleware");
const { getDashboardSummary } = require("../controllers/dashboardController");

// Admin-only middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role == "admin" || req.user.role == "superadmin") {
    next();
  } else {
    res.status(403).json({ message: "Admin access only" });
  }
};

router.get("/", protectClerk, adminOnly, getDashboardSummary);

module.exports = router;