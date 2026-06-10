import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { loadGameCards } from '../data/content';
import type { GameCard } from '../data/content';

export default function Games() {
  const [gameCards, setGameCards] = useState<GameCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGameCards()
      .then(setGameCards)
      .catch((error) => console.error('Không tải được dữ liệu trò chơi:', error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="page-shell page-shell--wide">
        <p>Đang tải trò chơi...</p>
      </main>
    );
  }

  return (
    <main className="page-shell page-shell--wide">
      <section>
        <header className="page-header">
          <p className="eyebrow">Trò Chơi</p>
          <h1>Học Vật Lý qua trò chơi</h1>
          <p>Thử thách tư duy với các mini-game quiz, ghép đôi công thức và câu hỏi hằng ngày.</p>
        </header>

        <div className="grid grid--3">
          {gameCards.map((game) => (
            <article key={game.id} className="panel panel--card">
              <div className="panel-icon">{game.icon}</div>
              <div>
                <h3>{game.title}</h3>
                <p>{game.description}</p>
              </div>
              <div className="tag">{game.tag}</div>
              {game.route ? (
                <Link className="button button--secondary" to={game.route}>
                  Bắt đầu
                </Link>
              ) : (
                <button className="button button--secondary" disabled>
                  Sắp có
                </button>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
