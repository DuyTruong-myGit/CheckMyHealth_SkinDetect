const cron = require('node-cron');
const { pool } = require('../config/db');
const notificationModel = require('../models/notification.model');
const admin = require('firebase-admin');

// --- 1. KHỞI TẠO FIREBASE (Giữ nguyên logic cũ của bạn) ---
if (!admin.apps.length) {
    let serviceAccount = null;
    try {
        if (process.env.FIREBASE_CREDENTIALS) {
            console.log("🔐 Tìm thấy biến môi trường FIREBASE_CREDENTIALS. Đang parse...");
            serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
        } else {
            console.log("⚠️ Không thấy biến môi trường. Đang thử tìm file local...");
            try {
                serviceAccount = require('../firebase-admin-key.json');
            } catch (fileError) {
                console.error("❌ Không tìm thấy file firebase-admin-key.json");
            }
        }

        if (serviceAccount) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log("🔥 Firebase Admin đã khởi tạo thành công!");
        } else {
            console.error("❌ CẢNH BÁO: Không có thông tin Firebase. Tính năng thông báo sẽ KHÔNG hoạt động.");
        }
    } catch (error) {
        console.error("❌ Lỗi khởi tạo Firebase:", error.message);
    }
}

// --- 2. HÀM HELPER ---
const getDbDay = (jsDay) => {
    return jsDay === 0 ? 8 : jsDay + 1; // CN (0) -> 8, T2 (1) -> 2...
};

// --- 3. CRON JOB CHÍNH ---
const initScheduledJobs = () => {
    // Chạy mỗi phút một lần
    cron.schedule('* * * * *', async () => {
        const serverNow = new Date();
        const vnTimeStr = serverNow.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
        const vnNow = new Date(vnTimeStr); 

        // Lấy thông tin ngày giờ hiện tại
        const currentDay = getDbDay(vnNow.getDay());
        
        const year = vnNow.getFullYear();
        const month = String(vnNow.getMonth() + 1).padStart(2, '0');
        const day = String(vnNow.getDate()).padStart(2, '0');
        const currentDateStr = `${year}-${month}-${day}`; // YYYY-MM-DD

        const hours = String(vnNow.getHours()).padStart(2, '0');
        const minutes = String(vnNow.getMinutes()).padStart(2, '0');
        const currentTimeStr = `${hours}:${minutes}`; // HH:mm

        try {
            // ✅ FIX QUAN TRỌNG: Dùng GROUP BY để gom các lịch trùng lặp
            // Nếu User có 2 dòng trong DB giống hệt nhau về (user_id, title, type, giờ),
            // lệnh này chỉ trả về 1 dòng duy nhất đại diện.
            const [schedules] = await pool.query(`
                SELECT 
                    MAX(s.schedule_id) as schedule_id, -- Lấy ID đại diện
                    s.user_id, 
                    s.title, 
                    s.type, 
                    u.fcm_token
                FROM schedules s
                JOIN users u ON s.user_id = u.user_id
                WHERE s.is_active = TRUE 
                AND DATE_FORMAT(s.reminder_time, '%H:%i') = ?
                AND (
                    (s.specific_date IS NOT NULL AND s.specific_date = ?) -- Trường hợp ngày cụ thể
                    OR 
                    (s.specific_date IS NULL AND FIND_IN_SET(?, s.repeat_days) > 0) -- Trường hợp lặp lại
                )
                GROUP BY s.user_id, s.title, s.type, u.fcm_token -- Gom nhóm chống trùng
            `, [currentTimeStr, currentDateStr, currentDay]);
            
            if (schedules.length > 0) {
                console.log(`[Cron ${currentTimeStr}] Found ${schedules.length} unique group(s) to notify`);
                
                for (const schedule of schedules) {
                    const title = `Đến giờ: ${schedule.title}`;
                    const message = `Đã đến giờ cho hoạt động ${schedule.type}.`;
                    
                    // --- LỚP BẢO VỆ THỨ 2: Check trùng notification trong 10 phút ---
                    // Phòng trường hợp cron chạy chồng chéo hoặc logic group by vẫn sót
                    const [duplicates] = await pool.query(`
                        SELECT notification_id FROM notifications 
                        WHERE user_id = ? 
                        AND title = ? 
                        AND message = ?
                        AND created_at > (NOW() - INTERVAL 10 MINUTE)
                    `, [schedule.user_id, title, message]);

                    if (duplicates.length > 0) {
                        console.log(`⚠️ Bỏ qua thông báo trùng lặp (đã gửi <10p) cho User ${schedule.user_id}: ${title}`);
                        continue; 
                    }
                    
                    // 1. Lưu thông báo vào DB
                    await notificationModel.create(schedule.user_id, title, message);
                    console.log(`✅ Notification created for user ${schedule.user_id}: ${title}`);

                    // 2. Gửi FCM tới điện thoại
                    if (schedule.fcm_token) {
                        try {
                            await admin.messaging().send({
                                token: schedule.fcm_token,
                                notification: {
                                    title: title,
                                    body: message,
                                },
                                android: {
                                    priority: 'high',
                                    notification: {
                                        sound: 'default',
                                        channelId: 'medication_channel'
                                    }
                                },
                                apns: {
                                    payload: {
                                        aps: {
                                            sound: 'default',
                                            contentAvailable: true,
                                        }
                                    }
                                }
                            });
                            console.log(`✅ FCM sent to user ${schedule.user_id}`);
                        } catch (fcmError) {
                            console.error(`❌ FCM Failed for user ${schedule.user_id}:`, fcmError.message);
                            // Có thể thêm logic xóa token nếu lỗi là 'Unregistered' (token hết hạn)
                        }
                    }
                }
            }
        } catch (error) { 
            console.error('[Cron] Error:', error); 
        }
    });
};

module.exports = initScheduledJobs;