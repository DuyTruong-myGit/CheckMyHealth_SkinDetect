const diagnosisModel = require('../models/diagnosis.model');
// const axios = require('axios'); // Sẽ dùng sau

// --- MOCK FUNCTION ---
// Giả lập việc gọi API AI (team AI sẽ cung cấp API thật)
const callAiApiMock = async (imageBuffer) => {
    // Giả lập độ trễ mạng
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    // Giả lập kết quả
    return {
        disease_name: "Bệnh Vẩy Nến (Psoriasis)",
        confidence_score: 0.92,
        description: "Đây là mô tả giả lập về bệnh vẩy nến.",
        recommendation: "Bạn nên đi khám bác sĩ da liễu."
    };
};

// --- MOCK FUNCTION ---
// Giả lập việc upload ảnh lên Cloud (Cloudinary/S3)
const uploadToCloudMock = async (imageBuffer) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return `https://fake-cloud-storage.com/images/${Date.now()}-image.jpg`;
};
// --- END MOCK ---

const diagnosisController = {
    /**
     * Xử lý upload ảnh và chẩn đoán
     */
    diagnose: async (req, res) => {
        try {
            // 1. Kiểm tra xem có file không (từ middleware 'upload')
            if (!req.file) {
                return res.status(400).json({ message: 'Vui lòng upload một file ảnh.' });
            }

            // 2. Lấy user ID từ middleware 'auth'
            const userId = req.user.userId;

            // 3. (Mock) Upload ảnh lên cloud storage
            // req.file.buffer là dữ liệu nhị phân của ảnh (từ memoryStorage)
            const imageUrl = await uploadToCloudMock(req.file.buffer);

            // 4. (Mock) Gửi ảnh (hoặc buffer) tới API AI
            const aiResult = await callAiApiMock(req.file.buffer);

            // 5. Lưu kết quả vào DB
            await diagnosisModel.create(
                userId,
                imageUrl,
                aiResult.disease_name,
                aiResult.confidence_score,
                aiResult // Lưu toàn bộ kết quả JSON
            );

            // 6. Trả kết quả về cho App Flutter
            res.status(200).json(aiResult);

        } catch (error) {
            res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
        }
    },

    /**
     * Lấy lịch sử chẩn đoán
     */
    getHistory: async (req, res) => {
        try {
            const userId = req.user.userId;
            const history = await diagnosisModel.findByUserId(userId);
            res.status(200).json(history);
        } catch (error) {
            res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
        }
    }
};

module.exports = diagnosisController;