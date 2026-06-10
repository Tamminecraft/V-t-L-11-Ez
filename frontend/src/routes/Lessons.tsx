import { useEffect, useState } from 'react';
import { loadChapters } from '../data/content';
import type { Chapter } from '../data/content';

export default function Lessons() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChapters()
      .then(setChapters)
      .catch((error) => console.error('Không tải được dữ liệu bài giảng:', error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="page-shell page-shell--wide">
        <p>Đang tải bài giảng...</p>
      </main>
    );
  }

  return (
    <main className="page-shell page-shell--wide">
      <section className="page-section">
        <header className="section-header">
          <p className="eyebrow">Bài giảng</p>
          <h1>Kho bài học Vật lý 11</h1>
          <p>Học theo lộ trình, với nội dung tóm tắt, ví dụ minh họa và công thức quan trọng cho từng chương.</p>
        </header>

        <div className="grid grid--4">
          {chapters.map((chapter, index) => (
            <article key={chapter.id} className="panel panel--card">
              <h3>{chapter.name}</h3>
              <p>{chapter.description}</p>
              <div className="lesson-card-footer">
                <span>{chapter.articles} mục học</span>
                <span>Chương {index + 1}</span>
              </div>
            </article>
          ))}
        </div>

        <section className="feature-grid">
          <article>
            <h2>Bài giảng dạng text</h2>
            <p>Nội dung trình bày rõ ràng, có ví dụ, công thức và định nghĩa giúp dễ hiểu.</p>
          </article>
          <article>
            <h2>Bài tập mẫu</h2>
            <p>Mỗi chương kèm bài tập mẫu, lời giải chi tiết và lưu kết quả ôn tập.</p>
          </article>
          <article>
            <h2>Hướng dẫn làm bài</h2>
            <p>Giải thích từng bước, phân tích kiến thức trọng tâm và mẹo giải nhanh.</p>
          </article>
        </section>
      </section>
    </main>
  );
}
