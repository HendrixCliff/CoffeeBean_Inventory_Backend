// cloudinaryUpload.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
require('dotenv').config(); // Ensure environment variables are loaded

// 🔧 Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🧠 Configure storage to use Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const timestamp = Date.now();
    const publicId = `item-${timestamp}`;

    return {
      folder: 'uploads', // Folder name in Cloudinary
      public_id: publicId,
      resource_type: 'auto', // allow images, pdfs, videos, etc.
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
      transformation: [
        { width: 500, height: 500, crop: 'limit' } // Optional: Resize/crop
      ],
    };
  },
});

// ✅ File filter: Only image files are allowed
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// 📦 Create Multer instance
const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB file size limit
  }
});

module.exports = upload;
