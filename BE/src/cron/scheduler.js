// scheduler.js - FINAL VERSION (WITH DB LOCKING)
const cron = require('node-cron');
const { pool } = require('../config/db');
const notificationModel = require('../models/notification.model');
const admin = require('firebase-admin');

// --- Giữ nguyên phần khởi tạo Firebase ---
if (!admin.apps.length) {
    let serviceAccount = null;
    try {
        if (process.env.FIREBASE_CREDENTIALS) {
            serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
        } else {
            try { serviceAccount = require('../firebase-admin-key.json'); } catch (e) {}
        }
        if (serviceAccount) {
            admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
            console.log("🔥 Firebase Admin ready.");
        }
    } catch (error) { console.error("Firebase Error:", error.message); }
}

const getDbDay = (jsDay) => jsDay === 0 ? 8 : jsDay + 1;

const initScheduledJobs = () => {
    cron.schedule('* * * * *', async () => {
        const now = new Date();
        const vnTimeStr = now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
        const vnNow = new Date(vnTimeStr); 
        
        const currentDay = getDbDay(vnNow.getDay());
        
        const year = vnNow.getFullYear();
        const month = String(vnNow.getMonth() + 1).padStart(2, '0');
        const day = String(vnNow.getDate()).padStart(2, '0');
        const currentDateStr = `${year}-${month}-${day}`;
        
        const hours = String(vnNow.getHours()).padStart(2, '0');
        const minutes = String(vnNow.getMinutes()).padStart(2, '0');
        const currentTimeStr = `${hours}:${minutes}`;

        try {
            // 1. LẤY DANH SÁCH LỊCH (Chỉ lấy những cái CHƯA được chạy trong phút này)
            // Thêm điều kiện: last_triggered_at IS NULL hoặc cách đây hơn 1 phút
            const [schedules] = await pool.query(`
                SELECT 
                    MAX(s.schedule_id) as schedule_id,
                    s.user_id, s.title, s.type, u.fcm_token
                FROM schedules s
                JOIN users u ON s.user_id = u.user_id
                WHERE s.is_active = TRUE 
                AND DATE_FORMAT(s.reminder_time, '%H:%i') = ?
                AND (
                    (s.specific_date IS NOT NULL AND s.specific_date = ?)
                    OR 
                    (s.specific_date IS NULL AND FIND_IN_SET(?, s.repeat_days) > 0)
                )
                -- QUAN TRỌNG: Chỉ lấy nếu chưa chạy trong 60 giây qua
                AND (s.last_triggered_at IS NULL OR s.last_triggered_at < (NOW() - INTERVAL 59 SECOND))
                GROUP BY s.user_id, s.title, s.type, u.fcm_token
            `, [currentTimeStr, currentDateStr, currentDay]);
            
            if (schedules.length > 0) {
                console.log(`[Cron ${currentTimeStr}] Found ${schedules.length} candidates.`);

                for (const schedule of schedules) {
                    // 2. CƠ CHẾ KHÓA (LOCKING)
                    // Cố gắng update last_triggered_at.
                    // Chỉ có 1 server sẽ thành công (affectedRows > 0).
                    const [updateResult] = await pool.query(`
                        UPDATE schedules 
                        SET last_triggered_at = NOW() 
                        WHERE schedule_id = ? 
                        AND (last_triggered_at IS NULL OR last_triggered_at < (NOW() - INTERVAL 59 SECOND))
                    `, [schedule.schedule_id]);

                    // Nếu không update được dòng nào -> Server khác đã làm rồi -> Bỏ qua
                    if (updateResult.affectedRows === 0) {
                        console.log(`🔒 Skipped duplicate run for ID ${schedule.schedule_id}`);
                        continue;
                    }

                    // --- NẾU ĐẾN ĐÂY THÌ SERVER NÀY LÀ DUY NHẤT ĐƯỢC QUYỀN GỬI ---
                    const title = `Đến giờ: ${schedule.title}`;
                    const message = `Đã đến giờ cho hoạt động ${schedule.type}.`;

                    // Lưu notification
                    await notificationModel.create(schedule.user_id, title, message);
                    console.log(`✅ Notification sent for user ${schedule.user_id}`);

                    // Gửi FCM
                    if (schedule.fcm_token) {
                        try {
                            await admin.messaging().send({
                                token: schedule.fcm_token,
                                notification: { title, body: message },
                                android: { priority: 'high', notification: { channelId: 'medication_channel' } }
                            });
                        } catch (e) { console.error(`FCM Error: ${e.message}`); }
                    }
                }
            } else {
                // Log ít lại để đỡ rối mắt
                // console.log(`[Cron ${currentTimeStr}] No schedules.`);
            }
        } catch (error) { 
            console.error('[Cron Error]', error); 
        }
    });
};

module.exports = initScheduledJobs;