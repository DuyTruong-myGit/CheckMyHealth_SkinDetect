const scheduleModel = require('../models/schedule.model');

const scheduleController = {
    // Tạo mới
    createSchedule: async (req, res) => {
        try {
            // Cập nhật: Lấy thêm specific_date từ body
            const { title, type, reminder_time, repeat_days, specific_date } = req.body;
            
            if (!title || !reminder_time) {
                return res.status(400).json({ message: 'Thiếu thông tin tiêu đề hoặc giờ nhắc' });
            }

            // Gọi model với đầy đủ dữ liệu
            const resultId = await scheduleModel.create(req.user.userId, { 
                title, 
                type, 
                reminder_time, 
                repeat_days, 
                specific_date 
            });

            res.status(201).json({ message: 'Đã tạo lịch trình', id: resultId });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    // Lấy danh sách nhiệm vụ cho ngày cụ thể
    getDailyTasks: async (req, res) => {
        try {
            // Client gửi: ?date=2023-11-20&dayOfWeek=2
            const { date, dayOfWeek } = req.query; 
            if(!date || !dayOfWeek) return res.status(400).json({message: 'Thiếu thông tin ngày'});

            const tasks = await scheduleModel.getTasksByDate(req.user.userId, date, dayOfWeek);
            res.status(200).json(tasks);
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    // Check / Uncheck (Giữ nguyên)
    toggleTask: async (req, res) => {
        try {
            const { scheduleId } = req.params;
            const { date, status } = req.body; 
            
            await scheduleModel.toggleStatus(req.user.userId, scheduleId, date, status);
            res.status(200).json({ message: 'Đã cập nhật trạng thái' });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },
    
    // Xóa (Giữ nguyên)
    deleteSchedule: async (req, res) => {
         try {
            const { id } = req.params;
            await scheduleModel.delete(id, req.user.userId);
            res.status(200).json({ message: 'Đã xóa' });
         } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
         }
    },
    
    // Thống kê (Giữ nguyên)
    getStats: async (req, res) => {
        try {
            const stats = await scheduleModel.getStats(req.user.userId);
            res.status(200).json(stats);
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    }
};

module.exports = scheduleController;