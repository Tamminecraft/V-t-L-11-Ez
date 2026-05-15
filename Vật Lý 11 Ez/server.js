const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');
const PORT = process.env.PORT || 3000;

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let db = { contributions: [], leaderboard: [], chat: [] };

function loadDb() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf8');
      db = JSON.parse(raw);
      if (!db.contributions) db.contributions = [];
      if (!db.leaderboard) db.leaderboard = [];
      if (!db.chat) db.chat = [];
    } else {
      saveDb();
    }
  } catch (error) {
    console.error('Không thể đọc database:', error);
    saveDb();
  }
}

function saveDb() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('Không thể lưu database:', error);
  }
}

function sanitizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

loadDb();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get('/api/leaderboard', (req, res) => {
  const sorted = [...db.leaderboard].sort((a, b) => b.score - a.score);
  res.json(sorted.slice(0, 50));
});

app.post('/api/leaderboard', (req, res) => {
  const user = sanitizeString(req.body.user);
  const score = Number(req.body.score);
  if (!user || Number.isNaN(score) || score < 0) {
    return res.status(400).json({ error: 'Dữ liệu điểm không hợp lệ.' });
  }

  const entry = {
    id: Date.now() + '-' + Math.random().toString(36).slice(2),
    user,
    score,
    createdAt: new Date().toISOString()
  };

  db.leaderboard.push(entry);
  db.leaderboard.sort((a, b) => b.score - a.score);
  db.leaderboard = db.leaderboard.slice(0, 100);
  saveDb();

  res.json({ success: true, entry });
});

app.get('/api/chat', (req, res) => {
  res.json(db.chat.slice(-100));
});

app.post('/api/chat', (req, res) => {
  const user = sanitizeString(req.body.user);
  const message = sanitizeString(req.body.message);
  if (!user || !message) {
    return res.status(400).json({ error: 'Tên và tin nhắn là bắt buộc.' });
  }

  const entry = {
    id: Date.now() + '-' + Math.random().toString(36).slice(2),
    user,
    message,
    createdAt: new Date().toISOString()
  };

  db.chat.push(entry);
  db.chat = db.chat.slice(-500);
  saveDb();

  res.json({ success: true, entry });
});

app.get('/api/history', (req, res) => {
  res.json(db.contributions.slice(-100));
});

app.post('/api/history', (req, res) => {
  const user = sanitizeString(req.body.user);
  const contribution = sanitizeString(req.body.contribution);
  if (!user || !contribution) {
    return res.status(400).json({ error: 'Tên và nội dung đóng góp là bắt buộc.' });
  }

  const entry = {
    id: Date.now() + '-' + Math.random().toString(36).slice(2),
    user,
    contribution,
    createdAt: new Date().toISOString()
  };

  db.contributions.push(entry);
  db.contributions = db.contributions.slice(-500);
  saveDb();

  res.json({ success: true, entry });
});

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'Vật Lý 11.html'));
});

app.listen(PORT, () => {
  console.log(`Server chạy http://localhost:${PORT}`);
});
