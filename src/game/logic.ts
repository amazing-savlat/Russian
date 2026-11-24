/**
 * Игровая логика викторины. Чистые функции без React:
 * каждая принимает состояние и возвращает новое. Если действие
 * недопустимо, возвращается то же самое состояние (без изменений).
 */
import { CAT_IN_BAG_BONUS, CATEGORIES, LEVELS } from "../data/config";
import type { GameState, Question, QuestionLevel, QuestionType, Team } from "./types";

// ───────────────────────── Создание и сброс ─────────────────────────

export function createInitialState(questions: Question[], teams: Team[]): GameState {
  return {
    teams: teams.map((t) => ({ ...t, score: 0 })),
    questions,
    currentTeamIndex: 0,
    selectedQuestionId: null,
    isAnswerVisible: false,
    usedQuestionIds: [],
    gameStatus: "not_started",
  };
}

/** «Новая игра»: обнуляет счёт и вопросы, сохраняет названия команд. */
export function resetGame(state: GameState): GameState {
  return createInitialState(state.questions, state.teams);
}

export function renameTeam(state: GameState, teamId: number, name: string): GameState {
  if (state.gameStatus !== "not_started") return state;
  return {
    ...state,
    teams: state.teams.map((t) => (t.id === teamId ? { ...t, name } : t)),
  };
}

// ───────────────────────── Ход игры ─────────────────────────

export function startGame(state: GameState): GameState {
  if (state.gameStatus !== "not_started") return state;
  if (state.questions.length === 0 || state.teams.length === 0) return state;
  return {
    ...state,
    teams: state.teams.map((t) => ({ ...t, name: t.name.trim() || `Команда ${t.id}` })),
    gameStatus: "playing",
  };
}

export function selectQuestion(state: GameState, questionId: number): GameState {
  if (state.gameStatus !== "playing") return state;
  // Пока открыт вопрос, другой выбрать нельзя.
  if (state.selectedQuestionId !== null) return state;
  if (state.usedQuestionIds.includes(questionId)) return state;
  if (!state.questions.some((q) => q.id === questionId)) return state;
  return { ...state, selectedQuestionId: questionId, isAnswerVisible: false };
}

export function showAnswer(state: GameState): GameState {
  if (state.gameStatus !== "playing" || state.selectedQuestionId === null) return state;
  if (state.isAnswerVisible) return state;
  return { ...state, isAnswerVisible: true };
}

export function markAnswerCorrect(state: GameState): GameState {
  return resolveQuestion(state, true);
}

export function markAnswerIncorrect(state: GameState): GameState {
  return resolveQuestion(state, false);
}

export function nextTeam(state: GameState): GameState {
  if (state.teams.length === 0) return state;
  return { ...state, currentTeamIndex: (state.currentTeamIndex + 1) % state.teams.length };
}

export function finishGame(state: GameState): GameState {
  if (state.gameStatus !== "playing") return state;
  return { ...state, gameStatus: "finished", selectedQuestionId: null, isAnswerVisible: false };
}

/**
 * Фиксирует результат открытого вопроса. Защита от повторного начисления:
 * результат можно зафиксировать только для открытого, ещё не использованного
 * вопроса и только после показа ответа. После этого вопрос закрывается.
 */
function resolveQuestion(state: GameState, isCorrect: boolean): GameState {
  if (state.gameStatus !== "playing") return state;
  const question = getSelectedQuestion(state);
  if (!question) return state;
  if (!state.isAnswerVisible) return state;
  if (state.usedQuestionIds.includes(question.id)) return state;

  const reward = isCorrect ? questionReward(question) : 0;
  const currentTeam = state.teams[state.currentTeamIndex];

  let next: GameState = {
    ...state,
    teams: state.teams.map((t) =>
      t.id === currentTeam.id ? { ...t, score: t.score + reward } : t,
    ),
    usedQuestionIds: [...state.usedQuestionIds, question.id],
    selectedQuestionId: null,
    isAnswerVisible: false,
  };
  next = nextTeam(next);

  if (allQuestionsUsed(next)) next = finishGame(next);
  return next;
}

// ───────────────────────── Вспомогательные функции ─────────────────────────

export function questionReward(question: Question): number {
  return question.answerPoints + (question.isCatInBag ? CAT_IN_BAG_BONUS : 0);
}

export function getSelectedQuestion(state: GameState): Question | null {
  if (state.selectedQuestionId === null) return null;
  return state.questions.find((q) => q.id === state.selectedQuestionId) ?? null;
}

export function getCurrentTeam(state: GameState): Team {
  return state.teams[state.currentTeamIndex];
}

export function allQuestionsUsed(state: GameState): boolean {
  return state.questions.every((q) => state.usedQuestionIds.includes(q.id));
}

// ───────────────────────── Игровое поле ─────────────────────────

export interface BoardCell {
  questionType: QuestionType;
  level: QuestionLevel;
  /** Вопрос, который откроется при нажатии (null — ячейка недоступна). */
  next: Question | null;
  /** Есть ли в ячейке вопросы вообще (для отличия «пусто» от «использовано»). */
  hasQuestions: boolean;
  /** Сколько вопросов в ячейке ещё осталось. */
  remaining: number;
}

/** Строки — уровни, столбцы — категории. */
export function buildBoard(state: GameState): BoardCell[][] {
  return LEVELS.map(({ level }) =>
    CATEGORIES.map(({ type }) => {
      const inCell = state.questions.filter(
        (q) => q.level === level && q.questionType === type,
      );
      const unused = inCell.filter((q) => !state.usedQuestionIds.includes(q.id));
      return {
        questionType: type,
        level,
        next: unused[0] ?? null,
        hasQuestions: inCell.length > 0,
        remaining: unused.length,
      };
    }),
  );
}

// ───────────────────────── Результаты ─────────────────────────

export interface RankedTeam extends Team {
  /** Место: команды с одинаковым счётом делят место (1, 1, 3). */
  place: number;
}

export function rankTeams(teams: Team[]): RankedTeam[] {
  const sorted = [...teams].sort((a, b) => b.score - a.score || a.id - b.id);
  return sorted.map((t) => ({
    ...t,
    place: sorted.findIndex((o) => o.score === t.score) + 1,
  }));
}

export function getWinners(teams: Team[]): Team[] {
  if (teams.length === 0) return [];
  const max = Math.max(...teams.map((t) => t.score));
  return teams.filter((t) => t.score === max);
}

// ───────────────────────── Проверка данных ─────────────────────────

const VALID_LEVELS = new Set<string>(LEVELS.map((l) => l.level));
const VALID_TYPES = new Set<string>(CATEGORIES.map((c) => c.type));

/** Возвращает список понятных учителю ошибок в массиве вопросов. */
export function validateQuestions(questions: Question[]): string[] {
  const errors: string[] = [];
  const seen = new Set<number>();
  questions.forEach((q, i) => {
    const where = `Вопрос №${i + 1} (id: ${String(q.id)})`;
    if (typeof q.id !== "number" || Number.isNaN(q.id)) errors.push(`${where}: поле id должно быть числом.`);
    else if (seen.has(q.id)) errors.push(`${where}: id повторяется.`);
    seen.add(q.id);
    if (!VALID_LEVELS.has(q.level)) errors.push(`${where}: неизвестный уровень «${q.level}».`);
    if (!VALID_TYPES.has(q.questionType))
      errors.push(`${where}: неизвестная категория «${q.questionType}».`);
    if (!q.question?.trim()) errors.push(`${where}: пустой текст вопроса.`);
    if (!q.answer?.trim()) errors.push(`${where}: пустой ответ.`);
    if (typeof q.answerPoints !== "number" || !(q.answerPoints > 0))
      errors.push(`${where}: стоимость (answerPoints) должна быть положительным числом.`);
  });
  return errors;
}
