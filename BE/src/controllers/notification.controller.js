const notificationModel = require('../models/notification.model');

const notificationController = {
    getMyNotifications: async (req, res) => {
        try {
            const userId = req.user.userId;
            const list = await notificationModel.getByUserId(userId);
            res.status(200).json(list);
        } catch (error) {
            res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
        }
    },
    
    markRead: async (req, res) => {
        try {
             const { id } = req.params;
             await notificationModel.markAsRead(id);
             res.status(200).json({ message: 'Đã đọc' });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
        }
    }
};

module.exports = notificationController;