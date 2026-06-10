import { NavLink, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
  { to: '/', label: 'Trang chủ' },
  { to: '/lessons', label: 'Bài giảng' },
  { to: '/lab', label: 'Phòng thí nghiệm' },
  { to: '/games', label: 'Trò chơi' },
  { to: '/quiz', label: 'Quiz' },
  { to: '/flashcards', label: 'Flashcards' },
  { to: '/ai', label: 'AI' },
  { to: '/teacher', label: 'Giáo viên' },
];

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export default function Layout() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('vl-theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('vl-theme', theme);
  }, [theme]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div className="brand-badge">VL11</div>
          <div>
            <strong>Vật Lý 11 Ez</strong>
            <p>Học tương tác, quiz, AI, flashcard và lộ trình cá nhân.</p>
          </div>
        </div>

        <div className="header-actions">
          <button className="theme-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? 'Light' : 'Dark'} mode
          </button>
        </div>
      </header>

      <nav className="app-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              classNames('nav-link', isActive && 'nav-link-active')
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <main className="app-main">
        <Outlet />
      </main>

      <footer className="app-footer">
        <span>Vật Lý 11 Ez • MVP cá nhân hóa cho học sinh và giáo viên.</span>
        <span>Đã tối ưu cho PWA, offline và API backend.</span>
      </footer>
    </div>
  );
}
