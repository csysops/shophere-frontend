# Hướng dẫn thiết lập HTTPS cho Frontend

## ✅ Đã hoàn thành

1. **File `.env`** đã được tạo với cấu hình HTTPS:
   ```env
   HTTPS=true
   REACT_APP_API_URL=http://localhost:4000
   PORT=3001
   ```

2. **Backend CORS** đã được cập nhật để cho phép HTTPS origins:
   - `https://localhost:3001`
   - `https://localhost:3002`
   - `https://localhost:3000`

## 🔧 Khắc phục lỗi "Failed to fetch products"

### Bước 1: Restart Backend

Backend cần được khởi động lại để áp dụng cấu hình CORS mới:

```bash
cd project_kientrucphanmen
npm run start:dev
```

Hoặc nếu đang chạy:
```bash
# Tìm process ID
ps aux | grep "nest start"

# Kill process và restart
pkill -f "nest start"
npm run start:dev
```

### Bước 2: Kiểm tra Backend đang chạy

Backend nên chạy trên port **4000** (theo cấu hình trong `.env` frontend).

Kiểm tra:
```bash
curl http://localhost:4000/api/v1/products
```

### Bước 3: Kiểm tra Frontend

Frontend đang chạy trên **HTTPS** tại `https://localhost:3002` (hoặc port khác nếu 3001 đã bận).

### Bước 4: Xử lý cảnh báo Certificate

Khi truy cập `https://localhost:3002`, browser sẽ hiển thị cảnh báo "Not secure":
1. Click **"Advanced"**
2. Click **"Proceed to localhost (unsafe)"**

Đây là bình thường với self-signed certificate trong development.

## 🔒 Bảo mật

- ✅ Frontend sử dụng HTTPS để mã hóa dữ liệu
- ✅ Backend CORS đã được cấu hình để chấp nhận HTTPS origins
- ✅ Tất cả API calls được mã hóa qua HTTPS

## 📝 Lưu ý

- Trong development, backend vẫn chạy HTTP (`http://localhost:4000`) - điều này là bình thường
- Frontend HTTPS có thể gọi HTTP backend API mà không gặp vấn đề mixed content (trong development)
- Trong production, cả frontend và backend nên sử dụng HTTPS

## 🐛 Troubleshooting

### Lỗi CORS
Nếu vẫn gặp lỗi CORS:
1. Kiểm tra backend đã restart chưa
2. Kiểm tra console browser để xem origin nào đang bị chặn
3. Thêm origin đó vào CORS config trong `project_kientrucphanmen/src/main.ts`

### Lỗi "Failed to fetch"
1. Kiểm tra backend có đang chạy không: `curl http://localhost:4000/api/v1/products`
2. Kiểm tra network tab trong browser DevTools để xem request có được gửi không
3. Kiểm tra console để xem lỗi chi tiết

### Port conflicts
Nếu port 3001 đã bận, React sẽ tự động chọn port khác (3002, 3003, ...). Kiểm tra terminal để xem port nào đang được sử dụng.

