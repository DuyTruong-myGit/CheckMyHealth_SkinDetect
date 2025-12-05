// scheduler.js - FULL VERSION ĐÃ SỬA
const cron = require('node-cron');
const { pool } = require('../config/db');
const notificationModel = require('../models/notification.model');
const admin = require('firebase-admin');

// Firebase init code giữ nguyên...
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

const getDbDay = (jsDay) => {
    return jsDay === 0 ? 8 : jsDay + 1;
};

const initScheduledJobs = () => {
    cron.schedule('* * * * *', async () => {
        const serverNow = new Date();
        const vnTimeStr = serverNow.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
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
            // ✅ FIX: Thêm DISTINCT và sửa logic OR
            const [schedules] = await pool.query(`
                SELECT DISTINCT s.schedule_id, s.user_id, s.title, s.type, u.fcm_token
                FROM schedules s
                JOIN users u ON s.user_id = u.user_id
                WHERE s.is_active = TRUE 
                AND DATE_FORMAT(s.reminder_time, '%H:%i') = ?
                AND (
                    (s.specific_date IS NOT NULL AND s.specific_date = ?)
                    OR 
                    (s.specific_date IS NULL AND FIND_IN_SET(?, s.repeat_days) > 0)
                )
            `, [currentTimeStr, currentDateStr, currentDay]);
            
            console.log(`[Cron ${currentTimeStr}] Found ${schedules.length} schedule(s) to notify`);
            
            if (schedules.length > 0) {
                for (const schedule of schedules) {
                    const title = `Đến giờ: ${schedule.title}`;
                    const message = `Đã đến giờ cho hoạt động ${schedule.type}.`;
                    
                    // Kiểm tra duplicate notification trong 10 phút
                    const [duplicates] = await pool.query(`
                        SELECT notification_id FROM notifications 
                        WHERE user_id = ? 
                        AND title = ? 
                        AND message = ?
                        AND created_at > (NOW() - INTERVAL 10 MINUTE)
                    `, [schedule.user_id, title, message]);

                    if (duplicates.length > 0) {
                        console.log(`⚠️ Bỏ qua thông báo trùng lặp cho User ${schedule.user_id}: ${title}`);
                        continue; 
                    }
                    
                    // Lưu vào DB
                    await notificationModel.create(schedule.user_id, title, message);
                    console.log(`✅ Notification created for user ${schedule.user_id}: ${title}`);

                    // Gửi FCM
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