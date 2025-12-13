const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Nhập routes (MỚI)
const authRoutes = require('./routes/auth.routes');
const diagnosisRoutes = require('./routes/diagnosis.routes');
const profileRoutes = require('./routes/profile.routes');
const adminRoutes = require('./routes/admin.routes');
const newsRoutes = require('./routes/news.routes');
const chatRoutes = require('./routes/chat.routes.js');
const feedbackRoutes = require('./routes/feedback.routes.js')
const notificationRoutes = require('./routes/notification.routes');
const diseaseRoutes = require('./routes/disease.routes');
const scheduleRoutes = require('./routes/schedule.routes');
const watchRoutes = require('./routes/watch.routes');
const passport = require('./config/passport');
const { globalLimiter } = require('./middleware/limiter.middleware');
// Database initialization
const { initializeDatabase } = require('./config/init');

// Swagger
const { swaggerUi, swaggerSpec } = require('./config/swagger');

const app = express();
app.set('trust proxy', 1);
// --- Middlewares ---
// CORS configuration - cho phép frontend gọi API
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Vite default port
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// [NEW] Áp dụng Global Limiter cho toàn bộ ứng dụng
// Giúp chống DDoS cơ bản cho tất cả các API
app.use(globalLimiter);
app.use(passport.initialize());


// --- Routes ---
/**
 * @swagger
 * /:
 *   get:
 *     summary: Welcome endpoint
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Welcome message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Welcome to Skin Disease Diagnosis API!
 */
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Skin Disease Diagnosis API!' });
});

// Health check endpoint
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [General]
 *     security: []
 *     responses:
 *       200:
 *         description: Server đang hoạt động
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Thời gian server đã chạy (giây)
 */
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Gắn auth routes vào app (MỚI)
// Tất cả các route trong 'authRoutes' sẽ có tiền tố là '/api/auth'
// Ví dụ: /api/auth/register, /api/auth/login
app.use('/api/auth', authRoutes);
app.use('/api/diagnose', diagnosisRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/diseases', diseaseRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/watch', watchRoutes);

// Initialize database tables
initializeDatabase().catch(error => {
    console.error('Fatal: Database initialization failed:', error);
    process.exit(1);
});

// --- Global Error Handler (Phải đặt sau tất cả routes) ---
app.use((err, req, res, next) => {
    console.error('❌ Unhandled Error:', err);

    // Nếu response đã được gửi, chuyển cho Express default error handler
    if (res.headersSent) {
        return next(err);
    }

    // Trả về lỗi dạng JSON
    res.status(err.status || 500).json({
        message: err.message || 'Lỗi máy chủ nội bộ',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// --- 404 Handler (Phải đặt sau tất cả routes và error handler) ---
app.use((req, res) => {
    res.status(404).json({
        message: 'API endpoint không tồn tại',
        path: req.path,
        method: req.method
    });
});

// --- Xuất app ra ---
module.exports = app;
