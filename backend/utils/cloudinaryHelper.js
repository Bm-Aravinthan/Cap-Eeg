const { v2: cloudinary } = require("cloudinary");


// A small utility that safely deletes any file from Cloudinary
const deleteFromCloudinary = async (url, resourceType = "image") => {
  try {
    if (!url) return;

    const regex = /upload\/(?:v\d+\/)?(.+)\.[^/.]+$/;
    const match = url.match(regex);
    if (!match || !match[1]) {
      console.warn("⚠️ Could not extract public_id from Cloudinary URL:", url);
      return;
    }

    const publicId = match[1]; // e.g., "folder/file-name"
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    console.log(`✅ Deleted ${resourceType} from Cloudinary:`, result);
    return result;
  } catch (error) {
    console.error("❌ Error deleting from Cloudinary:", error);
  }
};

module.exports = { deleteFromCloudinary };