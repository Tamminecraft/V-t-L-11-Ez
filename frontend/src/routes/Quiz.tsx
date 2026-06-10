import { useEffect, useState } from 'react';
import { saveQuizScore } from '../api';
import { loadQuizQuestions } from '../data/content';
import type { QuizQuestion } from '../data/content';

export default function Quiz() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuizQuestions()
      .then(setQuestions)
      .catch((error) => console.error('Không tải được câu hỏi quiz:', error))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setSelected(null);
    setFeedback('');
  }, [current]);

  if (loading) {
    return (
      <main className="page-shell page-shell--wide">
        <p>Đang tải quiz...</p>
      </main>
    );
  }

  const question = questions[current];
  if (!question) {
    return (
      <main className="page-shell page-shell--wide">
        <p>Không có câu hỏi quiz.</p>
      </main>
    );
  }

  const submitAnswer = async () => {
    if (selected === null) return;
    const correct = selected === question.ans;
    const nextScore = score + (correct ? 1 : 0);
    setScore(nextScore);
    setFeedback(correct ? 'Chính xác! 👍' : `Sai rồi. Đáp án đúng: ${question.opts[question.ans]}`);

    if (current === questions.length - 1) {
      setCompleted(true);
      await saveQuizScore({ quizId: 'vl11-quiz', score: nextScore, maxScore: questions.length });
    }
  };

  return (
    <main className="page-shell page-shell--wide">
      <section className="page-section">
        <header className="section-header">
          <p className="eyebrow">Quiz</p>
          <h1>Đố nhanh Vật Lý 11</h1>
          <p>Luyện đề theo chương với giải thích đáp án ngay sau khi làm.</p>
        </header>

        <div className="quiz-card">
          <div className="quiz-summary">
            <span>Câu {current + 1}/{questions.length}</span>
            <span>Điểm: {score}</span>
          </div>

          <h2>{question.q}</h2>

          <div className="quiz-options">
            {question.opts.map((option, index) => (
              <button
                key={option}
                type="button"
                className={selected === index ? 'quiz-option selected' : 'quiz-option'}
                onClick={() => setSelected(index)}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="quiz-actions">
            <button type="button" onClick={submitAnswer} disabled={selected === null || completed}>
              Kiểm tra
            </button>
            <button
              type="button"
              onClick={() => setCurrent((prev) => Math.min(prev + 1, questions.length - 1))}
              disabled={current === questions.length - 1}
            >
              Câu tiếp theo
            </button>
          </div>

          {feedback && <div className="quiz-feedback">{feedback}</div>}

          {completed && (
            <div className="quiz-result">
              <h3>Bạn hoàn thành bài quiz!</h3>
              <p>Điểm của bạn: {score}/{questions.length}</p>
              <button type="button" onClick={() => {
                setCurrent(0);
                setSelected(null);
                setScore(0);
                setFeedback('');
                setCompleted(false);
              }}>
                Làm lại
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
