// // BE/src/sockets/watchHandlers.js
// // Sửa: Import watchModel thay vì import db trực tiếp
// const watchModel = require('../models/watch.model');

// function watchHandlers(io, socket) {

//     /**
//      * Event: watch:measurement
//      */
//     socket.on('watch:measurement', async (data) => {
//         try {
//             console.log(`📊 Received measurement from user ${socket.userId}:`, data);

//             // 1. Validation cơ bản
//             if (!data.type && !data.heartRate && !data.steps) {
//                 // Thêm type mặc định nếu thiếu để tránh lỗi logic
//                 data.type = data.type || 'manual';
//             }

//             // 2. GỌI MODEL ĐỂ LƯU DB (Thay vì tự viết SQL)
//             // Việc này đảm bảo tên cột luôn đúng theo chuẩn của watch.model.js
//             const measurementId = await watchModel.create(
//                 socket.userId,
//                 data.type || 'manual',
//                 data.heartRate,
//                 data.spO2,
//                 data.stress,
//                 data.steps,
//                 data.calories,
//                 data.duration
//             );

//             // 3. Phản hồi cho Watch (Ack)
//             socket.emit('watch:measurement:ack', {
//                 success: true,
//                 id: measurementId,
//                 timestamp: new Date()
//             });

//             // 4. Gửi sang App điện thoại (Broadcast)
//             // Lấy chính xác dữ liệu vừa lưu để gửi đi
//             io.to(`user_${socket.userId}`).emit('watch:update', {
//                 id: measurementId,
//                 userId: socket.userId,
//                 type: data.type || 'manual',
//                 heartRate: data.heartRate,
//                 spO2: data.spO2,
//                 stress: data.stress,
//                 steps: data.steps,
//                 calories: data.calories,
//                 duration: data.duration,
//                 timestamp: new Date(), // Mobile app sẽ hiển thị cái này
//                 date: new Date() // Để đồng bộ format
//             });

//             console.log(`✅ Measurement saved & broadcasted. ID: ${measurementId}`);

//         } catch (error) {
//             console.error('❌ Error in watch:measurement:', error);
//             socket.emit('error', {
//                 message: 'Failed to save measurement',
//                 error: process.env.NODE_ENV === 'development' ? error.message : undefined
//             });
//         }
//     });

//     /**
//      * Event: phone:requestLatest
//      */
//     socket.on('phone:requestLatest', async () => {
//         try {
//             console.log(`📱 User ${socket.userId} requested latest measurement`);

//             // GỌI MODEL (Thay vì tự viết SQL)
//             const latestData = await watchModel.getLatest(socket.userId);

//             // Gửi kết quả (nếu null thì client tự xử lý)
//             socket.emit('phone:latestData', latestData);

//             console.log(`✅ Sent latest data to user ${socket.userId}`);

//         } catch (error) {
//             console.error('❌ Error fetching latest measurement:', error);
//             socket.emit('error', { message: 'Failed to fetch data' });
//         }
//     });

//     socket.on('ping', () => {
//         socket.emit('pong', { timestamp: Date.now() });
//     });
// }

// module.exports = watchHandlers;


const db = require('../config/db');

/**
 * Watch App Socket Event Handlers
 * Handles real-time communication between Watch App, Backend, and Mobile App
 */
function watchHandlers(io, socket) {

    /**
     * Event: watch:measurement
     * Watch App sends measurement data (heart rate, SpO2, stress, etc.)
     * Backend saves to database and broadcasts to all user's devices (Mobile)
     */
    socket.on('watch:measurement', async (data) => {
        try {
            console.log(`📊 Received measurement from user ${socket.userId}:`, data);

            // Validate that at least one measurement field is provided
            if (!data.heartRate && !data.spO2 && !data.stress && !data.steps) {
                socket.emit('error', { message: 'Invalid measurement data: At least one field required' });
                return;
            }

            // Save to watch_measurements table
            const [result] = await db.query(
                `INSERT INTO watch_measurements 
                (user_id, type, heart_rate, spo2, stress, steps, calories, duration) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    socket.userId,
                    data.type || 'manual',
                    data.heartRate || null,
                    data.spO2 || null,
                    data.stress || null,
                    data.steps || null,
                    data.calories || null,
                    data.duration || null
                ]
            );

            const measurementId = result.insertId;

            // Send acknowledgment back to Watch App
            socket.emit('watch:measurement:ack', {
                success: true,
                id: measurementId,
                timestamp: new Date()
            });

            // Broadcast to all devices of this user (including Mobile app)
            // This allows real-time updates on the phone when watch sends data
            io.to(`user_${socket.userId}`).emit('watch:update', {
                id: measurementId,
                userId: socket.userId,
                heartRate: data.heartRate,
                spO2: data.spO2,
                stress: data.stress,
                steps: data.steps,
                calories: data.calories,
                duration: data.duration,
                type: data.type || 'manual',
                timestamp: new Date()
            });

            console.log(`✅ Measurement saved with ID: ${measurementId}`);

        } catch (error) {
            console.error('❌ Error saving measurement:', error);
            socket.emit('error', {
                message: 'Failed to save measurement',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    /**
     * Event: watch:live:health
     * Real-time health data (every second during measurement)
     * Forward to Mobile App WITHOUT saving to DB
     */
    socket.on('watch:live:health', (data) => {
        console.log(`💓 Live health from user ${socket.userId}:`, data);
        
        // Forward to all user's devices (real-time, không lưu DB)
        io.to(`user_${socket.userId}`).emit('watch:update', {
            userId: socket.userId,
            heartRate: data.heartRate,
            spO2: data.spO2,
            stress: data.stress,
            type: 'live:health',
            timestamp: new Date()
        });
    });

    /**
     * Event: watch:live:workout
     * Real-time workout data (every second during exercise)
     * Forward to Mobile App WITHOUT saving to DB
     */
    socket.on('watch:live:workout', (data) => {
        console.log(`🏃 Live workout from user ${socket.userId}:`, data);
        
        // Forward to all user's devices (real-time, không lưu DB)
        io.to(`user_${socket.userId}`).emit('watch:update', {
            userId: socket.userId,
            steps: data.steps,
            calories: data.calories,
            duration: data.duration,
            type: 'live:workout',
            timestamp: new Date()
        });
    });

    /**
     * Event: phone:requestLatest
     * Mobile App requests the latest measurement data
     * Backend fetches from database and sends back
     */
    socket.on('phone:requestLatest', async () => {
        try {
            console.log(`📱 User ${socket.userId} requested latest measurement`);

            const [rows] = await db.query(
                `SELECT 
                    id,
                    user_id,
                    type,
                    heart_rate,
                    spo2,
                    stress,
                    steps,
                    calories,
                    duration,
                    created_at
                FROM watch_measurements 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT 1`,
                [socket.userId]
            );

            // Send latest data to requesting client
            socket.emit('phone:latestData', rows[0] || null);

            console.log(`✅ Sent latest data to user ${socket.userId}`);

        } catch (error) {
            console.error('❌ Error fetching latest measurement:', error);
            socket.emit('error', {
                message: 'Failed to fetch latest data',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    /**
     * Event: ping
     * Heartbeat to keep connection alive
     */
    socket.on('ping', () => {
        socket.emit('pong', { timestamp: Date.now() });
    });
}

module.exports = watchHandlers;
