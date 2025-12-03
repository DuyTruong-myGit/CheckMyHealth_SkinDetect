const express = require('express');
const router = express.Router();
const watchController = require('../controllers/watch.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     WatchMeasurement:
 *       type: object
 *       required:
 *         - type
 *       properties:
 *         type:
 *           type: string
 *           description: Loại đo lường (heart_rate, spO2, stress, workout, etc.)
 *           example: "heart_rate"
 *         heartRate:
 *           type: number
 *           description: Nhịp tim (bpm)
 *           example: 72
 *         spO2:
 *           type: number
 *           description: Nồng độ oxy trong máu (%)
 *           example: 98
 *         stress:
 *           type: number
 *           description: Mức độ căng thẳng
 *           example: 25
 *         steps:
 *           type: number
 *           description: Số bước chân
 *           example: 5000
 *         calories:
 *           type: number
 *           description: Lượng calo đốt cháy
 *           example: 200
 *         duration:
 *           type: string
 *           description: Thời lượng đo (format HH:MM hoặc MM:SS)
 *           example: "30:00"
 */

/**
 * @swagger
 * /api/watch/measurements:
 *   post:
 *     summary: Lưu dữ liệu đo từ smartwatch
 *     tags: [Watch]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WatchMeasurement'
 *     responses:
 *       201:
 *         description: Lưu thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lưu thành công"
 *                 id:
 *                   type: integer
 *                   example: 123
 *       400:
 *         description: Dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Loại đo lường (type) là bắt buộc"
 *       401:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi máy chủ
 */
router.post('/measurements', authMiddleware, watchController.createMeasurement);

/**
 * @swagger
 * /api/watch/measurements:
 *   get:
 *     summary: Lấy lịch sử đo lường từ smartwatch
 *     tags: [Watch]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           minimum: 1
 *           maximum: 500
 *         description: Số lượng bản ghi tối đa
 *     responses:
 *       200:
 *         description: Danh sách đo lường
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "123"
 *                   type:
 *                     type: string
 *                     example: "heart_rate"
 *                   timestamp:
 *                     type: string
 *                     example: "14:30 - 26/11"
 *                   date:
 *                     type: string
 *                     format: date-time
 *                   heartRate:
 *                     type: number
 *                     example: 72
 *                   spO2:
 *                     type: number
 *                     example: 98
 *                   stress:
 *                     type: number
 *                     example: 25
 *                   steps:
 *                     type: number
 *                     example: 5000
 *                   calories:
 *                     type: number
 *                     example: 200
 *                   duration:
 *                     type: string
 *                     example: "30:00"
 *       401:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/measurements', authMiddleware, watchController.getMeasurements);

/**
 * @swagger
 * /api/watch/measurements/latest:
 *   get:
 *     summary: Lấy bản ghi đo lường mới nhất
 *     tags: [Watch]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bản ghi mới nhất
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 type:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                 date:
 *                   type: string
 *                   format: date-time
 *                 heartRate:
 *                   type: number
 *                 spO2:
 *                   type: number
 *                 stress:
 *                   type: number
 *                 steps:
 *                   type: number
 *                 calories:
 *                   type: number
 *                 duration:
 *                   type: string
 *       404:
 *         description: Chưa có dữ liệu
 *       401:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/measurements/latest', authMiddleware, watchController.getLatest);

/**
 * @swagger
 * /api/watch/measurements/today:
 *   get:
 *     summary: Lấy tất cả dữ liệu đo lường hôm nay
 *     tags: [Watch]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách đo lường hôm nay
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/measurements/today', authMiddleware, watchController.getToday);

/**
 * @swagger
 * /api/watch/measurements/stats:
 *   get:
 *     summary: Lấy thống kê tổng hợp dữ liệu đo lường
 *     tags: [Watch]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month, all]
 *           default: all
 *         description: Kỳ thống kê (today, week, month, all)
 *     responses:
 *       200:
 *         description: Thống kê tổng hợp
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 period:
 *                   type: string
 *                   example: "all"
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalRecords:
 *                       type: integer
 *                     uniqueTypes:
 *                       type: integer
 *                     heartRate:
 *                       type: object
 *                       properties:
 *                         average:
 *                           type: number
 *                         max:
 *                           type: number
 *                         min:
 *                           type: number
 *                     spO2:
 *                       type: object
 *                       properties:
 *                         average:
 *                           type: number
 *                         max:
 *                           type: number
 *                         min:
 *                           type: number
 *                     stress:
 *                       type: object
 *                       properties:
 *                         average:
 *                           type: number
 *                         max:
 *                           type: number
 *                         min:
 *                           type: number
 *                     activity:
 *                       type: object
 *                       properties:
 *                         totalSteps:
 *                           type: integer
 *                         totalCalories:
 *                           type: integer
 *                     lastMeasurement:
 *                       type: string
 *                       format: date-time
 *                 byType:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                       count:
 *                         type: integer
 *                       avgHeartRate:
 *                         type: number
 *                       avgSpO2:
 *                         type: number
 *                       avgStress:
 *                         type: number
 *       400:
 *         description: Period không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/measurements/stats', authMiddleware, watchController.getStats);

/**
 * @swagger
 * /api/watch/measurements/range:
 *   get:
 *     summary: Lấy dữ liệu đo lường theo khoảng thời gian
 *     tags: [Watch]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-01"
 *         description: Ngày bắt đầu (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-31"
 *         description: Ngày kết thúc (YYYY-MM-DD)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *           minimum: 1
 *           maximum: 500
 *         description: Số lượng bản ghi tối đa
 *     responses:
 *       200:
 *         description: Danh sách đo lường trong khoảng thời gian
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: Thiếu tham số startDate hoặc endDate
 *       401:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/measurements/range', authMiddleware, watchController.getByDateRange);

/**
 * @swagger
 * /api/watch/measurements/by-type/{type}:
 *   get:
 *     summary: Lấy dữ liệu đo lường theo loại
 *     tags: [Watch]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: Loại đo lường (heart_rate, spO2, stress, workout, etc.)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           minimum: 1
 *           maximum: 500
 *         description: Số lượng bản ghi tối đa
 *     responses:
 *       200:
 *         description: Danh sách đo lường theo loại
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/measurements/by-type/:type', authMiddleware, watchController.getByType);

/**
 * @swagger
 * /api/watch/measurements/{id}:
 *   get:
 *     summary: Lấy chi tiết một bản ghi đo lường
 *     tags: [Watch]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của bản ghi đo lường
 *     responses:
 *       200:
 *         description: Chi tiết bản ghi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 type:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                 date:
 *                   type: string
 *                   format: date-time
 *                 heartRate:
 *                   type: number
 *                 spO2:
 *                   type: number
 *                 stress:
 *                   type: number
 *                 steps:
 *                   type: number
 *                 calories:
 *                   type: number
 *                 duration:
 *                   type: string
 *       404:
 *         description: Không tìm thấy bản ghi
 *       401:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/measurements/:id', authMiddleware, watchController.getById);

/**
 * @swagger
 * /api/watch/measurements/{id}:
 *   delete:
 *     summary: Xóa một bản ghi đo lường
 *     tags: [Watch]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của bản ghi đo lường
 *     responses:
 *       200:
 *         description: Xóa thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Đã xóa bản ghi đo lường."
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy bản ghi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Không tìm thấy bản ghi hoặc bạn không có quyền xóa."
 *       500:
 *         description: Lỗi máy chủ
 */
router.delete('/measurements/:id', authMiddleware, watchController.deleteMeasurement);


router.post('/link', authMiddleware, watchController.linkDevice);
router.get('/status/:deviceId', watchController.checkDeviceStatus);


module.exports = router;

