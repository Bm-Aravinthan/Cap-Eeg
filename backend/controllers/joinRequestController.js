const JoinRequest = require("../models/JoinRequest");
const User = require("../models/User");

exports.requestStatus = async (req, res) => {
  try {
    const request = await JoinRequest.findOne({ userId: req.user.id });

    if (!request) {
      return res.json({
        hasRequested: false,
        status: null,
      });
    }

    return res.json({
      hasRequested: true,
      status: request.status, // "pending" | "rejected" | "accepted"
      requestId: request._id,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createJoinRequest = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const existing = await JoinRequest.findOne({ userId, status: "pending" });
    console.log(existing);
    if (existing)
      return res.json({
        success: false,
        message: "Request already submitted.",
      });

    const request = await JoinRequest.create({
      userId,
      //   name: req.user.username,
      //   email: req.user.email,
      message: req.body.message || "",
    });

    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.getAllJoinRequests = async (req, res) => {
  try {
    const status = req.query.status || "pending"; // pending | accepted | all
    
    let data = [];

    const pendingCount = await JoinRequest.countDocuments({
      status: "pending",
    });
    const acceptedCount = await JoinRequest.countDocuments({
      status: "accepted",
    });
    const userCount = await User.countDocuments();

    // 🔥 CASE 1: Pending or Accepted join requests
    if (status === "pending" || status === "accepted") {
      data = await JoinRequest.find({ status })
        .populate("userId", "username email image")
        .sort({ createdAt: -1 });

      return res.json({
        success: true,
        type: "requests",
        requests: data,
        counts: {
          pending: pendingCount,
          accepted: acceptedCount,
          users: userCount,
        },
      });
    }

    // 🔥 CASE 2: All students (users table)
    if (status === "all") {
      data = await User.find()
        .select("username email role createdAt")
        .sort({ createdAt: -1 });

      return res.json({
        success: true,
        type: "users",
        users: data,
        counts: {
          pending: pendingCount,
          accepted: acceptedCount,
          users: userCount,
        },
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



exports.acceptJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await JoinRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    await User.findByIdAndUpdate(request.userId, { role: "admin" });

    request.status = "accepted";
    await request.save();

    res.json({ success: true, message: "Request accepted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.rejectJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { message } = req.body;

    await JoinRequest.findByIdAndUpdate(requestId, {
      status: "rejected",
    });

    // optionally send email/notification later

    res.json({ success: true, message: "Request rejected" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await JoinRequest.findById(requestId);
    if (!request)
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });

    await JoinRequest.findByIdAndDelete(requestId);

    return res.json({ success: true, message: "Join request deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

