const { Resend } = require('resend');
require('dotenv').config();

// Khởi tạo Resend với API Key
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, html) => {
    try {
        console.log(`⏳ Đang gửi email tới ${to} qua Resend API...`);

        // CẤU HÌNH QUAN TRỌNG VỀ NGƯỜI GỬI (FROM)
        // Trường hợp 1: Nếu CHƯA có tên miền riêng (Chỉ test được gửi cho chính mình)
        const fromEmail = 'onboarding@resend.dev';
        
        // Trường hợp 2: Nếu ĐÃ mua tên miền và verify trên Resend (Gửi được cho mọi người)
        // const fromEmail = 'CheckMyHealth <noreply@tên_miền_của_bạn.com>';

        const data = await resend.emails.send({
            from: fromEmail,
            to: to, 
            subject: subject,
            html: html
        });

        if (data.error) {
            console.error('❌ Resend Error:', data.error);
            // Trả về null để không crash app
            return null; 
        }

        console.log(`✅ Email sent successfully! ID: ${data.data.id}`);
        return data;
    } catch (error) {
        console.error('❌ Error sending email:', error.message);
        return null;
    }
};

module.exports = { sendEmail };