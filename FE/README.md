# SkinCare Frontend (React + Vite)

Frontend cho dự án SkinCare, tích hợp với backend `@skin_be` và cơ sở dữ liệu `skin_db`. Ứng dụng cung cấp giao diện khách hàng và khu vực quản trị với các module đơn hàng, sản phẩm, người dùng.

## Yêu cầu môi trường

- Node.js >= 18
- npm >= 9

## Cài đặt

```bash
npm install
```

## Cấu hình môi trường

Tạo file `.env` tại thư mục gốc với nội dung:

```
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=8000
VITE_DB_NAME=skin_db
```

- `VITE_API_BASE_URL`: địa chỉ backend đang chạy cục bộ (mặc định `http://localhost:8000`)
- `VITE_DB_NAME`: tên database backend sử dụng (`skin_db`)
- `VITE_API_TIMEOUT`: thời gian timeout (ms) khi gọi API

## Chạy dự án

```bash
npm run dev
```

Ứng dụng sẽ chạy tại [http://localhost:5173](http://localhost:5173).

## Build production

```bash
npm run build
```

## Kiểm tra lint

```bash
npm run lint
```

## Cấu trúc chính

- `src/pages`: trang Home, Admin Dashboard, Orders, Products, Users
- `src/layouts`: layout chính và layout admin
- `src/services`: gọi API tương thích backend `@skin_be`
- `src/utils`: helper format tiền tệ, thời gian
- `src/config`: cấu hình API và biến môi trường

## Kết nối backend

- Đảm bảo backend `@skin_be` chạy trên `localhost` và kết nối database `skin_db`
- Các endpoint được sử dụng:
  - `GET /skin_db/health`
  - `GET /skin_db/admin/dashboard/snapshot`
  - `GET /skin_db/admin/orders`
  - `GET /skin_db/admin/products`
  - `GET /skin_db/admin/users`

Điều chỉnh lại endpoint trong `src/services` nếu backend có route khác.*** End Patch
