const express = require('express');
const router = express.Router();
const diagnosisController = require('../controllers/diagnosis.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const uploadMiddleware = require('../middleware/upload.middleware');

router.post(
    '/',
    authMiddleware,    // 1. Kiểm tra token
    uploadMiddleware,  // 2. Xử lý file upload
    diagnosisController.diagnose // 3. Xử lý logic
);

router.get('/history', authMiddleware, diagnosisController.getHistory);

module.exports = router;