// Code Firebase init của bạn ở đây...
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
    // Chạy mỗi phút
    cron.schedule('* * * * *', async () => {
        const now = new Date();
        const vnTimeStr = now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
        const vnNow = new Date(vnTimeStr); 

        const currentDay = getDbDay(vnNow.getDay());
        
        // Format ngày giờ
        const year = vnNow.getFullYear();
        const month = String(vnNow.getMonth() + 1).padStart(2, '0');
        const day = String(vnNow.getDate()).padStart(2, '0');
        const currentDateStr = `${year}-${month}-${day}`;
        
        const hours = String(vnNow.getHours()).padStart(2, '0');
        const minutes = String(vnNow.getMinutes()).padStart(2, '0');
        const currentTimeStr = `${hours}:${minutes}`;

        try {
            // BƯỚC 1: LỌC DANH SÁCH ỨNG VIÊN
            // Chỉ lấy những lịch CHƯA chạy trong phút này (last_triggered_at cũ hơn 55s hoặc NULL)
            const [candidates] = await pool.query(`
                SELECT 
                    MAX(s.schedule_id) as schedule_id, -- Lấy 1 ID đại diện cho nhóm
                    s.user_id, 
                    s.title, 
                    s.type, 
                    u.fcm_token
                FROM schedules s
                JOIN users u ON s.user_id = u.user_id
                WHERE s.is_active = TRUE 
                AND DATE_FORMAT(s.reminder_time, '%H:%i') = ?
                AND (
                    (s.specific_date IS NOT NULL AND s.specific_date = ?)
                    OR 
                    (s.specific_date IS NULL AND FIND_IN_SET(?, s.repeat_days) > 0)
                )
                -- Điều kiện chặn: Chỉ lấy nếu chưa chạy gần đây
                AND (s.last_triggered_at IS NULL OR s.last_triggered_at < (NOW() - INTERVAL 55 SECOND))
                GROUP BY s.user_id, s.title, s.type, u.fcm_token
            `, [currentTimeStr, currentDateStr, currentDay]);
if (candidates.length === 0) return;

            console.log(`[Cron ${currentTimeStr}] Found ${candidates.length} candidates.`);

            // BƯỚC 2: TRANH QUYỀN GỬI (LOCKING)
            for (const item of candidates) {
                // Thử cập nhật thời gian chạy. 
                // Nếu 2 server cùng chạy lệnh này, chỉ CÓ 1 server thành công (affectedRows > 0)
                // Server còn lại sẽ nhận affectedRows = 0 vì điều kiện WHERE không còn đúng nữa.
                const [result] = await pool.query(`
                    UPDATE schedules 
                    SET last_triggered_at = NOW() 
                    WHERE schedule_id = ? 
                    AND (last_triggered_at IS NULL OR last_triggered_at < (NOW() - INTERVAL 55 SECOND))
                `, [item.schedule_id]);

                if (result.affectedRows === 0) {
                    console.log(`🔒 Blocked duplicate for user ${item.user_id} - task: ${item.title}`);
                    continue; // Bỏ qua, server khác đã gửi rồi
                }

                // --- NẾU XUỐNG ĐƯỢC ĐÂY, SERVER NÀY LÀ DUY NHẤT ĐƯỢC QUYỀN GỬI ---
                const title = `Đến giờ: ${item.title}`;
                const message = `Đã đến giờ cho hoạt động ${item.type}.`;

                // Double check bảng notifications (phòng hờ tối đa)
                const [exists] = await pool.query(`
                    SELECT notification_id FROM notifications 
                    WHERE user_id = ? AND title = ? AND created_at > (NOW() - INTERVAL 1 MINUTE)
                `, [item.user_id, title]);

                if (exists.length === 0) {
                    // Lưu vào DB
                    await notificationModel.create(item.user_id, title, message);
                    console.log(`✅ Sent notification to User ${item.user_id}`);

                    // Gửi FCM
                    if (item.fcm_token) {
                         try {
                            await admin.messaging().send({
                                token: item.fcm_token,
                                notification: { title, body: message },
                                android: { priority: 'high' } // Bỏ channelId nếu không chắc chắn client đã tạo
                            });
                        } catch (e) { console.error('FCM Error:', e.message); }
                    }
                }
            }
        } catch (error) {
            console.error('[Cron Error]', error);
        }
    });
};

module.exports = initScheduledJobs;