import { useEffect, useMemo, useState } from 'react';
import { loadFlashcards } from '../data/content';
import type { Flashcard } from '../data/content';

export default function Flashcards() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFlashcards()
      .then(setFlashcards)
      .catch((error) => console.error('Không tải được flashcards:', error))
      .finally(() => setLoading(false));
  }, []);

  const card = flashcards[index];
  const progress = useMemo(
    () => `${index + 1}/${flashcards.length}`,
    [index, flashcards.length]
  );

  if (loading) {
    return (
      <main className="page-shell page-shell--centered">
        <p>Đang tải flashcard...</p>
      </main>
    );
  }

  if (!card) {
    return (
      <main className="page-shell page-shell--centered">
        <p>Không có flashcard để hiển thị.</p>
      </main>
    );
  }

  return (
    <main className="page-shell page-shell--centered">
      <section className="page-section flashcard-section">
        <header className="section-header">
          <p className="eyebrow">Flashcard</p>
          <h1>Ôn công thức nhanh</h1>
          <p>Nhấn để lật thẻ, duy trì tốc độ và ghi nhớ công thức quan trọng Vật lý 11.</p>
        </header>

        <div className="flashcard-board">
          <div className="flashcard" onClick={() => setFlipped(!flipped)}>
            <div className={flipped ? 'flashcard-face back' : 'flashcard-face front'}>
              {flipped ? card.back : card.front}
            </div>
          </div>

          <div className="flashcard-controls">
            <button
              type="button"
              onClick={() => {
                setIndex((prev) => Math.max(prev - 1, 0));
                setFlipped(false);
              }}
              disabled={index === 0}
            >
              Trước
            </button>
            <span>{progress}</span>
            <button
              type="button"
              onClick={() => {
                setIndex((prev) => Math.min(prev + 1, flashcards.length - 1));
                setFlipped(false);
              }}
              disabled={index === flashcards.length - 1}
            >
              Sau
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
