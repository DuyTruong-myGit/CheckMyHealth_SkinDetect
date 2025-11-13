const mysql = require('mysql2/promise'); // Dùng bản promise để hỗ trợ async/await
require('dotenv').config(); // Tải các biến từ file .env

// Tạo một connection pool thay vì 1 connection
// Pool quản lý nhiều kết nối hiệu quả
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Hàm kiểm tra kết nối (tùy chọn nhưng nên có)
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully!');
        connection.release(); // Trả connection về pool
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1); // Thoát app nếu không kết nối được DB
    }
};

// Export pool và hàm test
module.exports = {
    pool,
    testConnection
};