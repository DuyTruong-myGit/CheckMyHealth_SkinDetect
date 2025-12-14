const { pool } = require('../config/db');

const watchModel = {
    /**
     * Lưu dữ liệu đo từ smartwatch vào DB
     * @param {number} userId - ID của user
     * @param {string} type - Loại đo lường (heart_rate, spO2, stress, etc.)
     * @param {number} heartRate - Nhịp tim
     * @param {number} spO2 - Nồng độ oxy trong máu
     * @param {number} stress - Mức độ căng thẳng
     * @param {number} steps - Số bước chân
     * @param {number} calories - Lượng calo đốt cháy
     * @param {string} duration - Thời lượng đo
     * @returns {Promise<number>} ID của bản ghi vừa tạo
     */
    create: async (userId, type, heartRate, spO2, stress, steps, calories, duration) => {
        try {
            const [result] = await pool.query(
                `INSERT INTO watch_measurements 
                (user_id, type, heart_rate, spo2, stress, steps, calories, duration) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [userId, type, heartRate || 0, spO2 || 0, stress || 0, steps || 0, calories || 0, duration || '00:00']
            );
            return result.insertId;
        } catch (error) {
            console.error('Error creating watch measurement:', error);
            throw error;
        }
    },

    /**
     * Lấy lịch sử đo lường của một user
     * @param {number} userId - ID của user
     * @param {number} limit - Số bản ghi tối đa, mặc định 50
     * @returns {Promise<Array>} Danh sách đo lường đã format
     */
    findByUserId: async (userId, limit = 50) => {
        try {
            const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 500) : 50;
            const [rows] = await pool.query(
                `SELECT * FROM watch_measurements 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT ?`,
                [userId, safeLimit]
            );
            
            // Format lại dữ liệu cho khớp với Interface trong App React Native
            return rows.map(row => {
                const date = new Date(row.created_at);
                // Format giờ:phút - ngày/tháng (Ví dụ: 14:30 - 26/11)
                const timeString = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')} - ${date.getDate()}/${date.getMonth() + 1}`;
                
                return {
                    id: row.id.toString(),
                    type: row.type,
                    timestamp: timeString,
                    date: row.created_at, // Giữ nguyên định dạng gốc để tính toán
                    heartRate: row.heart_rate,
                    spO2: row.spo2,
                    stress: row.stress,
                    steps: row.steps,
                    calories: row.calories,
                    duration: row.duration
                };
            });
        } catch (error) {
            console.error('Error fetching watch measurements:', error);
            throw error;
        }
    },

    /**
     * Xóa một bản ghi đo lường
     * @param {number} measurementId - ID của bản ghi
     * @param {number} userId - ID của user (để đảm bảo bảo mật)
     * @returns {Promise<boolean>} true nếu xóa thành công
     */
    deleteById: async (measurementId, userId) => {
        try {
            // Chỉ xóa nếu id khớp VÀ user_id khớp (Bảo mật)
            const [result] = await pool.query(
                'DELETE FROM watch_measurements WHERE id = ? AND user_id = ?',
                [measurementId, userId]
            );
            // result.affectedRows > 0 nghĩa là xóa thành công
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error deleting measurement:', error);
            throw error;
        }
    },

    /**
     * Đếm tổng số lượt đo lường của user
     * @param {number} userId - ID của user
     * @returns {Promise<number>} Tổng số bản ghi
     */
    getTotalByUserId: async (userId) => {
        try {
            const [rows] = await pool.query(
                'SELECT COUNT(*) as total FROM watch_measurements WHERE user_id = ?',
                [userId]
            );
            return rows[0].total;
        } catch (error) {
            console.error('Error counting measurements:', error);
            throw error;
        }
    },

    /**
     * Lấy bản ghi mới nhất của user
     * @param {number} userId - ID của user
     * @returns {Promise<Object|null>} Bản ghi mới nhất hoặc null
     */
    getLatest: async (userId) => {
        try {
            const [rows] = await pool.query(
                `SELECT * FROM watch_measurements 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT 1`,
                [userId]
            );
            if (rows.length === 0) return null;
            
            const row = rows[0];
            const date = new Date(row.created_at);
            const timeString = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')} - ${date.getDate()}/${date.getMonth() + 1}`;
            
            return {
                id: row.id.toString(),
                type: row.type,
                timestamp: timeString,
                date: row.created_at,
                heartRate: row.heart_rate,
                spO2: row.spo2,
                stress: row.stress,
                steps: row.steps,
                calories: row.calories,
                duration: row.duration
            };
        } catch (error) {
            console.error('Error fetching latest measurement:', error);
            throw error;
        }
    },

    /**
     * Lấy bản ghi theo ID
     * @param {number} measurementId - ID của bản ghi
     * @param {number} userId - ID của user (bảo mật)
     * @returns {Promise<Object|null>} Bản ghi hoặc null
     */
    getById: async (measurementId, userId) => {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM watch_measurements WHERE id = ? AND user_id = ?',
                [measurementId, userId]
            );
            if (rows.length === 0) return null;
            
            const row = rows[0];
            const date = new Date(row.created_at);
            const timeString = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')} - ${date.getDate()}/${date.getMonth() + 1}`;
            
            return {
                id: row.id.toString(),
                type: row.type,
                timestamp: timeString,
                date: row.created_at,
                heartRate: row.heart_rate,
                spO2: row.spo2,
                stress: row.stress,
                steps: row.steps,
                calories: row.calories,
                duration: row.duration
            };
        } catch (error) {
            console.error('Error fetching measurement by id:', error);
            throw error;
        }
    },

    /**
     * Lấy dữ liệu theo loại (type)
     * @param {number} userId - ID của user
     * @param {string} type - Loại đo lường
     * @param {number} limit - Số bản ghi tối đa
     * @returns {Promise<Array>} Danh sách đo lường
     */
    findByType: async (userId, type, limit = 50) => {
        try {
            const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 500) : 50;
            const [rows] = await pool.query(
                `SELECT * FROM watch_measurements 
                WHERE user_id = ? AND type = ? 
                ORDER BY created_at DESC 
                LIMIT ?`,
                [userId, type, safeLimit]
            );
            
            return rows.map(row => {
                const date = new Date(row.created_at);
                const timeString = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')} - ${date.getDate()}/${date.getMonth() + 1}`;
                
                return {
                    id: row.id.toString(),
                    type: row.type,
                    timestamp: timeString,
                    date: row.created_at,
                    heartRate: row.heart_rate,
                    spO2: row.spo2,
                    stress: row.stress,
                    steps: row.steps,
                    calories: row.calories,
                    duration: row.duration
                };
            });
        } catch (error) {
            console.error('Error fetching measurements by type:', error);
            throw error;
        }
    },

    /**
     * Lấy dữ liệu theo khoảng thời gian
     * @param {number} userId - ID của user
     * @param {string} startDate - Ngày bắt đầu (YYYY-MM-DD)
     * @param {string} endDate - Ngày kết thúc (YYYY-MM-DD)
     * @param {number} limit - Số bản ghi tối đa
     * @returns {Promise<Array>} Danh sách đo lường
     */
    findByDateRange: async (userId, startDate, endDate, limit = 100) => {
        try {
            const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 500) : 100;
            const [rows] = await pool.query(
                `SELECT * FROM watch_measurements 
                WHERE user_id = ? 
                AND DATE(created_at) >= ? 
                AND DATE(created_at) <= ? 
                ORDER BY created_at DESC 
                LIMIT ?`,
                [userId, startDate, endDate, safeLimit]
            );
            
            return rows.map(row => {
                const date = new Date(row.created_at);
                const timeString = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')} - ${date.getDate()}/${date.getMonth() + 1}`;
                
                return {
                    id: row.id.toString(),
                    type: row.type,
                    timestamp: timeString,
                    date: row.created_at,
                    heartRate: row.heart_rate,
                    spO2: row.spo2,
                    stress: row.stress,
                    steps: row.steps,
                    calories: row.calories,
                    duration: row.duration
                };
            });
        } catch (error) {
            console.error('Error fetching measurements by date range:', error);
            throw error;
        }
    },

    /**
     * Lấy dữ liệu hôm nay
     * @param {number} userId - ID của user
     * @returns {Promise<Array>} Danh sách đo lường hôm nay
     */
    getToday: async (userId) => {
        try {
            const [rows] = await pool.query(
                `SELECT * FROM watch_measurements 
                WHERE user_id = ? 
                AND DATE(created_at) = CURDATE() 
                ORDER BY created_at DESC`,
                [userId]
            );
            
            return rows.map(row => {
                const date = new Date(row.created_at);
                const timeString = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')} - ${date.getDate()}/${date.getMonth() + 1}`;
                
                return {
                    id: row.id.toString(),
                    type: row.type,
                    timestamp: timeString,
                    date: row.created_at,
                    heartRate: row.heart_rate,
                    spO2: row.spo2,
                    stress: row.stress,
                    steps: row.steps,
                    calories: row.calories,
                    duration: row.duration
                };
            });
        } catch (error) {
            console.error('Error fetching today measurements:', error);
            throw error;
        }
    },

    /**
     * Lấy thống kê tổng hợp
     * @param {number} userId - ID của user
     * @param {string} period - Kỳ thống kê: 'today', 'week', 'month', 'all'
     * @returns {Promise<Object>} Thống kê tổng hợp
     */
    getStats: async (userId, period = 'all') => {
        try {
            let dateCondition = '';
            const params = [userId];
            
            switch (period) {
                case 'today':
                    dateCondition = 'AND DATE(created_at) = CURDATE()';
                    break;
                case 'week':
                    dateCondition = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
                    break;
                case 'month':
                    dateCondition = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
                    break;
                default:
                    dateCondition = '';
            }
            
            // Tổng hợp thống kê
            const [stats] = await pool.query(
                `SELECT 
                    COUNT(*) as total_records,
                    COUNT(DISTINCT type) as unique_types,
                    AVG(heart_rate) as avg_heart_rate,
                    MAX(heart_rate) as max_heart_rate,
                    MIN(heart_rate) as min_heart_rate,
                    AVG(spo2) as avg_spo2,
                    MAX(spo2) as max_spo2,
                    MIN(spo2) as min_spo2,
                    AVG(stress) as avg_stress,
                    MAX(stress) as max_stress,
                    MIN(stress) as min_stress,
                    SUM(steps) as total_steps,
                    SUM(calories) as total_calories,
                    MAX(created_at) as last_measurement
                FROM watch_measurements 
                WHERE user_id = ? ${dateCondition}`,
                params
            );
            
            // Thống kê theo type
            const [typeStats] = await pool.query(
                `SELECT 
                    type,
                    COUNT(*) as count,
                    AVG(heart_rate) as avg_heart_rate,
                    AVG(spo2) as avg_spo2,
                    AVG(stress) as avg_stress
                FROM watch_measurements 
                WHERE user_id = ? ${dateCondition}
                GROUP BY type
                ORDER BY count DESC`,
                params
            );
            
            return {
                period,
                summary: {
                    totalRecords: stats[0].total_records || 0,
                    uniqueTypes: stats[0].unique_types || 0,
                    heartRate: {
                        average: Math.round(stats[0].avg_heart_rate || 0),
                        max: stats[0].max_heart_rate || 0,
                        min: stats[0].min_heart_rate || 0
                    },
                    spO2: {
                        average: Math.round(stats[0].avg_spo2 || 0),
                        max: stats[0].max_spo2 || 0,
                        min: stats[0].min_spo2 || 0
                    },
                    stress: {
                        average: Math.round(stats[0].avg_stress || 0),
                        max: stats[0].max_stress || 0,
                        min: stats[0].min_stress || 0
                    },
                    activity: {
                        totalSteps: stats[0].total_steps || 0,
                        totalCalories: stats[0].total_calories || 0
                    },
                    lastMeasurement: stats[0].last_measurement || null
                },
                byType: typeStats.map(row => ({
                    type: row.type,
                    count: row.count,
                    avgHeartRate: Math.round(row.avg_heart_rate || 0),
                    avgSpO2: Math.round(row.avg_spo2 || 0),
                    avgStress: Math.round(row.avg_stress || 0)
                }))
            };
        } catch (error) {
            console.error('Error fetching stats:', error);
            throw error;
        }
    }
};

module.exports = watchModel;

