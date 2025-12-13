const diagnosisModel = require('../models/diagnosis.model');
const axios = require('axios');
const FormData = require('form-data');
const { pool } = require('../config/db');

// === 1. BẢNG ÁNH XẠ (MAP) MỚI ===
// Key: Phải TRÙNG KHỚP 100% với output của infer.py (snake_case)
// Value: Là disease_code trong Database MySQL của bạn
const AI_TO_DB_MAP = {
    // Ung thư & Tiền ung thư
    'actinic_keratosis': 'Actinic Keratosis',
    'basal_cell_carcinoma': 'Basal Cell Carcinoma',
    'melanoma': 'Melanoma',
    'squamous_cell_carcinoma': 'Squamous Cell Carcinoma',

    // Lành tính
    'dermatofibroma': 'Dermatofibroma',
    'nevus': 'Nevus',
    'pigmented_benign_keratosis': 'Pigmented Benign Keratosis',
    'seborrheic_keratosis': 'Seborrheic Keratosis',
    'vascular_lesion': 'Vascular Lesion',

    // Nhiễm trùng / Khác
    'ringworm': 'Ringworm',

    // Da khỏe mạnh
    'normal_skin': 'Normal Skin'
};

// === 2. HÀM VALIDATE HÌNH ẢNH ===
const validateSkinImage = (aiResult) => {
    const label = aiResult.prediction;
    const confidence = aiResult.confidence;

    // Case 1: AI trả về unknown_normal (Không phải da hoặc ảnh quá mờ)
    if (label === 'unknown_normal') {
        return {
            isValid: false,
            reason: 'not_skin_image',
            message: 'Hình ảnh không phải là vùng da hoặc không đủ rõ nét. Vui lòng chụp lại.'
        };
    }

    // Case 2: Da khỏe mạnh
    if (label === 'normal_skin') {
        return {
            isValid: true,
            isDisease: false,
            message: 'Da khỏe mạnh, không phát hiện dấu hiệu bất thường.'
        };
    }

    // Case 3: Bệnh chưa có trong Map
    if (!AI_TO_DB_MAP[label]) {
        console.warn(`[AI Warning] Class mới chưa được map: ${label}`);
        return {
            isValid: false,
            reason: 'unsupported_disease',
            message: 'Hệ thống phát hiện loại bệnh mới chưa được cập nhật dữ liệu.'
        };
    }

    // Case 4: Độ tin cậy thấp (Dự phòng, vì AI Python đã lọc < 0.55 rồi)
    if (confidence < 0.4) {
        return {
            isValid: false,
            reason: 'low_confidence',
            message: 'Độ tin cậy thấp. Vui lòng chụp ảnh rõ nét hơn.'
        };
    }

    return { isValid: true, isDisease: true };
};

// === 3. HÀM GỌI API AI ===
const callAiApiReal = async (imageUrl) => {
    const startTime = Date.now();
    try {
        console.log(`[AI] Đang tải ảnh từ Cloudinary: ${imageUrl}`);

        // 1. Tải ảnh từ URL về buffer
        const imageResponse = await axios.get(imageUrl, { responseType: 'stream', timeout: 15000 });

        const form = new FormData();
        form.append('file', imageResponse.data, { filename: 'skin.jpg', contentType: 'image/jpeg' });

        // 2. Gọi sang Server AI (Python FastAPI)
        // LƯU Ý: Đảm bảo URL này đúng với server deploy của bạn
        console.log('[AI] Đang gửi sang Server AI...');
        const aiResponse = await axios.post('https://skin-train-exam.onrender.com/predict', form, {
            headers: { ...form.getHeaders() },
            timeout: 90000 // Timeout dài cho lần khởi động đầu tiên (cold start)
        });

        const responseTime = Date.now() - startTime;
        const aiResult = aiResponse.data;

        // 3. Validate kết quả
        if (!aiResult || !aiResult.success) throw new Error('AI API Error: No success flag');

        const validation = validateSkinImage(aiResult);
        if (!validation.isValid) {
            return {
                success: false,
                error_type: validation.reason,
                description: validation.message,
                is_valid_skin_image: false
            };
        }

        // 4. Xử lý Logic Database
        const predictedClass = aiResult.prediction; // Ví dụ: 'basal_cell_carcinoma'
        const dbDiseaseCode = AI_TO_DB_MAP[predictedClass]; // Ví dụ: 'Basal Cell Carcinoma'

        let diseaseInfo = null;
        let diseaseNameVi = "Chưa cập nhật tiếng Việt";
        let infoId = null;

        // Nếu là bệnh (không phải da thường), mới tìm trong DB
        if (validation.isDisease) {
            try {
                const [rows] = await pool.query(
                    'SELECT info_id, disease_name_vi, description FROM skin_diseases_info WHERE disease_code = ?',
                    [dbDiseaseCode]
                );

                if (rows.length > 0) {
                    diseaseInfo = rows[0];
                    diseaseNameVi = diseaseInfo.disease_name_vi;
                    infoId = diseaseInfo.info_id;
                }
            } catch (dbError) {
                console.error('DB Error:', dbError);
            }
        } else {
            // Trường hợp Normal Skin
            diseaseNameVi = "Da khỏe mạnh";
        }

        // Ưu tiên mô tả từ DB, nếu không có thì dùng từ AI, nếu không thì báo trống
        const description = diseaseInfo ? diseaseInfo.description : (aiResult.description || "");

        // Lấy recommendation và risk từ AI (Model mới hỗ trợ cái này)
        const recommendation = aiResult.recommendation || "Vui lòng theo dõi thêm.";
        const riskLevel = aiResult.risk_level || "unknown";

        return {
            success: true,
            is_valid_skin_image: true,
            image_url: imageUrl,

            disease_name: dbDiseaseCode || "Normal Skin",
            disease_name_vi: diseaseNameVi,
            info_id: infoId,

            confidence_score: aiResult.confidence || 0.0,
            description: description,
            recommendation: recommendation,
            risk_level: riskLevel, // Mới: dùng để hiện màu sắc cảnh báo ở FE

            prediction_code: predictedClass,
            response_time_ms: responseTime
        };

    } catch (error) {
        console.error('AI Logic Error:', error.message);
        // Trả về lỗi chung để FE xử lý
        return {
            success: false,
            error_type: 'processing_error',
            description: 'Lỗi kết nối đến hệ thống AI. Vui lòng thử lại sau.'
        };
    }
};

const diagnosisController = {
    // API: POST /api/diagnose
    diagnose: async (req, res) => {
        try {
            // Kiểm tra file upload
            if (!req.file) return res.status(400).json({ message: 'Vui lòng upload ảnh.' });

            // Lấy URL ảnh từ Cloudinary
            const imageUrl = req.file.secure_url || req.file.url;

            // Gọi hàm xử lý AI
            const result = await callAiApiReal(imageUrl);

            // Nếu thất bại (ảnh rác, lỗi server...)
            if (!result.success) {
                return res.status(400).json(result);
            }

            // Lưu lịch sử vào DB
            await diagnosisModel.create(
                req.user.userId,
                imageUrl,
                result.disease_name,
                result.confidence_score,
                result // Lưu toàn bộ JSON kết quả vào cột result_json
            );

            res.status(200).json(result);

        } catch (error) {
            console.error("Diagnose Controller Error:", error);
            res.status(500).json({ message: 'Lỗi máy chủ nội bộ', error: error.message });
        }
    },

    // API: GET /api/diagnose/history
    getHistory: async (req, res) => {
        try {
            const userId = req.user.userId;
            const history = await diagnosisModel.findByUserId(userId);
            res.status(200).json(history);
        } catch (error) {
            res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
        }
    },

    // API: DELETE /api/diagnose/:id
    deleteHistoryItem: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.userId;

            const success = await diagnosisModel.deleteById(id, userId);

            if (success) {
                res.status(200).json({ message: 'Đã xóa kết quả chẩn đoán.' });
            } else {
                res.status(404).json({ message: 'Không tìm thấy bản ghi hoặc bạn không có quyền xóa.' });
            }
        } catch (error) {
            console.error('Delete Error:', error);
            res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
        }
    }
};

module.exports = diagnosisController;