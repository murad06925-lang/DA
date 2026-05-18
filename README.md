# CineBooking App 🎬

Hệ thống đặt vé xem phim trực tuyến hiện đại được xây dựng bằng React, Vite, Express và Tailwind CSS.

## 🚀 Hướng dẫn Triển khai lên Vercel

Để chạy được website này trên internet, bạn hãy làm theo các bước sau:

### 1. Đưa code lên GitHub
- Nhấn vào menu **Settings** (biểu tượng bánh răng) ở góc trên bên phải AI Studio.
- Chọn **Export to GitHub**.
- Kết nối tài khoản GitHub của bạn và tạo một Repository mới.

### 2. Kết nối với Vercel
- Truy cập [vercel.com](https://vercel.com) và đăng nhập.
- Nhấn **Add New** -> **Project**.
- Tìm và chọn Repository bạn vừa tạo trên GitHub -> **Import**.

### 3. Cấu hình biến môi trường (Cực kỳ quan trọng)
Trong phần **Environment Variables** trên Vercel, bạn hãy thêm các biến sau:
- `NODE_ENV`: `production`
- `GEMINI_API_KEY`: (Lấy từ Google AI Studio nếu bạn có dùng tính năng AI)
- `PORT`: `3000`

### 4. Deploy
- Nhấn **Deploy**. Vercel sẽ tự động cài đặt và cấp cho bạn một đường link (ví dụ: `your-app.vercel.app`).

## 🛠 Công nghệ sử dụng
- **Frontend**: React 18, Vite, Framer Motion (Hiệu ứng), Tailwind CSS.
- **Backend**: Node.js, Express.
- **Icon**: Lucide React.
- **Fonts**: Inter, Playfair Display.

---
© 2024 CINEBOOKING VIETNAM.
