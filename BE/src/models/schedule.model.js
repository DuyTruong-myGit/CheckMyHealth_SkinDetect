const { pool } = require('../config/db');

const scheduleModel = {
    // Tạo lịch mới
    create: async (userId, data) => {
        try {
            const [result] = await pool.query(
                `INSERT INTO schedules (user_id, title, type, reminder_time, repeat_days) 
                 VALUES (?, ?, ?, ?, ?)`,
                [userId, data.title, data.type, data.reminder_time, data.repeat_days]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error create schedule:', error);
            throw error;
        }
    },

    // Lấy tất cả lịch trình của User (để quản lý)
    getAllByUser: async (userId) => {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM schedules WHERE user_id = ? ORDER BY reminder_time ASC',
                [userId]
            );
            return rows;
        } catch (error) { throw error; }
    },

    /**
     * LẤY LỊCH TRÌNH CỦA MỘT NGÀY CỤ THỂ (Quan trọng nhất)
     * Logic: Lấy tất cả lịch active + LEFT JOIN với bảng logs của ngày đó
     * Để biết task nào đã xong, task nào chưa.
     */
    getTasksByDate: async (userId, dateStr, dayOfWeek) => {
        // dateStr: '2023-11-20'
        // dayOfWeek: '2' (Thứ 2), '3' (Thứ 3)... '8' (CN)
        try {
            const sql = `
                SELECT s.*, l.status as log_status, l.completed_at
                FROM schedules s
                LEFT JOIN schedule_logs l 
                    ON s.schedule_id = l.schedule_id 
                    AND l.check_date = ?
                WHERE s.user_id = ? 
                  AND s.is_active = TRUE
                  AND s.repeat_days LIKE ? -- Kiểm tra xem hôm nay có phải ngày lặp lại không
                ORDER BY s.reminder_time ASC
            `;
            // Tìm chuỗi repeat_days chứa dayOfWeek (Ví dụ: "2,4,6" chứa "2")
            const dayPattern = `%${dayOfWeek}%`; 
            
            const [rows] = await pool.query(sql, [dateStr, userId, dayPattern]);
            return rows;
        } catch (error) {
            console.error('Error get tasks:', error);
            throw error;
        }
    },

    // Đánh dấu hoàn thành (Check-in)
    toggleStatus: async (userId, scheduleId, dateStr, status) => {
        try {
            // Kiểm tra xem đã có log chưa
            const [existing] = await pool.query(
                'SELECT log_id FROM schedule_logs WHERE schedule_id = ? AND check_date = ?',
                [scheduleId, dateStr]
            );

            if (existing.length > 0) {
                // Nếu có rồi -> Cập nhật (hoặc xóa nếu bỏ check - tùy logic, ở đây ta update)
                await pool.query(
                    'UPDATE schedule_logs SET status = ?, completed_at = NOW() WHERE log_id = ?',
                    [status, existing[0].log_id]
                );
            } else {
                // Chưa có -> Tạo mới
                await pool.query(
                    'INSERT INTO schedule_logs (schedule_id, user_id, check_date, status) VALUES (?, ?, ?, ?)',
                    [scheduleId, userId, dateStr, status]
                );
            }
            return true;
        } catch (error) { throw error; }
    },

    // Xóa lịch
    delete: async (id, userId) => {
        try {
            await pool.query('DELETE FROM schedules WHERE schedule_id = ? AND user_id = ?', [id, userId]);
            return true;
        } catch (error) { throw error; }
    },
    
    // Lấy thống kê % hoàn thành (cho biểu đồ)
    getStats: async (userId) => {
         try {
             const [rows] = await pool.query(`
                SELECT 
                    COUNT(*) as total_logs,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count
                FROM schedule_logs
                WHERE user_id = ?
             `, [userId]);
             return rows[0];
         } catch (error) { throw error; }
    }
};

module.exports = scheduleModel;