const diagnosisModel = require('../models/diagnosis.model');
const axios = require('axios');
const FormData = require('form-data');

// --- HÀM GỌI API AI THỰC TẾ ---
const callAiApiReal = async (imageUrl) => {
    try {
        console.log(`[AI] Đang xử lý ảnh: ${imageUrl}`);

        // 1. Tải ảnh từ Cloudinary về bộ nhớ đệm (Stream)
        // Vì API AI cần nhận file, nên ta phải lấy file về trước
        const imageResponse = await axios.get(imageUrl, { responseType: 'stream' });

        // 2. Chuẩn bị Form Data để gửi sang API AI
        const form = new FormData();
        // 'file' là key mà API YOLO thường dùng, nếu API của bạn dùng key khác (vd: 'image') thì sửa ở đây
        form.append('file', imageResponse.data, 'skin_image.jpg'); 

        // 3. Gửi ảnh sang AI Server
        const aiResponse = await axios.post(
            'https://skin-lesion-api.fly.dev/predict', 
            form, 
            {
                headers: {
                    ...form.getHeaders(), // Quan trọng: Gắn header multipart
                    // Nếu API cần key, thêm: 'x-api-key': '...'
                }
            }
        );

        const aiResult = aiResponse.data;
        console.log('[AI] Kết quả trả về:', aiResult);

        // 4. Xử lý kết quả trả về
        // Giả sử API trả về dạng: { "class": "Melanoma", "confidence": 0.85, ... }
        // Hoặc dạng mảng: [{ "name": "Melanoma", "confidence": 0.85 }]
        
        // Logic này để an toàn với nhiều định dạng trả về phổ biến của YOLO
        let diseaseName = "Không xác định";
        let confidence = 0.0;
        let description = "AI đã phân tích ảnh nhưng chưa rõ kết luận.";
        let recommendation = "Vui lòng tham khảo ý kiến bác sĩ.";

        // TÙY CHỈNH THEO FORMAT CỦA API BẠN
        // (Bạn hãy kiểm tra log '[AI] Kết quả trả về' để sửa đoạn này cho chuẩn xác nhất)
        if (aiResult) {
            // Trường hợp 1: Trả về object trực tiếp
            if (aiResult.class || aiResult.name || aiResult.label) {
                diseaseName = aiResult.class || aiResult.name || aiResult.label;
                confidence = aiResult.confidence || aiResult.score || 0.0;
            } 
            // Trường hợp 2: Trả về mảng (lấy cái đầu tiên cao nhất)
            else if (Array.isArray(aiResult) && aiResult.length > 0) {
                diseaseName = aiResult[0].class || aiResult[0].name;
                confidence = aiResult[0].confidence || aiResult[0].score || 0.0;
            }
            // Trường hợp 3: Trả về top1 (cấu trúc YOLO json)
            else if (aiResult.top1) {
                 diseaseName = aiResult.top1.name || aiResult.top1.class;
                 confidence = aiResult.top1.confidence || 0.0;
            }
        }

        // Mapping mô tả tiếng Việt (Tạm thời hardcode, sau này có thể lấy từ DB Diseases)
        description = `Hệ thống phát hiện dấu hiệu của: ${diseaseName}.`;
        
        return {
            disease_name: diseaseName,
            confidence_score: confidence,
            description: description,
            recommendation: recommendation,
            raw_data: aiResult // Lưu lại JSON gốc để debug
        };

    } catch (error) {
        console.error('[AI Error]', error.message);
        // Nếu AI lỗi, trả về kết quả mặc định thay vì làm sập app
        return {
            disease_name: "Lỗi phân tích AI",
            confidence_score: 0.0,
            description: "Không thể kết nối tới máy chủ AI.",
            recommendation: "Vui lòng thử lại sau."
        };
    }
};

const diagnosisController = {
    /**
     * Xử lý upload ảnh và chẩn đoán
     */
    diagnose: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'Vui lòng upload một file ảnh.' });
            }

            const userId = req.user.userId;
            
            // Lấy URL từ Cloudinary
            const imageUrl = req.file.secure_url || req.file.url;

            if (!imageUrl) {
                 return res.status(500).json({ message: 'Lỗi khi upload. Không nhận được URL ảnh.' });
            }
            
            // === GỌI AI THẬT ===
            const aiResult = await callAiApiReal(imageUrl);

            // Chuẩn bị dữ liệu lưu DB
            // (Lưu ý: result_json sẽ chứa toàn bộ data trả về từ AI để sau này Admin soi)
            const resultToSave = {
                ...aiResult,
                image_url: imageUrl
            };

            // Lưu vào Database
            await diagnosisModel.create(
                userId,
                imageUrl, 
                aiResult.disease_name,
                aiResult.confidence_score,
                resultToSave 
            );

            // Trả kết quả về cho App Flutter
            res.status(200).json(resultToSave);
                
        } catch (error) {
            console.error('Lỗi trong hàm diagnose:', error);
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
            console.error('Lỗi trong hàm getHistory:', error);
            res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
        }
    }
};

module.exports = diagnosisController;