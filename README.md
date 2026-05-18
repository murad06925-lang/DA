# CineBooking - Ứng dụng đặt vé xem phim hiện đại

CineBooking là ứng dụng web full-stack được xây dựng bằng React (Vite) và Express, tích hợp AI gợi ý phim.

## 🚀 Hướng dẫn cài đặt và chạy (A-Z)

Sau khi bạn tải mã nguồn về máy tính, hãy làm theo các bước sau:

### 1. Yêu cầu hệ thống
- Đã cài đặt **Node.js** (Phiên bản 18 trở lên).
- Một trình soạn thảo mã nguồn như **VS Code**.

### 2. Cài đặt Dependencies
Mở terminal (hoặc Command Prompt) tại thư mục gốc của dự án và chạy:
```bash
npm install
```

### 3. Cấu hình biến môi trường (.env)
Tạo một file tên là `.env` ở thư mục gốc (nếu chưa có) và thêm các thông tin sau:
```env
GEMINI_API_KEY="KEY_CỦA_BẠN_TẠI_AI_STUDIO"
PORT=3000
NODE_ENV=development
```
*Lưu ý: Bạn có thể lấy GEMINI_API_KEY miễn phí tại [Google AI Studio](https://aistudio.google.com/app/apikey).*

### 4. Chạy ứng dụng ở chế độ phát triển (Development)
Chạy lệnh sau:
```bash
npm run dev
```
Sau đó mở trình duyệt và truy cập: `http://localhost:3000`

---

## 🛠 Giải đáp thắc mắc

### 1. "Mỗi lần chạy mỗi lần lấy key à?"
**Trả lời:** Không cần. 
- Khi chạy trên **AI Studio**, key được quản lý tự động trong phần "Secrets".
- Khi chạy trên **máy cá nhân**, bạn chỉ cần lấy key 1 lần và dán vào file `.env` như hướng dẫn ở trên. Hệ thống sẽ tự dùng key đó mỗi khi bạn khởi động web.

### 2. Các chức năng chính đã hoàn thiện:
- **Giao diện:** Modern Dark Mode, tối ưu cho cả điện thoại và máy tính.
- **Đặt vé:** Quy trình chọn phim -> chọn lịch -> chọn ghế -> xác nhận.
- **Auth:** Đã có hệ thống Đăng ký / Đăng nhập thật (lưu session).
- **AI Cine:** Chatbot tư vấn phim thông minh sử dụng Gemini API.
- **Gợi ý:** Tính năng nhận 3 phim gợi ý theo tâm trạng từ AI.

---

## 🏗 Cấu trúc dự án
- `/src`: Chứa mã nguồn Frontend (React).
- `server.ts`: Chứa mã nguồn Backend (Express API & Gemini integration).
- `vite.config.ts`: Cấu hình build và server.
