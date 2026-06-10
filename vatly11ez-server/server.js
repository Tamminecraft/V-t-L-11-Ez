// ============================================================
//  Vật Lý 11 Ez — Server lưu lịch sử (đóng góp + chat)
//  Chạy: npm install   →   npm start
//  Mặc định lắng nghe http://localhost:8787
// ============================================================
const express = require('express');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');
const bcrypt  = require('bcrypt');

const PORT     = process.env.PORT || 8787;
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// --- Lưu trữ dạng JSON đơn giản, không cần database ---
function file(name)        { return path.join(DATA_DIR, name + '.json'); }
function readAll(name)     {
  try { return JSON.parse(fs.readFileSync(file(name), 'utf8')); }
  catch { return []; }
}
function writeAll(name, a) {
  fs.writeFileSync(file(name), JSON.stringify(a, null, 2), 'utf8');
}
function append(name, item) {
  const arr = readAll(name);
  // chống trùng theo id
  const idx = item && item.id ? arr.findIndex(x => x.id === item.id) : -1;
  const stamped = { ...item, _savedAt: new Date().toISOString() };
  if (idx >= 0) arr[idx] = stamped; else arr.unshift(stamped);
  // giới hạn 5000 bản ghi mỗi loại
  writeAll(name, arr.slice(0, 5000));
  return stamped;
}

const app = express();
app.use(cors());                          // cho phép HTML mở từ máy gọi vào
app.use(express.json({ limit: '5mb' }));  // chấp nhận chat dài / ảnh base64 nhỏ

// ---- User Authentication ----
app.post('/api/users/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  const users = readAll('users');
  if (users.find(u => u.username === username)) return res.status(409).json({ error: 'Username already exists' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: Date.now().toString(), username, passwordHash, registeredAt: new Date().toISOString() };
  append('users', user);
  res.json({ ok: true, user: { id: user.id, username: user.username } });
});

app.post('/api/users/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  const users = readAll('users');
  const user = users.find(u => u.username === username);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: 'Invalid credentials' });
  // Update last login
  user.lastLogin = new Date().toISOString();
  append('users', user);
  res.json({ ok: true, user: { id: user.id, username: user.username } });
});

app.get('/api/users/online', (req, res) => {
  const users = readAll('users');
  const now = Date.now();
  const onlineThreshold = 24 * 60 * 60 * 1000; // 24 hours
  const online = users.filter(u => u.lastLogin && (now - new Date(u.lastLogin).getTime()) < onlineThreshold).map(u => ({ username: u.username, lastLogin: u.lastLogin }));
  res.json(online);
});

// Server status
app.get('/status', (_req, res) => {
  const counts = {
    reviews: readAll('reviews').length,
    qa:      readAll('qa').length,
    aiChat:  readAll('ai-chat').length,
  };
  res.json({ ok: true, counts, message: 'Vật Lý 11 Ez backend đang hoạt động' });
});

// ---- API ----
function makeRoutes(name, route) {
  app.get('/api/' + route, (_req, res) => res.json(readAll(name)));
  app.post('/api/' + route, (req, res) => {
    const saved = append(name, req.body || {});
    res.json({ ok: true, item: saved });
  });
  app.delete('/api/' + route, (_req, res) => { writeAll(name, []); res.json({ ok: true }); });
}
makeRoutes('reviews', 'reviews');   // POST/GET /api/reviews   (đóng góp)
makeRoutes('qa',      'qa');        // POST/GET /api/qa        (phòng chat học sinh)
makeRoutes('ai-chat', 'ai-chat');   // POST/GET /api/ai-chat   (lịch sử hỏi bài AI)
makeRoutes('users',   'users');     // POST/GET /api/users     (tài khoản người dùng)
makeRoutes('progress', 'progress');
makeRoutes('quiz-scores', 'quiz-scores');
makeRoutes('flashcards', 'flashcards');

// Serve the React frontend when it's built.
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/status')) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log('🚀 Vật Lý 11 Ez server đang lắng nghe http://localhost:' + PORT);
  console.log('   Dữ liệu được lưu trong thư mục:', DATA_DIR);
});
