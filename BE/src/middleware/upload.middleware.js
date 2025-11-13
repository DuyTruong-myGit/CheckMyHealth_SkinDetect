const multer = require('multer');

// Cấu hình lưu trữ (dùng RAM)
const storage = multer.memoryStorage();

// Lọc file: chỉ chấp nhận ảnh
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file ảnh (image)!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // Giới hạn 10MB
    }
});

// Export middleware để upload 1 file duy nhất với field name là 'image'
module.exports = upload.single('image');