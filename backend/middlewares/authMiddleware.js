const jwt = require("jsonwebtoken");
const User = require("../models/User");

// This is for Clerk authentication middleware - To check if user is authenticated
exports.protectClerk = async (req, res, next) => {
    try {
        // Check if user is authenticated via Clerk
        const {userId} = req.auth;
        // console.log("Clerk Authenticated User ID:", userId);
        if (!userId) {
            res.json({ success: false, message: "User not authenticated" });
            // return res.status(401).json({ message: "Not authorized, no user ID" });
        }else{
            const user = await User.findById(userId);
            req.user = user;
            next();
        }
        
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server Error" });
    }
}

// This is for JWT authentication middleware - To check if user is authenticated
exports.protect = async (req, res, next) => {
    try {
        let token = req.headers.authorization;

        if (token && token.startsWith("Bearer")) {
            token = token.split(" ")[1]; // Extract token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");
            next();
        } else {
            res.status(401).json({ message: "Not authorized, no token" });
        }
    } catch (error) {
        res.status(401).json({ message: "Token failed", error: error.message });
    }
};
