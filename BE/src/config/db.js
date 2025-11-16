const mysql = require('mysql2/promise');
require('dotenv').config(); 
const { URL } = require('url'); // Dùng trình phân tích URL của Node.js

const connectionString = process.env.DATABASE_URL;

// 1. Phân tích chuỗi DATABASE_URL
const dbUrl = new URL(connectionString);

// 2. Lấy các tùy chọn pool từ chuỗi (nếu có)
const waitForConnections = dbUrl.searchParams.get('waitForConnections') === 'true';
const connectionLimit = parseInt(dbUrl.searchParams.get('connectionLimit'), 10) || 10;
const queueLimit = parseInt(dbUrl.searchParams.get('queueLimit'), 10) || 0;

// 3. Tạo Pool bằng một Object (Đối tượng)
const pool = mysql.createPool({
    // Lấy thông tin từ chuỗi đã phân tích
    host: dbUrl.hostname,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.substring(1), // Bỏ dấu '/' ở đầu
    port: dbUrl.port,
    
    // Lấy tùy chọn pool đã phân tích
    waitForConnections: waitForConnections,
    connectionLimit: connectionLimit,
    queueLimit: queueLimit,

    // 4. (ĐÂY LÀ PHẦN SỬA LỖI)
    // Thêm cấu hình SSL mà TiDB Cloud yêu cầu
    ssl: {
        rejectUnauthorized: true
        // TiDB dùng CA (Certificate Authority) công cộng,
        // nên chúng ta chỉ cần bật SSL là nó tự động tin cậy.
    }
});

// Hàm kiểm tra kết nối (giữ nguyên)
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully!');
        connection.release(); 
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
};

module.exports = {
    pool,
    testConnection
};