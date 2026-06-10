import SimulationCanvas from '../components/SimulationCanvas';

export default function Lab() {
  return (
    <main className="page-shell page-shell--wide">
      <section className="page-section">
        <header className="section-header">
          <p className="eyebrow">Phòng thí nghiệm</p>
          <h1>Thí nghiệm ảo và mô phỏng</h1>
          <p>Thực hành lý thuyết bằng mô phỏng con lắc, sóng, điện trường và mạch điện tương tác.</p>
        </header>

        <div className="lab-grid">
          <div className="lab-panel">
            <article className="panel panel--card">
              <h3>Thư viện linh kiện</h3>
              <ul>
                <li>Pin</li>
                <li>Điện trở</li>
                <li>Tụ điện</li>
                <li>Cuộn cảm</li>
                <li>Ampe kế và vôn kế</li>
              </ul>
            </article>

            <article className="panel panel--card">
              <h3>Bài thực hành</h3>
              <p>Quan sát ảnh hưởng của chiều dài dây lên chu kỳ con lắc và đo tần số khi thay đổi biên độ.</p>
            </article>

            <article className="panel panel--card">
              <h3>Hướng dẫn</h3>
              <p>Mỗi mô phỏng có giải thích định nghĩa, công thức và đường truyền tín hiệu để nhớ bài tốt hơn.</p>
            </article>
          </div>

          <div className="lab-preview">
            <SimulationCanvas />
          </div>
        </div>
      </section>
    </main>
  );
}
