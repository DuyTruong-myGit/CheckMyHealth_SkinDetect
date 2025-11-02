const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- Middlewares ---
// Cho phép các request từ mọi nguồn (sẽ siết chặt sau cho production)
app.use(cors());
// Cho phép Express đọc JSON từ body của request
app.use(express.json());
// Cho phép Express đọc dữ liệu từ form (sẽ cần khi upload ảnh)
app.use(express.urlencoded({ extended: true }));


// --- Routes ---
// Route cơ bản để kiểm tra server
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Skin Disease Diagnosis API!' });
});

// TODO: Gắn các routes xác thực (auth.routes.js) ở đây khi hoàn thành

// --- Xuất app ra ---
module.exports = app;