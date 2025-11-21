const ResearchPost = require("../models/ResearchPost");
const mongoose = require("mongoose");
const { v2: cloudinary } = require("cloudinary");
const { deleteFromCloudinary } = require("../utils/cloudinaryHelper.js");

// @desc    Create a new research post
// @route   POST /api/posts
// @access  Private (Admin only)
const createPost = async (req, res) => {
  try {
    // const { title, content, coverImageUrl, tags, isDraft, generatedByAI } = req.body;
    const { title, content, tags, isDraft, generatedByAI } = req.body;

    // Validation
    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }
    // if (!req.files.coverImage || req.files.coverImage.length === 0) {
    //   return res.status(400).json({ message: "Cover image is required" });
    // }

    const slug =
      title
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "") +
      "-" +
      Date.now();

    // 1️⃣ Upload cover image
    const coverImageRes = await cloudinary.uploader.upload(
      req.files.coverImage[0].path,
      {
        folder: "Cap-Eeg/CoverImages",
      }
    );
    const coverImageUrl = coverImageRes.secure_url;

    // 2️⃣ Upload optional research images
    let images = [];
    if (req.files.images && req.files.images.length > 0) {
      const uploadImages = req.files.images.map((file) =>
        cloudinary.uploader.upload(file.path, { folder: "Cap-Eeg/Images" })
      );
      const uploadedImages = await Promise.all(uploadImages);
      images = uploadedImages.map((img) => img.secure_url);
    }

    // 3️⃣ Upload optional research document (PDF)
    let documentUrl = "";
    if (req.files.document && req.files.document.length > 0) {
      // const ext = req.files.document[0].originalname.split(".").pop();
      // const docUpload = await cloudinary.uploader.upload(
      //   req.files.document[0].path,
      //   {
      //     resource_type: "raw",
      //     folder: "Cap-Eeg/Documents",
      //     use_filename: true,
      //     unique_filename: false,
      //     format: ext,
      //   }
      // );
      
      const docUpload = await cloudinary.uploader.upload(
        req.files.document[0].path,
        {
          // resource_type: "raw",
          folder: "Cap-Eeg/Documents",
          use_filename: true,
          unique_filename: false,
          // format: "pdf",
        }
      );
      documentUrl = docUpload.secure_url;
      // url = cloudinary.url("Cap-Eeg/Documents", {
      //   format: "pdf",
      //   secure: true,
      // });
      // console.log("Generated document URL:", url);
      console.log(docUpload);
    }

    const newPost = new ResearchPost({
      title,
      slug,
      content,
      coverImageUrl,
      images,
      documentUrl,
      tags,
      author: req.user._id,
      isDraft,
      generatedByAI,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create post", error: err.message });
  }
};

// @desc    Update an existing research post
// @route   PUT /api/posts/:id
// @access  Private (Author or Admin)
const updatePost = async (req, res) => {
  try {
    const post = await ResearchPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (
      post.author.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this post" });
    }

    const updatedData = req.body;
    if (updatedData.title) {
      updatedData.slug =
        updatedData.title
          .toLowerCase()
          .replace(/ /g, "-")
          .replace(/[^\w-]+/g, "") +
        "-" +
        Date.now();
    }

    const getPublicIdFromUrl = (url, resourceType = "image") => {
      try {
        const regex = /upload\/(?:v\d+\/)?(.+)\.[^/.]+$/;
        const match = url.match(regex);
        if (match && match[1]) {
          return match[1]; // Cap-Eeg/Documents/abc123
        }
        console.error("⚠️ Failed to extract public_id from URL:", url);
        return null;
      } catch (err) {
        console.error("❌ Error extracting public_id:", err.message);
        return null;
      }
    };

    // -------------------- HANDLE COVER IMAGE --------------------
    let coverImageUrl = post.coverImageUrl; // keep existing one by default

    if (req.files && req.files.coverImage && req.files.coverImage.length > 0) {
      // Delete old one from Cloudinary (if exists)
      if (post.coverImageUrl) {
        try {
          const urlParts = post.coverImageUrl.split("/");
          const fileName = urlParts[urlParts.length - 1].split(".")[0];
          const folderPath = urlParts
            .slice(urlParts.indexOf("Cap-Eeg"))
            .join("/")
            .split(".")[0];
          const publicId = folderPath.replace(/\.[^/.]+$/, ""); // remove extension if any

          console.log("🗑️ Deleting old cover image:", publicId);

          await cloudinary.uploader.destroy(publicId, {
            resource_type: "image",
          });
        } catch (error) {
          console.error("⚠️ Failed to delete old cover image:", error.message);
        }
      }

      // Upload the new one
      const uploadRes = await cloudinary.uploader.upload(
        req.files.coverImage[0].path,
        {
          folder: "Cap-Eeg/CoverImages",
        }
      );
      coverImageUrl = uploadRes.secure_url;
    }

    // If frontend explicitly requests to remove cover image
    if (req.body.removeCoverImage === "true" || req.body.coverImageRemoved) {
      if (post.coverImageUrl) {
        try {
          const urlParts = post.coverImageUrl.split("/");
          const fileName = urlParts[urlParts.length - 1].split(".")[0];
          const folderPath = urlParts
            .slice(urlParts.indexOf("Cap-Eeg"))
            .join("/")
            .split(".")[0];
          const publicId = folderPath.replace(/\.[^/.]+$/, "");

          console.log("🗑️ Removing cover image:", publicId);
          await cloudinary.uploader.destroy(publicId, {
            resource_type: "image",
          });
        } catch (error) {
          console.error("⚠️ Failed to delete cover image:", error.message);
        }
      }
      coverImageUrl = "";
    }

    updatedData.coverImageUrl = coverImageUrl;

    // -------------------- HANDLE RESEARCH IMAGES --------------------
    if (req.body.removedImages && Array.isArray(req.body.removedImages)) {
      for (const imgUrl of req.body.removedImages) {
        await deleteFromCloudinary(imgUrl);
      }

      // Remove deleted image URLs from post.images
      post.images = post.images.filter(
        (url) => !req.body.removedImages.includes(url)
      );

      // ✅ Ensure DB gets updated array
      updatedData.images = post.images;
    }

    // ✅ Handle new research image uploads
    if (req.files && req.files.images && req.files.images.length > 0) {
      const uploadedImages = await Promise.all(
        req.files.images.map((file) =>
          cloudinary.uploader.upload(file.path, { folder: "Cap-Eeg/Images" })
        )
      );
      const newImageUrls = uploadedImages.map((img) => img.secure_url);

      // Merge new images with existing
      updatedData.images = [...(post.images || []), ...newImageUrls];
    }

    // -------------------- HANDLE RESEARCH DOCUMENT --------------------
    let documentUrl = post.documentUrl;

    // ✅ Handle new document upload (replace old one)
    if (req.files && req.files.document && req.files.document.length > 0) {
      // If old document exists, delete it from Cloudinary
      if (post.documentUrl) {
        const publicId = getPublicIdFromUrl(post.documentUrl);
        if (publicId) {
          // await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
          await cloudinary.uploader.destroy(publicId);
          console.log("🗑️ Old document deleted from Cloudinary:", publicId);
        }
      }

      // Upload new document
      const docUpload = await cloudinary.uploader.upload(
        req.files.document[0].path,
        {
          // resource_type: "raw",
          folder: "Cap-Eeg/Documents",
          use_filename: true,
          unique_filename: false,
          // format: "pdf",
        }
      );
      const url = cloudinary.url("Cap-Eeg/Documents", {
        format: "pdf",
        secure: true,
      });
      console.log("Generated document URL:", url);
      documentUrl = docUpload.secure_url;
      console.log("✅ New document uploaded:", documentUrl);
    }

    if (req.body.removeDocument === "true" || req.body.documentRemoved) {
      if (post.documentUrl) {
        // const publicId = getPublicIdFromUrl(post.documentUrl, "raw");
        const publicId = getPublicIdFromUrl(post.documentUrl);
        if (publicId) {
          console.log("🗑️ Deleting document from Cloudinary:", publicId);
          // const result = await cloudinary.uploader.destroy(publicId, {
          //   resource_type: "raw",
          // });
          const result = await cloudinary.uploader.destroy(publicId);
          console.log("✅ Cloudinary delete result:", result);
        } else {
          console.error("⚠️ Could not extract valid public_id from URL.");
        }
      }

      documentUrl = "";
    }

    updatedData.documentUrl = documentUrl;

    const updatedPost = await ResearchPost.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );
    res.json(updatedPost);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Server Error", error: err.message });
  }
};

// @desc    Delete a research post
// @route   DELETE /api/posts/:id
// @access  Private (Author or Admin)
const deletePost = async (req, res) => {
 try {
    const post = await ResearchPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Server Error", error: err.message });
  }
};

// @desc    Get research posts by status (all, published, or draft) and include counts
// @route   GET /api/posts?status=published|draft|all&page=1
// @access  Public
const getAllPosts = async (req, res) => {
  try {
    const status = req.query.status || "published";
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    // Determine filter for main posts response
    let filter = {};

    // Apply status filter
    if (status === "published") filter.isDraft = false;
    else if (status === "draft") filter.isDraft = true;

    // Fetch paginated posts
    const posts = await ResearchPost.find(filter)
      .populate("author", "username image")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Count totals for pagination and tab counts
    const [totalCount, allCount, publishedCount, draftCount]  = await Promise.all([
        ResearchPost.countDocuments(filter), // for pagination of current tab
        ResearchPost.countDocuments({ }),
        ResearchPost.countDocuments({ isDraft: false }),
        ResearchPost.countDocuments({ isDraft: true }),
      ]);

    res.json({
      posts,
      page,
      totalPages: Math.ceil(totalCount / limit),
      // totalPages: Math.ceil(posts.length ? allCount / limit : 0),
      totalCount,
      counts: {
        all: allCount,
        published: publishedCount,
        draft: draftCount,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Server Error", error: err.message });
  }
};


// @desc    Get research posts by status (all, published, or draft) and include counts for dashboard
// @route   GET /api/posts?status=published|draft|all&page=1
// @access  Public
const getAllPostsForDashboard = async (req, res) => {
  try {
    const user = req.user;
    const scope = req.query.scope || "me"; // default to "me"
    // const status = req.query.status || "published";
    const status = req.query.status || "all";
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    // Determine filter for main posts response
    let filter = {};

    // Apply role + scope
    if (user.role !== "superadmin" || scope === "me") {
      filter.author = user._id; // only own posts
    }

    // Apply status filter
    if (status === "published") filter.isDraft = false;
    else if (status === "draft") filter.isDraft = true;

    // Fetch paginated posts
    const posts = await ResearchPost.find(filter)
      .populate("author", "username image")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    //  Counts for tabs (apply role + scope to counts)
    const countsFilter = {};
    if (user.role !== "superadmin" || scope === "me") {
      countsFilter.author = user._id;
    }

    // Count totals for pagination and tab counts
    // const [totalCount, allCount, publishedCount, draftCount] =
    const [allCount, publishedCount, draftCount] = await Promise.all([
      // ResearchPost.countDocuments(filter), // for pagination of current tab
      ResearchPost.countDocuments({ ...countsFilter }),
      ResearchPost.countDocuments({ ...countsFilter, isDraft: false }),
      ResearchPost.countDocuments({ ...countsFilter, isDraft: true }),
    ]);

    res.json({
      posts,
      page,
      // totalPages: Math.ceil(totalCount / limit),
      totalPages: Math.ceil(posts.length ? allCount / limit : 0),
      // totalCount,
      totalCount: allCount,
      counts: {
        all: allCount,
        published: publishedCount,
        draft: draftCount,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// @desc    Get a single research post by slug
// @route   GET /api/posts/:slug
// @access  Public
const getPostBySlug = async (req, res) => {
  try {
    const post = await ResearchPost.findOne({ slug: req.params.slug }).populate(
      "author",
      "username image"
    );
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Server Error", error: err.message });
  }
};

// @desc    Get posts by tag
// @route   GET /api/posts/tag/:tag
// @access  Public
const getPostsByTag = async (req, res) => {
  try {
    const posts = await ResearchPost.find({
      tags: req.params.tag,
      isDraft: false,
    }).populate("author", "username image");
    res.json(posts);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Server Error", error: err.message });
  }
};

// @desc    Search posts by title or content
// @route   GET /api/posts/search?q=keyword
// @access  Public
const searchPosts = async (req, res) => {
  try {
    const q = req.query.q;
    const posts = await ResearchPost.find({
      isDraft: false,
      $or: [
        { title: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
      ],
    }).populate("author", "username image");
    res.json(posts);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Server Error", error: err.message });
  }
};

// @desc    Increment post view count
// @route   PUT /api/posts/:id/view
// @access  Public
const incrementView = async (req, res) => {
  try {
    await ResearchPost.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json({ message: "View count incremented" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Server Error", error: err.message });
  }
};

// // @desc    Like a post
// // @route   PUT /api/posts/:id/like
// // @access  Public
// const likePost = async (req, res) => {
//   try {
//     await ResearchPost.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } });
//     // console.log(req.params.id);
//     res.json({ message: "Like added" });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Server Error", error: err.message });
//   }
// };
// @desc    Like or Unlike a post (toggle)
// @route   PUT /api/posts/:id/like
// @access  Private
const likePost = async (req, res) => {
  try {
    const userId = req.user.id; // ensure user middleware sets this
    const post = await ResearchPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user already liked
    const alreadyLiked = post.likedBy.includes(userId);

    if (alreadyLiked) {
      // Unlike
      post.likes -= 1;
      post.likedBy = post.likedBy.filter((id) => id.toString() !== userId);
    } else {
      // Like
      post.likes += 1;
      post.likedBy.push(userId);
    }

    await post.save();

    res.json({
      message: alreadyLiked ? "Unliked" : "Liked",
      liked: !alreadyLiked,
      likes: post.likes,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};


// @desc    Get top trending posts
// @route   GET /api/posts/trending
// @access  Private
const getTopPosts = async (req, res) => {
  try {
    // Top performing posts
    const posts = await ResearchPost.find({ isDraft: false })
      .sort({ views: -1, likes: -1 })
      .limit(5);

    res.json(posts);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Server Error", error: err.message });
  }
};

module.exports = {
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
};
