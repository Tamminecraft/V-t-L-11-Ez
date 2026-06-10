import { useState } from 'react';

export default function AI() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('Hãy nhập đề bài hoặc câu hỏi lý thuyết.');

  const handleAsk = () => {
    setAnswer(`AI đang suy nghĩ về: "${question}". (Phiên bản demo này chưa kết nối OpenAI / Lovable AI Gateway.)`);
  };

  return (
    <section className="page-section">
      <header className="section-header">
        <h1>Gia sư AI</h1>
        <p>Hỏi đáp lý thuyết, giải bài từng bước và ảnh OCR đề bài.</p>
      </header>

      <div className="ai-card">
        <textarea
          placeholder="Nhập câu hỏi hoặc đề bài Vật Lý 11..."
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
        />
        <button type="button" onClick={handleAsk} disabled={!question.trim()}>
          Gửi câu hỏi
        </button>
      </div>

      <div className="ai-response">
        <h2>Kết quả mẫu</h2>
        <p>{answer}</p>
      </div>
    </section>
  );
}
