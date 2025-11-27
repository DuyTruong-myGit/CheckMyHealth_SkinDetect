const cron = require('node-cron');
const { pool } = require('../config/db');
const notificationModel = require('../models/notification.model');

// Hàm ánh xạ ngày: JS(0=CN, 1=T2...) -> DB(8=CN, 2=T2...)
const getDbDay = (jsDay) => {
    return jsDay === 0 ? 8 : jsDay + 1;
};

const initScheduledJobs = () => {
    // Chạy mỗi phút
    cron.schedule('* * * * *', async () => {
        const now = new Date();
        const currentDayOfWeek = getDbDay(now.getDay());
        
        // Lấy giờ phút: "08:30"
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const currentTimeStr = `${hours}:${minutes}`; 

        // Lấy ngày hiện tại format YYYY-MM-DD (để so sánh specific_date)
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const date = String(now.getDate()).padStart(2, '0');
        const currentDateStr = `${year}-${month}-${date}`;

        try {
            console.log(`[Cron] Checking tasks for Time: ${currentTimeStr}, Date: ${currentDateStr} (Day ${currentDayOfWeek})...`);

            // Query được nâng cấp: Check cả repeat_days lẫn specific_date
            const [schedules] = await pool.query(`
                SELECT s.schedule_id, s.user_id, s.title, s.type 
                FROM schedules s
                WHERE s.is_active = TRUE 
                AND DATE_FORMAT(s.reminder_time, '%H:%i') = ?
                AND (
                    FIND_IN_SET(?, s.repeat_days) > 0   -- Lịch lặp
                    OR 
                    s.specific_date = ?                 -- Lịch 1 lần
                )
            `, [currentTimeStr, currentDayOfWeek, currentDateStr]);

            if (schedules.length > 0) {
                console.log(`[Cron] Found ${schedules.length} tasks.`);
                
                for (const schedule of schedules) {
                    // Tạo nội dung thông báo tiếng Việt
                    const title = `Đến giờ: ${schedule.title}`;
                    let message = '';
                    switch (schedule.type) {
                        case 'medication': message = 'Đến giờ uống thuốc rồi bạn ơi!'; break;
                        case 'skincare': message = 'Đến giờ chăm sóc da rồi!'; break;
                        case 'checkup': message = 'Bạn có lịch tái khám hôm nay.'; break;
                        case 'exercise': message = 'Đứng dậy tập thể dục chút nào!'; break;
                        case 'appointment': message = 'Bạn có cuộc hẹn sắp diễn ra.'; break;
                        default: message = 'Đã đến giờ cho hoạt động của bạn.';
                    }
                    
                    await notificationModel.create(schedule.user_id, title, message);
                }
            }
        } catch (error) {
            console.error('[Cron] Error:', error);
        }
    });
};

module.exports = initScheduledJobs;