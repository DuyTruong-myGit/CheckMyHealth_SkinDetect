const diagnosisModel = require('../models/diagnosis.model');
const axios = require('axios');
const FormData = require('form-data');
const diseaseModel = require('../models/disease.model');
const { pool } = require('../config/db');

// === DANH SÁCH CLASS HỢP LỆ VÀ ÁNH XẠ DB ===
// const AI_TO_DB_MAP = {
//     'nv':    'Nevus',                   
//     'vasc':  'Vascular Lesion',          
//     'bcc':   'Basal Cell Carcinoma',    
//     'mel':   'Melanoma',                
//     'bkl':   'Seborrheic Keratosis',    
//     'df':    'Dermatofibroma',          
//     'akiec': 'Actinic Keratosis'        
// };

const AI_TO_DB_MAP = {
    "Actinic Keratosis": "ACTINIC_KERATOSIS",
    "Basal Cell Carcinoma": "BASAL_CELL_CARCINOMA",
    "Dermatofibroma": "DERMATOFIBROMA",
    "Melanoma": "MELANOMA",
    "Nevus": "NEVUS",
    "Pigmented Benign Keratosis": "PIGMENTED_BENIGN_KERATOSIS",
    "Seborrheic Keratosis": "SEBORRHEIC_KERATOSIS",
    "Squamous Cell Carcinoma": "SQUAMOUS_CELL_CARCINOMA",
    "Vascular Lesion": "VASCULAR_LESION",
    "Ringworm": "RINGWORM"
};

// === HÀM KIỂM TRA ẢNH CÓ PHẢI DA LIỄU KHÔNG ===
// const validateSkinImage = (aiResult) => {
//     // 1. Kiểm tra class có trong danh sách không
//     const predictedClass = aiResult.prediction;
    
//     // === SỬA LỖI Ở ĐÂY: Dùng đúng tên biến AI_TO_DB_MAP ===
//     if (!AI_TO_DB_MAP[predictedClass]) {
//         return {
//             isValid: false,
//             reason: 'unknown_class',
//             message: 'AI không nhận diện được đây là ảnh bệnh da liễu trong hệ thống.'
//         };
//     }

//     // 2. Kiểm tra confidence
//     const confidence = aiResult.confidence;
//     if (confidence < 0.3) {
//         return {
//             isValid: false,
//             reason: 'low_confidence',
//             message: 'Độ tin cậy quá thấp. Vui lòng chụp ảnh rõ hơn.'
//         };
//     }

//     return { isValid: true };
// };

const validateSkinImage = (aiResult) => {
    const label = aiResult.prediction;
    const confidence = aiResult.confidence;

    // 1. Ảnh KHÔNG liên quan mô hình
    if (label === "Unknown_Normal") {
        return {
            isValid: false,
            reason: "not_skin_image",
            message: "Ảnh không liên quan đến da liễu. Vui lòng chụp ảnh vùng da cần chẩn đoán."
        };
    }

    // 2. Da bình thường → không phải bệnh
    if (label === "Normal Skin") {
        return {
            isValid: true,
            isDisease: false,
            message: "Da bình thường, không phát hiện dấu hiệu bệnh lý."
        };
    }

    // 3. Không nằm trong danh sách bệnh hệ thống hỗ trợ
    if (!AI_TO_DB_MAP[label]) {
        return {
            isValid: false,
            reason: "unsupported_disease",
            message: "Bệnh này chưa được hệ thống hỗ trợ."
        };
    }

    // 4. Confidence thấp
    if (confidence < 0.55) {
        return {
            isValid: false,
            reason: "low_confidence",
            message: "Ảnh chưa đủ rõ, vui lòng chụp lại."
        };
    }

    return { isValid: true, isDisease: true };
};

// --- HÀM GỌI API AI THỰC TẾ ---
const callAiApiReal = async (imageUrl) => {
    const startTime = Date.now(); // Track response time
    try {
        console.log(`[AI] Đang tải ảnh: ${imageUrl}`);
        const imageResponse = await axios.get(imageUrl, { responseType: 'stream', timeout: 15000 });
        
        const form = new FormData();
        form.append('file', imageResponse.data, { filename: 'skin.jpg', contentType: 'image/jpeg' });

        console.log('[AI] Đang gọi Server AI...');
        const aiResponse = await axios.post('https://skin-train-exam.onrender.com/predict', form, {
            headers: { ...form.getHeaders() },
            timeout: 90000
        });

        const responseTime = Date.now() - startTime; // Calculate response time
        const aiResult = aiResponse.data;
        
        // Validation
        if (!aiResult || !aiResult.success) throw new Error('AI API Error');
        const validation = validateSkinImage(aiResult);
        if (!validation.isValid) {
            return {
                success: false,
                error_type: validation.reason,
                description: validation.message,
                is_valid_skin_image: false
            };
        }

        // === LOGIC LẤY ID VÀ TÊN TỪ DB ===
        const predictedClass = aiResult.prediction; 
        const dbDiseaseCode = AI_TO_DB_MAP[predictedClass];
        
        let diseaseInfo = null;
        let diseaseNameVi = "Chưa cập nhật tiếng Việt";
        let infoId = null;

        try {
            // Tìm trong bảng skin_diseases_info dựa trên disease_code
            const [rows] = await pool.query(
                'SELECT info_id, disease_name_vi, description FROM skin_diseases_info WHERE disease_code = ?', 
                [dbDiseaseCode]
            );
            
            if (rows.length > 0) {
                diseaseInfo = rows[0];
                diseaseNameVi = diseaseInfo.disease_name_vi; // Lấy tên tiếng Việt
                infoId = diseaseInfo.info_id;                // Lấy ID để điều hướng
            }
        } catch (dbError) {
            console.error('DB Error:', dbError);
        }

        return {
            success: true,
            is_valid_skin_image: true,
            image_url: imageUrl,
            disease_name: dbDiseaseCode,    // Tên tiếng Anh chuẩn DB
            disease_name_vi: diseaseNameVi, // Tên tiếng Việt
            info_id: infoId,                // ID quan trọng để bấm nút xem
            
            confidence_score: aiResult.confidence || 0.0,
            description: diseaseInfo ? diseaseInfo.description : (aiResult.description || ""),
            recommendation: aiResult.recommendation || "Vui lòng đi khám bác sĩ.",
            prediction_code: predictedClass,
            response_time_ms: responseTime // Track response time
        };

    } catch (error) {
        console.error('AI Logic Error:', error.message);
        return { success: false, error_type: 'processing_error', description: 'Lỗi xử lý ảnh' };
    }
};

const diagnosisController = {
    diagnose: async (req, res) => {
        try {
            if (!req.file) return res.status(400).json({ message: 'Vui lòng upload ảnh.' });
            const imageUrl = req.file.secure_url || req.file.url;
            
            const aiResult = await callAiApiReal(imageUrl);

            if (!aiResult.success) {
                return res.status(400).json(aiResult);
            }

            // Lưu vào DB
            await diagnosisModel.create(
                req.user.userId,
                imageUrl, 
                aiResult.disease_name, 
                aiResult.confidence_score,
                aiResult // Lưu JSON chứa info_id
            );

            res.status(200).json(aiResult);
        } catch (error) {
            res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
        }
    },

    getHistory: async (req, res) => {
        try {
            const userId = req.user.userId;
            const history = await diagnosisModel.findByUserId(userId);
            res.status(200).json(history);
        } catch (error) {
            res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
        }
    },

    deleteHistoryItem: async (req, res) => {
        try {
            const { id } = req.params; // Lấy history_id từ URL
            const userId = req.user.userId; // Lấy user_id từ Token

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