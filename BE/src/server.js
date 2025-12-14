const http = require('http');
const app = require('./app');
const { testConnection } = require('./config/db');
const initScheduledJobs = require('./cron/scheduler');
const { initializeSocket } = require('./sockets');

// Lấy PORT từ file .env, nếu không có thì mặc định là 8000
const PORT = process.env.PORT || 8000;

// Hàm khởi động server
const startServer = async () => {
    // 1. Kiểm tra kết nối database
    await testConnection();
    initScheduledJobs();

    // 2. Tạo HTTP server từ Express app
    const server = http.createServer(app);

    // 3. Khởi tạo Socket.IO
    initializeSocket(server);

    // 4. Khởi động server
    server.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
        console.log(`📡 REST API: http://localhost:${PORT}`);
        console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
    });
};

// Chạy server
startServer();
