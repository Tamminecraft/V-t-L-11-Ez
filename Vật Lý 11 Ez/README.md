# Vật Lý 11 Ez Backend

Backend server cho tính năng:
- Lưu lịch sử đóng góp
- Bảng xếp hạng người chơi đạt điểm cao
- Dữ liệu trò chuyện của học sinh

## Cài đặt

1. Mở terminal trong thư mục `Vật Lý 11 Ez`
2. Chạy `npm install`
3. Chạy `npm start`
4. Mở `http://localhost:3000`

## API

- `GET /api/leaderboard`
- `POST /api/leaderboard` với body `{ user, score }`
- `GET /api/chat`
- `POST /api/chat` với body `{ user, message }`
- `GET /api/history`
- `POST /api/history` với body `{ user, contribution }`
