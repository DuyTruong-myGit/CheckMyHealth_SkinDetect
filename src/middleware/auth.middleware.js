const jwt = require('jsonwebtoken');

// Middleware xác thực Token
const authMiddleware = (req, res, next) => {
    // 1. Lấy token từ header
    const authHeader = req.headers['authorization'];
    // 'Authorization: Bearer <token>'
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Không tìm thấy token. Yêu cầu truy cập bị từ chối.' });
    }

    try {
        // 2. Xác thực token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Gán thông tin user (payload) vào request
        // Giờ đây, tất cả các API phía sau có thể truy cập req.user
        req.user = decoded; 
        
        next(); // Chuyển tiếp đến controller
    } catch (error) {
        return res.status(401).json({ message: 'Token không hợp lệ.' });
    }
};

// Middleware kiểm tra quyền Admin
const adminMiddleware = (req, res, next) => {
    // Middleware này phải chạy SAU authMiddleware
    if (req.user && req.user.role === 'admin') {
        next(); // Là admin, cho qua
    } else {
        return res.status(403).json({ message: 'Quyền truy cập bị từ chối. Yêu cầu quyền Admin.' });
    }
};

module.exports = {
    authMiddleware,
    adminMiddleware
};