// const { Resend } = require('resend');
// require('dotenv').config();

// // Khởi tạo Resend với API Key
// const resend = new Resend(process.env.RESEND_API_KEY);

// const sendEmail = async (to, subject, html) => {
//     try {
//         console.log(`⏳ Đang gửi email tới ${to} qua Resend API...`);

//         // CẤU HÌNH QUAN TRỌNG VỀ NGƯỜI GỬI (FROM)
//         // Trường hợp 1: Nếu CHƯA có tên miền riêng (Chỉ test được gửi cho chính mình)
//         const fromEmail = 'onboarding@resend.dev';
        
//         // Trường hợp 2: Nếu ĐÃ mua tên miền và verify trên Resend (Gửi được cho mọi người)
//         // const fromEmail = 'CheckMyHealth <noreply@tên_miền_của_bạn.com>';

//         const data = await resend.emails.send({
//             from: fromEmail,
//             to: to, 
//             subject: subject,
//             html: html
//         });

//         if (data.error) {
//             console.error('❌ Resend Error:', data.error);
//             // Trả về null để không crash app
//             return null; 
//         }

//         console.log(`✅ Email sent successfully! ID: ${data.data.id}`);
//         return data;
//     } catch (error) {
//         console.error('❌ Error sending email:', error.message);
//         return null;
//     }
// };

// module.exports = { sendEmail };



// config/mailer.js
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// Cấu hình API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, html) => {
    try {
        console.log(`⏳ Đang gửi email tới ${to} qua SendGrid API...`);

        const msg = {
            to: to,
            // QUAN TRỌNG: Email này PHẢI là email bạn đã xác minh (Verified Sender) trên SendGrid
            // Nếu chưa xác minh domain, hãy dùng email cá nhân đã đăng ký SendGrid
            from: process.env.SENDGRID_FROM_EMAIL, 
            subject: subject,
            html: html,
        };

        await sgMail.send(msg);

        console.log(`✅ Email sent successfully to ${to}`);
        return { success: true };
    } catch (error) {
        console.error('❌ SendGrid Error:');
        
        if (error.response) {
            // In ra lỗi chi tiết từ SendGrid để dễ debug
            console.error(error.response.body);
        } else {
            console.error(error.message);
        }
        
        // Trả về null để controller biết là gửi lỗi (tùy logic xử lý của bạn)
        return null;
    }
};

module.exports = { sendEmail };