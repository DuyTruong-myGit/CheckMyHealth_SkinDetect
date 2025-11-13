# Hướng dẫn tích hợp Frontend với Backend API

Tài liệu này mô tả cách frontend giao tiếp và sử dụng API từ backend.

## Cấu hình

### 1. File `.env`

Tạo file `.env` trong thư mục `FE/` với nội dung:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=8000
```

- `VITE_API_BASE_URL`: Địa chỉ backend (mặc định: `http://localhost:3000`)
- `VITE_API_TIMEOUT`: Thời gian timeout khi gọi API (ms)

### 2. Backend CORS

Backend đã được cấu hình CORS để cho phép frontend gọi API từ `http://localhost:5173` (Vite default port).

Nếu frontend chạy trên port khác, cập nhật biến môi trường `FRONTEND_URL` trong backend `.env`.

## Các Service đã được tạo

### 1. `authService.js` - Xác thực người dùng

```javascript
import { register, login, logout, requestPasswordReset, resetPasswordWithCode, isAuthenticated } from './services/authService.js'

// Đăng ký
await register({ email: 'user@example.com', password: 'password123', fullName: 'Nguyễn Văn A' })

// Đăng nhập (token sẽ tự động lưu vào localStorage)
await login({ email: 'user@example.com', password: 'password123' })

// Đăng xuất
logout()

// Yêu cầu đặt lại mật khẩu
await requestPasswordReset()

// Đặt lại mật khẩu với mã OTP
await resetPasswordWithCode({ code: '123456', newPassword: 'newpassword123' })

// Kiểm tra đã đăng nhập chưa
const isAuth = isAuthenticated()
```

### 2. `diagnosisService.js` - Chẩn đoán bệnh da

```javascript
import { diagnose, getHistory } from './services/diagnosisService.js'

// Chẩn đoán từ file ảnh
const fileInput = document.querySelector('input[type="file"]')
const file = fileInput.files[0]
const result = await diagnose(file)
// result: { disease_name, confidence_score, description, recommendation, image_url }

// Lấy lịch sử chẩn đoán
const history = await getHistory()
```

### 3. `profileService.js` - Quản lý hồ sơ

```javascript
import { getProfile, updateProfile } from './services/profileService.js'

// Lấy thông tin hồ sơ
const profile = await getProfile()
// profile: { userId, email, fullName, provider }

// Cập nhật hồ sơ
await updateProfile({ fullName: 'Nguyễn Văn B' })
```

### 4. `adminService.js` - Quản trị (Admin only)

```javascript
import { 
  getStatistics, 
  getUsers, 
  updateUserStatus, 
  updateUserRole, 
  deleteUser, 
  getHistoryForUser 
} from './services/adminService.js'

// Lấy thống kê
const stats = await getStatistics()
// stats: { totalUsers, totalDiagnoses }

// Lấy danh sách người dùng
const users = await getUsers() // Tất cả
const users = await getUsers('search term') // Tìm kiếm

// Cập nhật trạng thái người dùng
await updateUserStatus(userId, 'active') // hoặc 'suspended'

// Cập nhật quyền người dùng
await updateUserRole(userId, 'admin') // hoặc 'user'

// Xóa người dùng
await deleteUser(userId)

// Lấy lịch sử chẩn đoán của một người dùng
const history = await getHistoryForUser(userId)
```

## Xử lý lỗi

Tất cả các service đều throw Error với message rõ ràng. Nên sử dụng try-catch:

```javascript
try {
  const result = await login({ email: 'user@example.com', password: 'password' })
  console.log('Đăng nhập thành công:', result)
} catch (error) {
  console.error('Lỗi đăng nhập:', error.message)
  // Hiển thị thông báo lỗi cho người dùng
}
```

### Lỗi 401 (Unauthorized)

Khi token hết hạn hoặc không hợp lệ, `apiClient` sẽ tự động xóa token khỏi localStorage. Bạn nên redirect người dùng đến trang đăng nhập:

```javascript
try {
  await getProfile()
} catch (error) {
  if (error.message.includes('401') || error.message.includes('hết hạn')) {
    // Redirect đến trang đăng nhập
    window.location.href = '/login'
  }
}
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/request-password-reset` - Yêu cầu đặt lại mật khẩu (cần auth)
- `POST /api/auth/reset-password-with-code` - Đặt lại mật khẩu với mã OTP (cần auth)

### Diagnosis (`/api/diagnose`)
- `POST /api/diagnose` - Chẩn đoán bệnh da (cần auth, multipart/form-data)
- `GET /api/diagnose/history` - Lịch sử chẩn đoán (cần auth)

### Profile (`/api/profile`)
- `GET /api/profile` - Lấy thông tin hồ sơ (cần auth)
- `PUT /api/profile` - Cập nhật hồ sơ (cần auth)

### Admin (`/api/admin`)
- `GET /api/admin/statistics` - Thống kê (cần auth + admin)
- `GET /api/admin/users` - Danh sách người dùng (cần auth + admin)
- `PUT /api/admin/users/:userId/status` - Cập nhật trạng thái (cần auth + admin)
- `PUT /api/admin/users/:userId/role` - Cập nhật quyền (cần auth + admin)
- `DELETE /api/admin/users/:userId` - Xóa người dùng (cần auth + admin)
- `GET /api/admin/history/:userId` - Lịch sử chẩn đoán của user (cần auth + admin)

## JWT Token

- Token được tự động lưu vào `localStorage` khi đăng nhập thành công
- Token được tự động thêm vào header `Authorization: Bearer <token>` trong mọi request
- Token được tự động xóa khi gặp lỗi 401

## Ví dụ sử dụng trong Component

```javascript
import { useState, useEffect } from 'react'
import { login, isAuthenticated } from './services/authService.js'
import { getProfile } from './services/profileService.js'

function LoginComponent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      await login({ email, password })
      // Redirect hoặc cập nhật state
      window.location.href = '/dashboard'
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <form onSubmit={handleLogin}>
      {error && <div className="error">{error}</div>}
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Đăng nhập</button>
    </form>
  )
}
```

## Swagger Documentation

Backend có Swagger UI tại: `http://localhost:3000/api-docs`

Bạn có thể xem tất cả API endpoints và test trực tiếp tại đây.

