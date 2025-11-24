require('dotenv').config();

// Auto-detect: Dùng Resend nếu có API key, không thì dùng Gmail
const useResend = !!process.env.RESEND_API_KEY;

let resendClient;
let nodemailerTransporter;

if (useResend) {
    const { Resend } = require('resend');
    resendClient = new Resend(process.env.RESEND_API_KEY);
    console.log('[Mailer] 🚀 Sử dụng Resend');
} else {
    const nodemailer = require('nodemailer');
    nodemailerTransporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: { rejectUnauthorized: false },
        family: 4,
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 30000
    });
    console.log('[Mailer] 📧 Sử dụng Gmail (local)');
}

const sendEmail = async (to, subject, html) => {
    try {
        console.log(`[Mailer] Đang gửi mail đến: ${to}`);

        if (useResend) {
            // ===== RESEND (Production) =====
            if (!process.env.RESEND_API_KEY) {
                throw new Error("Chưa cấu hình RESEND_API_KEY");
            }

            const { data, error } = await resendClient.emails.send({
                from: 'CheckMyHealth <onboarding@resend.dev>', // Email test miễn phí, không cần verify
                to: [to],
                subject: subject,
                html: html
            });

            if (error) {
                console.error('[Mailer] Resend error:', error);
                throw error;
            }

            console.log(`[Mailer] ✅ Email sent via Resend: ${data.id}`);
            return data;

        } else {
            // ===== GMAIL (Local Development) =====
            if (!process.env.EMAIL_PASS) {
                throw new Error("Chưa cấu hình EMAIL_PASS");
            }

            const info = await nodemailerTransporter.sendMail({
                from: `"CheckMyHealth" <${process.env.EMAIL_USER}>`,
                to: to,
                subject: subject,
                html: html
            });

            console.log(`[Mailer] ✅ Email sent via Gmail: ${info.messageId}`);
            return info;
        }

    } catch (error) {
        console.error('[Mailer] ❌ Lỗi gửi mail:', error.message);
        throw new Error(`Gửi mail thất bại: ${error.message}`);
    }
};

module.exports = { sendEmail };