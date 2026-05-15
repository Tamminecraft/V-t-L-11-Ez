document.addEventListener('DOMContentLoaded', function() {
  const leaderboardList = document.getElementById('leaderboard-list');
  const chatList = document.getElementById('chat-list');
  const historyList = document.getElementById('history-list');
  const leaderboardForm = document.getElementById('leaderboard-form');
  const chatForm = document.getElementById('chat-form');
  const historyForm = document.getElementById('history-form');

  if (!leaderboardList || !chatList || !historyList) {
    return;
  }

  async function fetchJson(path, options) {
    const response = await fetch(path, options);
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || 'Lỗi kết nối server');
    }
    return response.json();
  }

  function formatDate(iso) {
    const date = new Date(iso);
    return date.toLocaleString('vi-VN', { hour12: false });
  }

  function renderLeaderboard(items) {
    leaderboardList.innerHTML = items.length ? items.map((item, index) => `
      <li><strong>#${index + 1} ${item.user}</strong> — ${item.score} điểm<br><small>${formatDate(item.createdAt)}</small></li>
    `).join('') : '<li>Chưa có dữ liệu bảng xếp hạng.</li>';
  }

  function renderChat(items) {
    chatList.innerHTML = items.length ? items.map(item => `
      <li><strong>${item.user}</strong>: ${item.message}<br><small>${formatDate(item.createdAt)}</small></li>
    `).join('') : '<li>Chưa có tin nhắn nào.</li>';
  }

  function renderHistory(items) {
    historyList.innerHTML = items.length ? items.map(item => `
      <li><strong>${item.user}</strong>: ${item.contribution}<br><small>${formatDate(item.createdAt)}</small></li>
    `).join('') : '<li>Chưa có đóng góp nào.</li>';
  }

  async function refreshAll() {
    try {
      const [leaderboard, chat, history] = await Promise.all([
        fetchJson('/api/leaderboard'),
        fetchJson('/api/chat'),
        fetchJson('/api/history')
      ]);
      renderLeaderboard(leaderboard);
      renderChat(chat);
      renderHistory(history);
    } catch (error) {
      console.error(error);
    }
  }

  leaderboardForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    const user = document.getElementById('leaderboard-name').value.trim();
    const score = document.getElementById('leaderboard-score').value.trim();
    if (!user || score === '') return;
    try {
      await fetchJson('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, score: Number(score) })
      });
      leaderboardForm.reset();
      refreshAll();
    } catch (error) {
      alert(error.message);
    }
  });

  chatForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    const user = document.getElementById('chat-name').value.trim();
    const message = document.getElementById('chat-message').value.trim();
    if (!user || !message) return;
    try {
      await fetchJson('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, message })
      });
      chatForm.reset();
      refreshAll();
    } catch (error) {
      alert(error.message);
    }
  });

  historyForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    const user = document.getElementById('history-name').value.trim();
    const contribution = document.getElementById('history-contribution').value.trim();
    if (!user || !contribution) return;
    try {
      await fetchJson('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, contribution })
      });
      historyForm.reset();
      refreshAll();
    } catch (error) {
      alert(error.message);
    }
  });

  refreshAll();
  setInterval(refreshAll, 12000);
});
