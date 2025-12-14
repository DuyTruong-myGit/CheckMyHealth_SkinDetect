const userModel = require('../models/user.model');

exports.updateFcmToken = async (req, res) => {
    try {
        const { fcmToken } = req.body;
        if (!fcmToken) return res.status(400).json({ message: 'Thiếu token' });
        
        await userModel.updateFcmToken(req.user.userId, fcmToken);
        res.status(200).json({ message: 'Đã cập nhật token' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};