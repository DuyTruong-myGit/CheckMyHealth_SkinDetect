const { pool } = require('../config/db');

const notificationModel = {
    create: async (userId, title, message) => {
        try {
            await pool.query(
                'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
                [userId, title, message]
            );
            return true;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    },

    getByUserId: async (userId) => {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
                [userId]
            );
            return rows;
        } catch (error) {
            console.error('Error getting notifications:', error);
            throw error;
        }
    },

    markAsRead: async (notificationId) => {
        try {
            await pool.query(
                'UPDATE notifications SET is_read = TRUE WHERE notification_id = ?',
                [notificationId]
            );
            return true;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }
};

module.exports = notificationModel;