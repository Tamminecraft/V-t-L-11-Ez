import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from './components/Layout';

const Home = lazy(() => import('./routes/Home'));
const Lessons = lazy(() => import('./routes/Lessons'));
const Lab = lazy(() => import('./routes/Lab'));
const Quiz = lazy(() => import('./routes/Quiz'));
const Flashcards = lazy(() => import('./routes/Flashcards'));
const AI = lazy(() => import('./routes/AI'));
const Games = lazy(() => import('./routes/Games'));
const Teacher = lazy(() => import('./routes/Teacher'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="app-loading">Đang tải trang...</div>}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="lessons" element={<Lessons />} />
            <Route path="lab" element={<Lab />} />
            <Route path="quiz" element={<Quiz />} />
            <Route path="games" element={<Games />} />
            <Route path="flashcards" element={<Flashcards />} />
            <Route path="ai" element={<AI />} />
            <Route path="teacher" element={<Teacher />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
