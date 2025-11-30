const nodemailer = require('nodemailer');
require('dotenv').config();

const createTransporter = () => {
    // Cấu hình tối ưu cho Render/Cloud để tránh Timeout
    const config = {
        service: 'gmail', // Dùng service 'gmail' có sẵn của nodemailer để tự động cấu hình
        // host: 'smtp.gmail.com', // Không cần dòng này nếu đã dùng service: 'gmail'
        // port: 587,               // Không cần dòng này
        // secure: false,           // Không cần dòng này
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS // App Password 16 ký tự
        },
        tls: {
            // Cho phép các chứng chỉ bảo mật không trọn vẹn (giúp vượt qua tường lửa Cloud)
            rejectUnauthorized: false
        }
    };
    
    return nodemailer.createTransport(config);
};

const transporter = createTransporter();

const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"CheckMyHealth App" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: html
        });
        console.log(`✅ Email sent to ${to}`);
        return info;
    } catch (error) {
        console.error('❌ Error sending email:', error);
        throw new Error('Không thể gửi email lúc này.');
    }
};

module.exports = { sendEmail };