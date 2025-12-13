// BE/src/sockets/watchHandlers.js
// Sửa: Import watchModel thay vì import db trực tiếp
const watchModel = require('../models/watch.model');

function watchHandlers(io, socket) {

    /**
     * Event: watch:measurement
     */
    socket.on('watch:measurement', async (data) => {
        try {
            console.log(`📊 Received measurement from user ${socket.userId}:`, data);

            // 1. Validation cơ bản
            if (!data.type && !data.heartRate && !data.steps) {
                // Thêm type mặc định nếu thiếu để tránh lỗi logic
                data.type = data.type || 'manual';
            }

            // 2. GỌI MODEL ĐỂ LƯU DB (Thay vì tự viết SQL)
            // Việc này đảm bảo tên cột luôn đúng theo chuẩn của watch.model.js
            const measurementId = await watchModel.create(
                socket.userId,
                data.type || 'manual',
                data.heartRate,
                data.spO2,
                data.stress,
                data.steps,
                data.calories,
                data.duration
            );

            // 3. Phản hồi cho Watch (Ack)
            socket.emit('watch:measurement:ack', {
                success: true,
                id: measurementId,
                timestamp: new Date()
            });

            // 4. Gửi sang App điện thoại (Broadcast)
            // Lấy chính xác dữ liệu vừa lưu để gửi đi
            io.to(`user_${socket.userId}`).emit('watch:update', {
                id: measurementId,
                userId: socket.userId,
                type: data.type || 'manual',
                heartRate: data.heartRate,
                spO2: data.spO2,
                stress: data.stress,
                steps: data.steps,
                calories: data.calories,
                duration: data.duration,
                timestamp: new Date(), // Mobile app sẽ hiển thị cái này
                date: new Date() // Để đồng bộ format
            });

            console.log(`✅ Measurement saved & broadcasted. ID: ${measurementId}`);

        } catch (error) {
            console.error('❌ Error in watch:measurement:', error);
            socket.emit('error', {
                message: 'Failed to save measurement',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    /**
     * Event: phone:requestLatest
     */
    socket.on('phone:requestLatest', async () => {
        try {
            console.log(`📱 User ${socket.userId} requested latest measurement`);

            // GỌI MODEL (Thay vì tự viết SQL)
            const latestData = await watchModel.getLatest(socket.userId);

            // Gửi kết quả (nếu null thì client tự xử lý)
            socket.emit('phone:latestData', latestData);

            console.log(`✅ Sent latest data to user ${socket.userId}`);

        } catch (error) {
            console.error('❌ Error fetching latest measurement:', error);
            socket.emit('error', { message: 'Failed to fetch data' });
        }
    });

    socket.on('ping', () => {
        socket.emit('pong', { timestamp: Date.now() });
    });
}

module.exports = watchHandlers;