# Vật Lý 11 Ez — Server lưu lịch sử

Server Node.js nhỏ gọn để lưu **đóng góp / đánh giá** của học sinh, **lịch sử trò chuyện hỏi bài** (phòng chat + AI), và **tài khoản người dùng** với xác thực.

## 1. Cài đặt (làm 1 lần)

1. Cài **Node.js 18+** (https://nodejs.org) nếu chưa có.
2. Mở thư mục `vatly11ez-server` này trong **VS Code**.
3. Mở Terminal trong VS Code (`Ctrl + ~`) và chạy:
   ```bash
   npm install
   ```

## 2. Chạy server

```bash
npm start
```

Bạn sẽ thấy: `🚀 Vật Lý 11 Ez server đang lắng nghe http://localhost:8787`

Mở trình duyệt vào địa chỉ đó để xem số lượng dữ liệu đã lưu.

## 3. Kết nối với file HTML

File `Vat_Ly_11_Ez_V55 (1).html` đã có sẵn đoạn đồng bộ. Mặc định nó trỏ tới `http://localhost:8787`. 
Nếu bạn đổi port hoặc deploy lên domain khác, mở HTML và sửa dòng:

```js
window.VL_SERVER_URL = window.VL_SERVER_URL || 'http://localhost:8787';
```

## 4. Dữ liệu được lưu ở đâu?

Trong thư mục `data/` (tự tạo) gồm 4 file JSON:

| File | Nội dung |
|------|----------|
| `reviews.json` | Mọi đóng góp / đánh giá của học sinh |
| `qa.json`      | Tin nhắn phòng chat hỏi đáp |
| `ai-chat.json` | Cuộc trò chuyện hỏi bài với AI |
| `users.json`   | Tài khoản người dùng đã đăng ký |

Bạn có thể mở trực tiếp các file JSON này trong VS Code để xem.

## 5. Các API có sẵn

### Dữ liệu
- `GET  /api/reviews` · `POST /api/reviews` · `DELETE /api/reviews`
- `GET  /api/qa`      · `POST /api/qa`      · `DELETE /api/qa`
- `GET  /api/ai-chat` · `POST /api/ai-chat` · `DELETE /api/ai-chat`

### Người dùng
- `POST /api/users/register` — Đăng ký tài khoản mới (username, password)
- `POST /api/users/login` — Đăng nhập (username, password)
- `GET  /api/users/online` — Danh sách người dùng đang online (đã đăng nhập trong 24h)

## 6. Lưu ý

- Trang HTML vẫn lưu **cục bộ trong trình duyệt** (localStorage) như cũ. Server chỉ là **bản sao lưu trung tâm** để bạn xem được dữ liệu của tất cả học sinh ở một nơi.
- Nếu server tắt, trang web vẫn chạy bình thường — không lỗi.
