require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
// import { clerkMiddleware } from "@clerk/express";
const { clerkMiddleware } = require("@clerk/express");
const { clerkWebhooks } = require("./controllers/clerkWebhooks");
const userRouter = require("./routes/userRoutes");

const authRoutes = require("./routes/authRoutes");
const researchPostRoutes = require("./routes/researchPostRoutes");
const commentRoutes = require("./routes/commentRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const aiRoutes = require("./routes/aiRoutes");
const joinRequestRoutes = require("./routes/joinRequestRoutes");
const { connectCloudinary } = require("./config/cloudinary");

const app = express();

// Middleware to handle CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Connect Database
connectDB();
connectCloudinary();

// Middleware
app.use(express.json());

// Clerk Middleware
app.use(clerkMiddleware());

// Api to listen to clerk webhooks
app.use("/api/clerk", clerkWebhooks);
app.use("/api/user", userRouter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", researchPostRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/dashboard-summary", dashboardRoutes);
app.use("/api/join-requests", joinRequestRoutes);

app.use("/api/ai", aiRoutes);

// Serve uploads folder
// app.use("/uploads", express.static(path.join(__dirname, "uploads"), {}));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));