const ResearchPost = require("../models/ResearchPost");
const Comment = require("../models/Comment");

// @desc    Dashboard summary
// @route   POST /api/dashboard-summary
// @access  Private (Admin only)
const getDashboardSummary = async (req, res) => {
  try {
    const user = req.user;
    const scope = req.query.scope || "me"; // default to "me"

    // Only superadmin sees all, others see their own
    // const filter = user.role === "superadmin" ? {} : { createdBy: user._id };
    // Superadmin can see all or just own data based on query param
    const filter =
      user.role === "superadmin" && scope === "all" ? {} : { author: user._id };
      
    // Basic counts
    const [totalPosts, drafts, published, totalComments, aiGenerated] =
      await Promise.all([
        ResearchPost.countDocuments(filter),
        ResearchPost.countDocuments({ ...filter, isDraft: true }),
        ResearchPost.countDocuments({ ...filter, isDraft: false }),
        Comment.countDocuments({ ...filter }),
        ResearchPost.countDocuments({ ...filter, generatedByAI: true }),
      ]);

    const totalViewsAgg = await ResearchPost.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: "$views" } } },
    ]);
    const totalLikesAgg = await ResearchPost.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: "$likes" } } },
    ]);
    const totalViews = totalViewsAgg[0]?.total || 0;
    const totalLikes = totalLikesAgg[0]?.total || 0;

    // Top performing posts
    const topPosts = await ResearchPost.find({ ...filter, isDraft: false })
      .select("title coverImageUrl views likes")
      .sort({ views: -1, likes: -1 })
      .limit(5);

    // Optional: filter comments by posts that belong to the user
    let recentComments = [];
    if (user.role === "superadmin" && scope === "all") {
      recentComments = await Comment.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("author", "username image")
        .populate("post", "title coverImageUrl");
    } else {
      // only comments under user's posts
      const userPosts = await ResearchPost.find(filter).select("_id");
      const userPostIds = userPosts.map((p) => p._id);
      recentComments = await Comment.find({ post: { $in: userPostIds } })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("author", "username image")
        .populate("post", "title coverImageUrl");
    }

    // // Recent comments
    // const recentComments = await Comment.find()
    //   .sort({ createdAt: -1 })
    //   .limit(5)
    //   .populate("author", "username image")
    //   .populate("post", "title coverImageUrl");

    // Tag usage aggregation
    const tagUsage = await ResearchPost.aggregate([
      { $match: filter },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $project: { tag: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      scope,
      stats: {
        totalPosts,
        drafts,
        published,
        totalViews,
        totalLikes,
        totalComments,
        aiGenerated,
      },
      topPosts,
      recentComments,
      tagUsage,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch dashboard summary",
      error: error.message,
    });
  }
};

module.exports = { getDashboardSummary };
