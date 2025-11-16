// File: FE/src/config/api.js

// 1. Đọc biến VITE_API_URL từ .env (do Vercel cung cấp)
const API_BASE_URL = import.meta.env.VITE_API_URL 

// 2. Cung cấp một giá trị dự phòng cho local
                     || 'http://localhost:3000/api'; // Hoặc port BE của bạn

// 3. Đặt timeout
const API_TIMEOUT = 10000; // 10 giây

// 4. Xuất (export) ra
export { API_BASE_URL, API_TIMEOUT };