export type QuestionLevel = "easy" | "middle" | "intermediate" | "hard";

export type QuestionType = "analysis" | "details" | "events" | "characters";

export interface Question {
  id: number;
  level: QuestionLevel;
  questionType: QuestionType;
  question: string;
  answer: string;
  answerPoints: number;
  /** Специальный вопрос «Кот в мешке»: за правильный ответ +50 баллов. */
  isCatInBag?: boolean;
}

export interface Team {
  id: number;
  name: string;
  score: number;
}

export type GameStatus = "not_started" | "playing" | "finished";

export interface GameState {
  teams: Team[];
  questions: Question[];
  currentTeamIndex: number;
  selectedQuestionId: number | null;
  isAnswerVisible: boolean;
  usedQuestionIds: number[];
  gameStatus: GameStatus;
}
