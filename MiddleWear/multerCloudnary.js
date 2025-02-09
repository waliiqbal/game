import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudnary.js";
import path from "path"; // Import path module to handle file extensions

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let format;
    const mimeType = file.mimetype.split("/")[0]; // Get the type (image, video, audio)

    // Allow images, videos, and audio files
    if (mimeType === "image") {
      format = file.mimetype.split("/")[1]; // Keep original format (png, jpg, gif, etc.)
    } else if (mimeType === "video") {
      format = "mp4"; // Convert all videos to MP4
    } else if (mimeType === "audio") {
      format = "mp3"; // Convert all audio files to MP3
    } else {
      throw new Error("Unsupported file type"); // Reject unsupported files
    }

    return {
      folder: "uploads", // Cloudinary folder
      format: format, // Set format dynamically
      resource_type: mimeType, // Set correct resource type (image, video, audio)
      public_id: Date.now() + "-" + path.parse(file.originalname).name, // Remove extension
    };
  },
});

const uploadCloudinary = multer({ storage });

export default uploadCloudinary;
