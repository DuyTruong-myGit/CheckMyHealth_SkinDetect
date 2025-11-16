const { pool } = require('../config/db');

const chatModel = {
    /**
     * Lấy lịch sử chat của một user
     */
    getHistory: async (userId) => {
        try {
            const [rows] = await pool.query(
                'SELECT `role`, content FROM chat_history WHERE user_id = ? ORDER BY timestamp ASC',
                [userId]
            );
            return rows; // Trả về mảng [ {role: 'user', content: '...'}, {role: 'model', content: '...'} ]
        } catch (error) {
            console.error('Error getting chat history:', error);
            throw error;
        }
    },

    /**
     * Thêm một tin nhắn vào lịch sử
     */
    createEntry: async (userId, role, content) => {
        try {
            await pool.query(
                'INSERT INTO chat_history (user_id, `role`, content) VALUES (?, ?, ?)',
                [userId, role, content]
            );
            return true;
        } catch (error) {
            console.error('Error creating chat entry:', error);
            throw error;
        }
    }
};

module.exports = chatModel;