# CheckMyHealth - Phát Hiện & Quản Lý Bệnh Da Liễu

Một ứng dụng web toàn diện cho việc phát hiện bệnh da liễu, theo dõi sức khỏe và quản lý bệnh bằng công nghệ AI và lập lịch sức khỏe.

## 🎯 Tổng Quan Dự Án

**CheckMyHealth** là một ứng dụng full-stack kết hợp:
- **Phát hiện bệnh da liễu bằng AI** sử dụng Google Gemini API
- **Bảng điều khiển theo dõi sức khỏe** với thống kê và xu hướng
- **Hệ thống quản lý lịch trình** cho thuốc và cuộc hẹn
- **Hỗ trợ chat** cho tư vấn sức khỏe
- **Tin tức & Giáo dục** về bệnh da liễu
- **Bảng điều khiển quản trị** để quản lý cơ sở dữ liệu bệnh

## 📁 Cấu Trúc Dự Án

```
checkmyhealth/
├── BE/                          # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/             # Cấu hình DB, Auth, Cloudinary
│   │   ├── controllers/        # Xử lý logic kinh doanh
│   │   ├── models/            # Các truy vấn cơ sở dữ liệu
│   │   ├── routes/            # Các điểm cuối API
│   │   ├── middleware/        # Auth, upload, rate limiting
│   │   ├── cron/              # Các tác vụ được lập lịch
│   │   ├── app.js             # Thiết lập ứng dụng Express
│   │   └── server.js          # Điểm vào máy chủ
│   ├── package.json
│   └── .env
│
└── FE/                          # Frontend (React + Vite)
    ├── src/
    │   ├── components/        # Các thành phần UI tái sử dụng
    │   ├── pages/            # Các thành phần trang
    │   ├── services/         # API client & logic kinh doanh
    │   ├── contexts/         # React context (Auth)
    │   ├── hooks/            # Custom React hooks
    │   ├── layouts/          # Bố cục trang
    │   ├── utils/            # Hàm trợ giúp
    │   ├── App.jsx           # Thành phần ứng dụng chính
    │   └── main.jsx          # Điểm vào
    ├── package.json
    ├── vite.config.js
    └── .env
```

## 🚀 Tính Năng

### Tính Năng Người Dùng
- ✅ **Phát Hiện Bệnh Da Liễu** - Tải lên hình ảnh để phân tích bằng AI
- ✅ **Bảng Điều Khiển Sức Khỏe** - Xem lịch sử chẩn đoán và thống kê
- ✅ **Quản Lý Lịch Trình** - Tạo, chỉnh sửa, xóa nhắc nhở về thuốc & cuộc hẹn
- ✅ **Chat Trực Tiếp** - Chat thời gian thực với cố vấn sức khỏe
- ✅ **Cơ Sở Dữ Liệu Bệnh** - Duyệt và so sánh bệnh da liễu
- ✅ **Tin Tức & Cập Nhật** - Tin tức sức khỏe mới nhất và mẹo chăm sóc da
- ✅ **Theo Dõi Hoạt Động** - Giám sát hoạt động hàng ngày và chỉ số sức khỏe
- ✅ **Quản Lý Hồ Sơ** - Cài đặt người dùng và thông tin sức khỏe

### Tính Năng Quản Trị
- ✅ **Quản Lý Bệnh** - Thêm, chỉnh sửa, xóa bệnh cùng hình ảnh
- ✅ **Nhập/Xuất Bệnh** - Nhập/xuất hàng loạt bệnh dưới dạng CSV
- ✅ **Quản Lý Người Dùng** - Xem và quản lý tài khoản người dùng
- ✅ **Quản Lý Phản Hồi** - Xem xét phản hồi của người dùng
- ✅ **Quản Lý Tin Tức** - Tạo và quản lý tin tức sức khỏe
- ✅ **Báo Cáo & Phân Tích** - Thống kê người dùng và thông tin chi tiết nền tảng

## 🛠️ Công Nghệ Sử Dụng

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Cơ Sở Dữ Liệu**: MySQL
- **Xác Thực**: JWT + Google OAuth 2.0
- **Lưu Trữ Hình Ảnh**: Cloudinary
- **AI**: Google Gemini API
- **Email**: SendGrid / Nodemailer
- **Lập Lịch Tác Vụ**: node-cron
- **Tài Liệu API**: Swagger/OpenAPI
- **Giới Hạn Tỷ Lệ**: express-rate-limit
- **Tải Lên Tệp**: Multer

### Frontend
- **Framework**: React 19
- **Công Cụ Xây Dựng**: Vite
- **Định Tuyến**: React Router v7
- **Biểu Đồ**: Recharts
- **Bản Đồ**: Leaflet + React-Leaflet
- **Biểu Tượng**: React Icons
- **HTTP Client**: Fetch API
- **Định Kiểu**: CSS (tùy chỉnh)

## 📋 Điều Kiện Tiên Quyết

- **Node.js** >= 16.0
- **MySQL** >= 8.0
- Tài khoản **Cloudinary** (để tải lên hình ảnh)
- Thông tin **Google OAuth** (để xác thực)
- **SendGrid** hoặc **Nodemailer** (để gửi email)
- Khóa **Google Gemini API** (để phân tích AI)

## ⚙️ Cài Đặt

### 1. Thiết Lập Backend

```bash
cd BE
npm install

# Tạo tệp .env
cat > .env << EOF
# Cơ Sở Dữ Liệu
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=checkmyhealth
DB_PORT=3306

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Email
SENDGRID_API_KEY=your_sendgrid_key
EMAIL_FROM=noreply@checkmyhealth.com

# URL Frontend
FRONTEND_URL=http://localhost:5173

# Server
PORT=5000
NODE_ENV=development
EOF

npm run dev
```

### 2. Thiết Lập Frontend

```bash
cd FE
npm install

# Tạo tệp .env
cat > .env << EOF
VITE_API_BASE_URL=http://localhost:5000
EOF

npm run dev
```

## 🗄️ Lược Đồ Cơ Sở Dữ Liệu

### Các Bảng Chính
- **users** - Tài khoản người dùng và xác thực
- **diagnoses** - Lịch sử chẩn đoán
- **diseases** - Cơ sở dữ liệu bệnh (info_id, disease_name_vi, disease_code, image_url, description)
- **schedules** - Lịch trình thuốc/cuộc hẹn của người dùng
- **schedule_logs** - Theo dõi trạng thái hoàn thành lịch trình
- **notifications** - Thông báo hệ thống
- **chat_messages** - Lịch sử chat
- **news** - Các bài viết tin tức sức khỏe
- **feedback** - Phản hồi của người dùng

## 🔑 Các Điểm Cuối API Chính

### Xác Thực
- `POST /api/auth/register` - Đăng ký người dùng mới
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/refresh` - Làm mới mã JWT
- `GET /api/auth/google` - Đăng nhập Google OAuth

### Bệnh
- `GET /api/diseases` - Lấy tất cả bệnh (có tìm kiếm)
- `GET /api/diseases/:id` - Lấy chi tiết bệnh
- `POST /api/diseases` - Tạo bệnh (chỉ admin)
- `PUT /api/diseases/:id` - Cập nhật bệnh (chỉ admin)
- `DELETE /api/diseases/:id` - Xóa bệnh (chỉ admin)

### Lịch Trình
- `POST /api/schedules` - Tạo lịch trình
- `GET /api/schedules/daily?date=YYYY-MM-DD&dayOfWeek=N` - Lấy tác vụ hàng ngày
- `GET /api/schedules/all` - Lấy tất cả lịch trình của người dùng
- `PUT /api/schedules/:id` - Cập nhật lịch trình
- `PUT /api/schedules/:id/toggle` - Đánh dấu hoàn thành tác vụ
- `DELETE /api/schedules/:id` - Xóa lịch trình

### Chẩn Đoán
- `POST /api/diagnoses` - Tạo chẩn đoán (phân tích AI)
- `GET /api/diagnoses` - Lấy lịch sử chẩn đoán của người dùng
- `GET /api/diagnoses/:id` - Lấy chi tiết chẩn đoán

### Quản Trị
- `GET /api/admin/users` - Lấy tất cả người dùng
- `GET /api/admin/reports` - Lấy báo cáo và phân tích
- `POST /api/admin/diseases/import` - Nhập hàng loạt bệnh
- `GET /api/admin/diseases/export` - Xuất bệnh

## 📖 Tài Liệu API

Tài liệu Swagger API có sẵn tại:
```
http://localhost:5000/api-docs
```

## 🔄 Cập Nhật Gần Đây

### Tìm Kiếm AdminDiseases
- ✅ Tìm kiếm thời gian thực với debounce (500ms)
- ✅ Tự động tìm kiếm mà không cần click nút
- ✅ Thông báo "Không tìm thấy bệnh lý nào." khi không có kết quả
- ✅ Chức năng xóa tìm kiếm

### Quản Lý Lịch Trình
- ✅ Chức năng cập nhật lịch trình với điểm cuối `PUT /:id`
- ✅ Hỗ trợ lịch trình lặp lại và lịch trình một lần
- ✅ Chuẩn hóa loại lịch trình (medication, skincare, checkup, exercise, appointment, other)
- ✅ Sửa: Hiển thị trạng thái checkbox trong chế độ "Hiển Thị Tất Cả" bằng cách kết nối với schedule_logs cho ngày hôm nay

## 🐛 Các Vấn Đề Đã Biết & Sửa Chữa

### Chế Độ Hiển Thị Tất Cả Lịch Trình
- **Vấn đề**: Trạng thái checkbox không hiển thị trong chế độ "Hiển Thị Tất Cả"
- **Sửa**: Cập nhật `BE/src/models/schedule.model.js` - `getAll()` bây giờ bao gồm log_status từ schedule_logs của ngày hôm nay

## 🔐 Bảo Mật

- Xác thực dựa trên mã JWT
- Tích hợp Google OAuth 2.0
- Mã hóa mật khẩu với bcryptjs
- Giới hạn tỷ lệ trên các điểm cuối nhạy cảm
- Cấu hình CORS
- Ngăn chặn SQL injection bằng truy vấn được tham số hóa
- Xác thực tải lên tệp và quét virus

## 📝 Các Biến Môi Trường

### Backend (.env)
```
DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT
JWT_SECRET, JWT_EXPIRE
CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL
GEMINI_API_KEY
SENDGRID_API_KEY, EMAIL_FROM
FRONTEND_URL
PORT, NODE_ENV
```

### Frontend (.env)
```
VITE_API_BASE_URL
```

## 🚀 Triển Khai

### Backend (Vercel/Heroku)
```bash
npm start
```

### Frontend (Vercel)
```bash
npm run build
```

## 📚 Tài Liệu

- [Tài Liệu API](http://localhost:5000/api-docs)
- [Lược Đồ Cơ Sở Dữ Liệu](./docs/database.md)
- [Hướng Dẫn Thiết Lập](./docs/setup.md)

## 👥 Đội Ngũ

- **Nhà Phát Triển Backend**: Duy Truong
- **Nhà Phát Triển Frontend**: [Các thành viên trong đội]
- **Tích Hợp AI**: Google Gemini API

## 📄 Giấy Phép

Giấy Phép ISC

## 🤝 Đóng Góp

1. Tạo một nhánh tính năng (`git checkout -b feature/amazing-feature`)
2. Cam kết thay đổi (`git commit -m 'Add amazing feature'`)
3. Đẩy lên nhánh (`git push origin feature/amazing-feature`)
4. Mở Yêu Cầu Kéo

## 📧 Liên Hệ & Hỗ Trợ

Để được hỗ trợ, vui lòng gửi email: support@checkmyhealth.com

---

**Cập nhật lần cuối**: 6 tháng 12 năm 2025
**Nhánh hiện tại**: test_deploy
**Kho lưu trữ**: [CheckMyHealth](https://github.com/DuyTruong-myGit/checkmyhealth)
