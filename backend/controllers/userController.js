const User = require("../models/User");

// Get /api/user/
exports.getUserData = async (req, res) => {
  try {
    const role = req.user.role;

    // res.json({ success: true, role });
    res.json({ success: true, role, user: req.user });

    // const userId = req.auth.userId;

    // // Fetch user from database
    // const user = await User.findById(userId).select("-password");

    // if (!user) {
    //     return res.status(404).json({ message: "User not found" });
    // }

    // res.status(200).json(user);
  } catch (error) {
    res.json({ success: false, message: error.message });
    // console.error(error.message);
    // res.status(500).json({ message: "Server Error" });
  }
};

exports.promoteToAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = "admin";
    await user.save();

    return res.json({ success: true, message: "User promoted to Admin", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.demoteToMember = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = "member";
    await user.save();

    return res.json({ success: true, message: "User demoted to Member", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
