const nodemailer = require('nodemailer');
require('dotenv').config();

// Kiểm tra xem có SENDGRID_API_KEY không
const useSendGrid = !!process.env.SENDGRID_API_KEY;

const transporter = nodemailer.createTransport(
    useSendGrid 
    ? {
        // SendGrid cho Production (Render)
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY
        }
    }
    : {
        // Gmail cho Local Development
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false 
        },
        family: 4,
        connectionTimeout: 30000, 
        greetingTimeout: 30000,   
        socketTimeout: 30000
    }
);

const sendEmail = async (to, subject, html) => {
    try {
        console.log(`[Mailer] Đang gửi mail đến: ${to} via ${useSendGrid ? 'SendGrid' : 'Gmail'}`);
        
        if (useSendGrid && !process.env.SENDGRID_API_KEY) {
            throw new Error("Chưa cấu hình SENDGRID_API_KEY");
        }
        
        if (!useSendGrid && !process.env.EMAIL_PASS) {
            throw new Error("Chưa cấu hình EMAIL_PASS");
        }

        const fromEmail = useSendGrid 
            ? process.env.SENDER_EMAIL || 'duytruongton@gmail.com'
            : process.env.EMAIL_USER;

        const info = await transporter.sendMail({
            from: `"CheckMyHealth" <${fromEmail}>`,
            to: to,
            subject: subject,
            html: html
        });
        
        console.log(`[Mailer] ✅ Email sent: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('[Mailer] ❌ Lỗi:', error.message);
        throw new Error(`Gửi mail thất bại: ${error.message}`);
    }
};

module.exports = { sendEmail };