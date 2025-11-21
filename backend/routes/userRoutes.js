const express = require("express");
const { protectClerk } = require("../middlewares/authMiddleware");
const { getUserData, promoteToAdmin, demoteToMember } = require("../controllers/userController");


const userRouter = express.Router();

// Super-Admin-only middleware
const superadminOnly = (req, res, next) => {
  if (req.user && req.user.role == "superadmin") {
    next();
  } else {
    res.status(403).json({ message: "Admin access only" });
  }
};

userRouter.get("/", protectClerk, getUserData);
userRouter.put("/:userId/promote", protectClerk, superadminOnly, promoteToAdmin);
userRouter.put("/:userId/demote", protectClerk, superadminOnly, demoteToMember);


module.exports = userRouter;