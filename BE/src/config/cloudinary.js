const cloudinary = require('cloudinary'); // 1. Import object base
const CloudinaryStorage = require('multer-storage-cloudinary'); // 2. Import constructor
const multer = require('multer');
require('dotenv').config();

// 3. Cấu hình .v2 của object base
cloudinary.v2.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cấu hình bộ lưu trữ cho Multer
const storage = new CloudinaryStorage({
    // === SỬA LỖI Ở ĐÂY ===
    // 4. Truyền toàn bộ object 'cloudinary', KHÔNG PHẢI 'cloudinary.v2'
    cloudinary: cloudinary, 
    // ====================
    params: {
        folder: 'skin_app_uploads', // Tên thư mục trên Cloudinary
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 1024, height: 1024, crop: 'limit' }]
    }
});

// Xuất ra middleware upload đã cấu hình
const uploadCloud = multer({ storage: storage });

module.exports = uploadCloud;