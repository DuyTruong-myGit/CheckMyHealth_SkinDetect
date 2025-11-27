const { pool } = require('../config/db');

const scheduleModel = {
    // Tạo lịch mới (Cập nhật SQL để insert specific_date)
    create: async (userId, data) => {
        try {
            // Xử lý giá trị null cho repeat_days và specific_date
            const repeatDays = data.repeat_days ? data.repeat_days : null;
            const specificDate = data.specific_date ? data.specific_date : null;

            const [result] = await pool.query(
                `INSERT INTO schedules (user_id, title, type, reminder_time, repeat_days, specific_date) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [userId, data.title, data.type, data.reminder_time, repeatDays, specificDate]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error create schedule:', error);
            throw error;
        }
    },

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
     * LẤY LỊCH TRÌNH CỦA MỘT NGÀY CỤ THỂ
     * Logic Mới: Lấy nếu (Lặp lại chứa thứ này) HOẶC (Ngày cụ thể trùng ngày này)
     */
    getTasksByDate: async (userId, dateStr, dayOfWeek) => {
        try {
            const sql = `
                SELECT s.*, l.status as log_status, l.completed_at
                FROM schedules s
                LEFT JOIN schedule_logs l 
                    ON s.schedule_id = l.schedule_id 
                    AND l.check_date = ?
                WHERE s.user_id = ? 
                  AND s.is_active = TRUE
                  AND (
                      (s.repeat_days LIKE ?)          -- Trường hợp 1: Lịch lặp (check thứ)
                      OR 
                      (s.specific_date = ?)           -- Trường hợp 2: Lịch 1 lần (check ngày)
                  )
                ORDER BY s.reminder_time ASC
            `;
            
            // Pattern tìm kiếm chuỗi (ví dụ tìm '2' trong '2,3,4')
            const dayPattern = `%${dayOfWeek}%`; 
            
            const [rows] = await pool.query(sql, [dateStr, userId, dayPattern, dateStr]);
            return rows;
        } catch (error) {
            console.error('Error get tasks:', error);
            throw error;
        }
    },

    // Các hàm toggleStatus, delete, getStats GIỮ NGUYÊN (Không đổi)
    toggleStatus: async (userId, scheduleId, dateStr, status) => {
        try {
            const [existing] = await pool.query(
                'SELECT log_id FROM schedule_logs WHERE schedule_id = ? AND check_date = ?',
                [scheduleId, dateStr]
            );

            if (existing.length > 0) {
                await pool.query(
                    'UPDATE schedule_logs SET status = ?, completed_at = NOW() WHERE log_id = ?',
                    [status, existing[0].log_id]
                );
            } else {
                await pool.query(
                    'INSERT INTO schedule_logs (schedule_id, user_id, check_date, status) VALUES (?, ?, ?, ?)',
                    [scheduleId, userId, dateStr, status]
                );
            }
            return true;
        } catch (error) { throw error; }
    },

    delete: async (id, userId) => {
        try {
            await pool.query('DELETE FROM schedules WHERE schedule_id = ? AND user_id = ?', [id, userId]);
            return true;
        } catch (error) { throw error; }
    },
    
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