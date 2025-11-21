export const BASE_URL = "http://localhost:8000";

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register", // Signup
    LOGIN: "/api/auth/login", // Authenticate user & return JWT token
    GET_PROFILE: "/api/auth/profile", // Get logged-in user details
    GET_USER_CLERK: "/api/user", // Get logged-in user details
    JOIN_REQUESTS: "/api/join-requests", // research lab join requests
    JOIN_REQUESTS_STATUS: "/api/join-requests/status", // Get join request status
  },

  IMAGE: {
    UPLOAD_IMAGE: "/api/auth/upload-image", // Upload profile picture
    UPLOAD_IMAGE_CLOUDINARY: "/api/posts/upload-cloudinary", // Upload image to cloudinary
  },

  DASHBOARD: {
    GET_DASHBOARD_DATA: "/api/dashboard-summary", // Get Dashboard Data
  },

  AI: {
    GENERATE_RESEARCH_POST: "/api/ai/generate", // Generate a research post using AI
    GENERATE_RESEARCH_POST_IDEAS: "/api/ai/generate-ideas", // Generate a research post ideas using AI
    GENERATE_COMMENT_REPLY: "/api/ai/generate-reply", // Generate a reply using AI
    GENERATE_POST_SUMMARY: "/api/ai/generate-summary", // Generate post summary using AI
  },

  POSTS: {
    CREATE: "/api/posts", // Create a new research post (Admin only)
    GET_ALL: "/api/posts", // Get all published research posts
    GET_ALL_FOR_DASHBOARD: "/api/posts/dashboard", // Get all published research posts
    GET_TRENDING_POSTS: "/api/posts/trending", // Get trending research posts
    GET_BY_SLUG: (slug) => `/api/posts/slug/${slug}`, // Get a single research post by slug
    UPDATE: (id) => `/api/posts/${id}`, // Update a research post
    DELETE: (id) => `/api/posts/${id}`, // Delete a research post
    GET_BY_TAG: (tag) => `/api/posts/tag/${tag}`, // Get posts by a specific tag
    SEARCH: "/api/posts/search", // Search posts by title or content
    INCREMENT_VIEW: (id) => `/api/posts/${id}/view`, // Increment view count
    LIKE: (id) => `/api/posts/${id}/like`, // Like a research post
  },

  COMMENTS: {
    ADD: (postId) => `/api/comments/${postId}`, // Add a comment to a post
    GET_ALL: "/api/comments", // Get all comments
    GET_ALL_BY_POST: (postId) => `/api/comments/${postId}`, // Get all comments for a post
    DELETE: (commentId) => `/api/comments/${commentId}`, // Delete a comment
  },
};
