const watchModel = require('../models/watch.model');

const watchController = {
    /**
     * Lưu dữ liệu đo từ smartwatch
     * POST /api/watch/measurements
     */
    createMeasurement: async (req, res) => {
        try {
            const { type, heartRate, spO2, stress, steps, calories, duration } = req.body;
            const userId = req.user.userId;

            // Validation: type là bắt buộc
            if (!type) {
                return res.status(400).json({ message: 'Loại đo lường (type) là bắt buộc' });
            }

            const measurementId = await watchModel.create(
                userId, 
                type, 
                heartRate, 
                spO2, 
                stress, 
                steps, 
                calories, 
                duration
            );

            console.log(`✅ Đã lưu bản ghi đo lường mới [ID: ${measurementId}] - Loại: ${type} - User: ${userId}`);
            
            res.status(201).json({ 
                message: 'Lưu thành công', 
                id: measurementId 
            });
        } catch (error) {
            console.error('Error creating measurement:', error);
            res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
        }
    },

    /**
     * Lấy lịch sử đo lường từ smartwatch
     * GET /api/watch/measurements
     */
    getMeasurements: async (req, res) => {
        try {
            const userId = req.user.userId;
            const limit = parseInt(req.query.limit) || 50;
            
            const measurements = await watchModel.findByUserId(userId, limit);
            res.status(200).json(measurements);
        } catch (error) {
            console.error('Error fetching measurements:', error);
            res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
        }
    },

    /**
     * Xóa một bản ghi đo lường
     * DELETE /api/watch/measurements/:id
     */
    deleteMeasurement: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.userId;

            const success = await watchModel.deleteById(id, userId);
            
            if (success) {
                res.status(200).json({ message: 'Đã xóa bản ghi đo lường.' });
            } else {
                res.status(404).json({ message: 'Không tìm thấy bản ghi hoặc bạn không có quyền xóa.' });
            }
        } catch (error) {
            console.error('Error deleting measurement:', error);
            res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
        }
    },

    /**
     * Lấy bản ghi mới nhất
     * GET /api/watch/measurements/latest
     */
    getLatest: async (req, res) => {
        try {
            const userId = req.user.userId;
            const latest = await watchModel.getLatest(userId);
            
            if (!latest) {
                return res.status(404).json({ message: 'Chưa có dữ liệu đo lường.' });
            }
            
            res.status(200).json(latest);
        } catch (error) {
            console.error('Error fetching latest measurement:', error);
            res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
        }
    },

    /**
     * Lấy chi tiết một bản ghi
     * GET /api/watch/measurements/:id
     */
    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            
            const measurement = await watchModel.getById(id, userId);
            
            if (!measurement) {
                return res.status(404).json({ message: 'Không tìm thấy bản ghi.' });
            }
            
            res.status(200).json(measurement);
        } catch (error) {
            console.error('Error fetching measurement by id:', error);
            res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
        }
    },

    /**
     * Lấy dữ liệu theo loại
     * GET /api/watch/measurements/by-type/:type
     */
    getByType: async (req, res) => {
        try {
            const { type } = req.params;
            const userId = req.user.userId;
            const limit = parseInt(req.query.limit) || 50;
            
            const measurements = await watchModel.findByType(userId, type, limit);
            res.status(200).json(measurements);
        } catch (error) {
            console.error('Error fetching measurements by type:', error);
            res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
        }
    },

    /**
     * Lấy dữ liệu theo khoảng thời gian
     * GET /api/watch/measurements/range
     */
    getByDateRange: async (req, res) => {
        try {
            const { startDate, endDate } = req.query;
            const userId = req.user.userId;
            const limit = parseInt(req.query.limit) || 100;
            
            if (!startDate || !endDate) {
                return res.status(400).json({ 
                    message: 'Vui lòng cung cấp startDate và endDate (format: YYYY-MM-DD)' 
                });
            }
            
            const measurements = await watchModel.findByDateRange(userId, startDate, endDate, limit);
            res.status(200).json(measurements);
        } catch (error) {
            console.error('Error fetching measurements by date range:', error);
            res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
        }
    },

    /**
     * Lấy dữ liệu hôm nay
     * GET /api/watch/measurements/today
     */
    getToday: async (req, res) => {
        try {
            const userId = req.user.userId;
            const measurements = await watchModel.getToday(userId);
            res.status(200).json(measurements);
        } catch (error) {
            console.error('Error fetching today measurements:', error);
            res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
        }
    },

    /**
     * Lấy thống kê tổng hợp
     * GET /api/watch/measurements/stats
     */
    getStats: async (req, res) => {
        try {
            const userId = req.user.userId;
            const period = req.query.period || 'all'; // today, week, month, all
            
            if (!['today', 'week', 'month', 'all'].includes(period)) {
                return res.status(400).json({ 
                    message: 'Period phải là: today, week, month, hoặc all' 
                });
            }
            
            const stats = await watchModel.getStats(userId, period);
            res.status(200).json(stats);
        } catch (error) {
            console.error('Error fetching stats:', error);
            res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
        }
    }
};

module.exports = watchController;

