export type Chapter = {
  id: string;
  name: string;
  description: string;
  articles: number;
  image?: string;
};

export type FeatureCard = {
  title: string;
  description: string;
  color: string;
  route: string;
  icon: string;
};

export type Simulation = {
  id: string;
  title: string;
  description: string;
  badge: string;
};

export type GameCard = {
  id: string;
  title: string;
  description: string;
  tag: string;
  icon: string;
  route?: string;
};

export type QuizQuestion = {
  q: string;
  opts: string[];
  ans: number;
  ex: string;
};

export type Flashcard = {
  front: string;
  back: string;
};

const loadJson = async <T>(fileName: string): Promise<T> => {
  const response = await fetch(`${import.meta.env.BASE_URL}data/${fileName}`);
  if (!response.ok) {
    throw new Error(`Không thể tải dữ liệu ${fileName}: ${response.status}`);
  }
  return response.json();
};

export const loadChapters = () => loadJson<Chapter[]>('chapters.json');
export const loadFeatureCards = () => loadJson<FeatureCard[]>('featureCards.json');
export const loadSimulations = () => loadJson<Simulation[]>('simulations.json');
export const loadGameCards = () => loadJson<GameCard[]>('gameCards.json');
export const loadQuizQuestions = () => loadJson<QuizQuestion[]>('quizQuestions.json');
export const loadFlashcards = () => loadJson<Flashcard[]>('flashcards.json');
