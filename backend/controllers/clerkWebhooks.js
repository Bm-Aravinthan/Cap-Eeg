const User = require("../models/User");
const { Webhook } = require("svix");

const clerkWebhooks = async (req, res) => {
    try {
        // Create a svix instance with clerk webhook secret
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        // Getting headers
        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        }

        // Verifying headers
        await whook.verify(JSON.stringify(req.body), headers);

        // Getting data from request body
        const { data, type } = req.body;

        const userData = {
            _id: data.id,
            email: data.email_addresses[0].email_address,
            username: data.first_name + " " + data.last_name,
            image: data.image_url,
            // password: "clerk_default_password", // Placeholder, consider a better approach
        }

        // Switch cases for different events
        switch (type) {
            case "user.created":{
                await User.create(userData);
                break;
            }

            case "user.updated":{
                await User.findByIdAndUpdate(data.id, userData);
                break;
            }

            case "user.deleted":{
                await User.findByIdAndDelete(data.id);
                break;
            }
        
            default:
                break;
        }
        res.status(200).json({ success: true, message: "Webhook Recieved" });
    } catch (error) {
        console.error(error.message);
        res.status(400).json({ success: false, message: "Webhook Error: " + error.message });
    }
}

module.exports = { clerkWebhooks };