const nodemailer = require('nodemailer');
require('dotenv').config();

const createTransporter = () => {
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        },
        // --- QUAN TRỌNG: CÁC DÒNG DƯỚI ĐÂY GIÚP FIX LỖI TIMEOUT ---
        // Ép buộc sử dụng IPv4 (nhiều server cloud bị lỗi timeout với IPv6)
        family: 4, 
        // Tăng thời gian chờ kết nối
        connectionTimeout: 10000, // 10 giây
        greetingTimeout: 5000,
        socketTimeout: 10000
    });
};

const transporter = createTransporter();

const sendEmail = async (to, subject, html) => {
    try {
        console.log(`⏳ Đang gửi email tới ${to}...`);
        const info = await transporter.sendMail({
            from: `"CheckMyHealth App" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: html
        });
        console.log(`✅ Email sent: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('❌ Error sending email:', error);
        // Không ném lỗi chết app, chỉ log ra để server vẫn chạy
        return null; 
    }
};

module.exports = { sendEmail };