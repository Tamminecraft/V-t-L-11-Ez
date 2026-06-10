import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { loadChapters, loadFeatureCards, loadSimulations } from '../data/content';
import type { Chapter, FeatureCard, Simulation } from '../data/content';

export default function Home() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [featureCards, setFeatureCards] = useState<FeatureCard[]>([]);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadFeatureCards(), loadChapters(), loadSimulations()])
      .then(([features, chaptersData, simulationsData]) => {
        setFeatureCards(features);
        setChapters(chaptersData);
        setSimulations(simulationsData);
      })
      .catch((error) => {
        console.error('Không tải được nội dung Home:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main className="page-shell">
        <p>Đang tải nội dung...</p>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="hero-section">
        <div className="hero-card">
          <div>
            <p className="eyebrow">Vật Lý 11 Ez</p>
            <h1>Thử thách học Vật Lý, giải bài, và ôn công thức ngay hôm nay.</h1>
            <p className="hero-subtitle">
              Nền tảng tương tác cho học sinh lớp 11: bài giảng, quiz, trò chơi, flashcard và phòng thí nghiệm ảo.
            </p>
          </div>

          <div className="hero-actions">
            <Link className="button button--primary" to="/lessons">
              Bắt đầu học
            </Link>
            <Link className="button button--secondary" to="/quiz">
              Luyện quiz ngay
            </Link>
          </div>
        </div>
      </section>

      <section className="page-section">
        <header className="section-header">
          <p className="eyebrow">Tính năng</p>
          <h2>Hệ thống học toàn diện cho Vật lý 11</h2>
          <p>Ôn tập nhanh, kiểm tra năng lực và trải nghiệm học với mô phỏng trực quan.</p>
        </header>

        <div className="feature-grid">
          {featureCards.map((feature) => (
            <article key={feature.title} className="panel panel--card" style={{ borderColor: feature.color }}>
              <div className="panel-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <Link className="button button--inline" to={feature.route}>
                Xem thêm
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="page-section">
        <header className="section-header">
          <p className="eyebrow">Chuyên đề</p>
          <h2>Học theo chương và theo trọng tâm đề thi</h2>
        </header>

        <div className="grid grid--4">
          {chapters.map((chapter) => (
            <article key={chapter.id} className="panel panel--card">
              <div>
                <h3>{chapter.name}</h3>
                <p>{chapter.description}</p>
                <small>{chapter.articles} mục học</small>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="page-section page-section--light">
        <header className="section-header">
          <p className="eyebrow">Mô phỏng</p>
          <h2>Khám phá lý thuyết bằng hình ảnh</h2>
          <p>Xem trước các bài toán và hiện tượng Dao động, Sóng, Điện trường, Mạch điện.</p>
        </header>

        <div className="grid grid--3">
          {simulations.slice(0, 3).map((item) => (
            <article key={item.id} className="panel panel--card">
              <div className="panel-badge">{item.badge}</div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>

        <div className="quick-links">
          <Link to="/lab">Mở phòng thí nghiệm</Link>
          <Link to="/games">Thử trò chơi</Link>
        </div>
      </section>
    </main>
  );
}
