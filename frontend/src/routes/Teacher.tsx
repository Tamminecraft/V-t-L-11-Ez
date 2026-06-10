export default function Teacher() {
  return (
    <section className="page-section">
      <header className="section-header">
        <h1>Dashboard giáo viên</h1>
        <p>Tạo lớp, giao bài, theo dõi tiến độ học sinh và xem báo cáo điểm.</p>
      </header>

      <div className="teacher-grid">
        <article>
          <h2>Lớp học</h2>
          <p>Danh sách học sinh, điểm số và streak học tập.</p>
        </article>
        <article>
          <h2>Báo cáo</h2>
          <p>Gợi ý chương cần ôn lại sau mỗi bài kiểm tra và điểm yếu cá nhân.</p>
        </article>
        <article>
          <h2>Đề thi tự động</h2>
          <p>Sinh đề theo ma trận đề thi và lưu lại lịch sử.</p>
        </article>
      </div>
    </section>
  );
}
