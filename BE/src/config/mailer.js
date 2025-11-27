const nodemailer = require('nodemailer');
require('dotenv').config();

// Tạo 'transporter' với cấu hình SMTP rõ ràng (tương thích với Render)
// Thử port 465 (SSL) trước, nếu không được thì fallback về 587 (TLS)
const createTransporter = () => {
    // Thử port 465 với SSL trước (thường hoạt động tốt hơn trên cloud)
    const config = {
        host: 'smtp.gmail.com',
        port: 465, // Port 465 cho SSL
        secure: true, // true cho SSL
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS // Phải là App Password từ Gmail
        },
        tls: {
            // Cho phép kết nối ngay cả khi certificate không hoàn toàn hợp lệ
            rejectUnauthorized: false
        },
        // Timeout settings cho môi trường cloud - tăng lên
        connectionTimeout: 30000, // 30 seconds
        greetingTimeout: 30000,
        socketTimeout: 30000,
        // Thêm options để xử lý timeout tốt hơn
        pool: true,
        maxConnections: 1,
        maxMessages: 3
    };
    
    return nodemailer.createTransport(config);
};

const transporter = createTransporter();

/**
 * Hàm gửi email chung
 * @param {string} to - Email người nhận
 * @param {string} subject - Chủ đề
 * @param {string} html - Nội dung HTML
 */
const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"CheckMyHealth App" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: html
        });
        console.log(`✅ Email sent to ${to} - Message ID: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('❌ Error sending email:', error);
        // Log chi tiết để debug trên Render
        if (error.response) {
            console.error('SMTP Error Response:', error.response);
        }
        if (error.code) {
            console.error('Error Code:', error.code);
        }
        throw new Error('Không thể gửi email. Vui lòng thử lại sau.');
    }
};

// Verify connection khi khởi động (chỉ log, không block)
// Disable verify trên production để tránh timeout khi khởi động
if (process.env.NODE_ENV !== 'production') {
    transporter.verify(function (error, success) {
        if (error) {
            console.error('❌ Mailer connection error:', error.message);
            console.error('⚠️  Email functionality may not work. Check EMAIL_USER and EMAIL_PASS in environment variables.');
            console.error('💡 Note: Connection will be established when sending first email.');
        } else {
            console.log('✅ Mailer server is ready to send emails');
        }
    });
} else {
    console.log('📧 Mailer configured (connection will be established on first email send)');
}

module.exports = { sendEmail };