const { pool } = require('../config/db');

const feedbackModel = {
    /**
     * Tạo một phản hồi mới
     */
    create: async (userId, feedbackType, content) => {
        try {
            const [result] = await pool.query(
                'INSERT INTO feedback (user_id, feedback_type, content) VALUES (?, ?, ?)',
                [userId, feedbackType, content]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error creating feedback:', error);
            throw error;
        }
    },


    /**
     * (Admin) Lấy tất cả phản hồi, kèm thông tin user (nếu có)
     */
    getAll: async () => {
        try {
            // Dùng LEFT JOIN phòng trường hợp user_id là NULL (gửi ẩn danh)
            const [rows] = await pool.query(
                `SELECT f.*, u.email, u.full_name 
                 FROM feedback f
                 LEFT JOIN users u ON f.user_id = u.user_id
                 ORDER BY f.submitted_at DESC`
            );
            return rows;
        } catch (error) {
            console.error('Error getting all feedback:', error);
            throw error;
        }
    },

    /**
     * (Admin) Xóa phản hồi
     */
    delete: async (feedbackId) => {
        try {
            await pool.query('DELETE FROM feedback WHERE feedback_id = ?', [feedbackId]);
            return true;
        } catch (error) {
            console.error('Error deleting feedback:', error);
            throw error;
        }
    },

    /**
     * (Admin) Cập nhật trạng thái phản hồi
     */
    updateStatus: async (feedbackId, status) => {
        try {
            await pool.query(
                'UPDATE feedback SET status = ? WHERE feedback_id = ?',
                [status, feedbackId]
            );
            return true;
        } catch (error) {
            console.error('Error updating feedback status:', error);
            throw error;
        }
    },
    
    // Hàm phụ để lấy user_id từ feedback_id (để gửi thông báo)
    getById: async (feedbackId) => {
        const [rows] = await pool.query('SELECT * FROM feedback WHERE feedback_id = ?', [feedbackId]);
        return rows[0];
    }


};

module.exports = feedbackModel;