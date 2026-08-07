import { v2 as cloudinary } from "cloudinary";

// Reads CLOUDINARY_URL from process.env automatically.
cloudinary.config({
  secure: true,
});

export default cloudinary;