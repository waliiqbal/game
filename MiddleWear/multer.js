import multer, { diskStorage } from "multer";
import { join, dirname } from "path";
import { existsSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure the upload directory exists
const uploadFolder = join(__dirname, "../uploads");


const storage = diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFolder); // Uploads will be stored in the 'uploads' folder
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

// File filter to allow only specific file types (optional)

const upload = multer({ storage });

export default upload; // ✅ Correctly export as default
