const mysql = require('mysql2/promise');
require('dotenv').config(); 

// Dùng 1 chuỗi kết nối duy nhất thay vì 4 biến
// Render sẽ cung cấp biến 'DATABASE_URL' này
const connectionString = process.env.DATABASE_URL;

const pool = mysql.createPool({
    connectionString: connectionString, // <-- THAY ĐỔI CHÍNH Ở ĐÂY
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
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