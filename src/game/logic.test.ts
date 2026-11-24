import { describe, expect, it } from "vitest";
import {
  buildBoard,
  createInitialState,
  getWinners,
  markAnswerCorrect,
  markAnswerIncorrect,
  rankTeams,
  renameTeam,
  resetGame,
  selectQuestion,
  showAnswer,
  startGame,
  validateQuestions,
} from "./logic";
import type { Question, Team } from "./types";

// Тестовые данные используются только в тестах, не в приложении.
const qs: Question[] = [
  { id: 1, level: "easy", questionType: "details", question: "В1", answer: "О1", answerPoints: 200 },
  { id: 2, level: "middle", questionType: "events", question: "В2", answer: "О2", answerPoints: 300, isCatInBag: true },
  { id: 3, level: "hard", questionType: "analysis", question: "В3", answer: "О3", answerPoints: 500 },
  { id: 4, level: "hard", questionType: "characters", question: "В4", answer: "О4", answerPoints: 500 },
];
const teams: Team[] = [
  { id: 1, name: "А", score: 0 },
  { id: 2, name: "Б", score: 0 },
  { id: 3, name: "В", score: 0 },
];

const playing = () => startGame(createInitialState(qs, teams));
const answer = (s: ReturnType<typeof playing>, id: number, correct: boolean) => {
  const opened = showAnswer(selectQuestion(s, id));
  return correct ? markAnswerCorrect(opened) : markAnswerIncorrect(opened);
};

describe("старт", () => {
  it("нельзя начать без вопросов", () => {
    expect(startGame(createInitialState([], teams)).gameStatus).toBe("not_started");
  });
  it("нельзя выбрать вопрос до начала игры", () => {
    expect(selectQuestion(createInitialState(qs, teams), 1).selectedQuestionId).toBeNull();
  });
  it("игра начинается с первой команды", () => {
    expect(playing().currentTeamIndex).toBe(0);
  });
});

describe("ход", () => {
  it("правильный ответ начисляет баллы и передаёт ход", () => {
    const s = answer(playing(), 1, true);
    expect(s.teams[0].score).toBe(200);
    expect(s.currentTeamIndex).toBe(1);
    expect(s.usedQuestionIds).toEqual([1]);
    expect(s.selectedQuestionId).toBeNull();
  });
  it("неправильный ответ не меняет счёт, но передаёт ход", () => {
    const s = answer(playing(), 1, false);
    expect(s.teams.map((t) => t.score)).toEqual([0, 0, 0]);
    expect(s.currentTeamIndex).toBe(1);
    expect(s.usedQuestionIds).toEqual([1]);
  });
  it("«Кот в мешке» даёт +50", () => {
    expect(answer(playing(), 2, true).teams[0].score).toBe(350);
  });
  it("нельзя оценить ответ до его показа", () => {
    const s = markAnswerCorrect(selectQuestion(playing(), 1));
    expect(s.teams[0].score).toBe(0);
    expect(s.selectedQuestionId).toBe(1);
  });
  it("нельзя начислить баллы дважды", () => {
    const once = markAnswerCorrect(showAnswer(selectQuestion(playing(), 1)));
    const twice = markAnswerCorrect(once);
    expect(twice).toBe(once);
    expect(twice.teams[0].score).toBe(200);
  });
  it("нельзя выбрать использованный вопрос", () => {
    const s = answer(playing(), 1, true);
    expect(selectQuestion(s, 1)).toBe(s);
  });
  it("нельзя выбрать другой вопрос, пока открыт текущий", () => {
    const s = selectQuestion(playing(), 1);
    expect(selectQuestion(s, 2).selectedQuestionId).toBe(1);
  });
  it("очередь циклическая 1 → 2 → 3 → 1", () => {
    let s = playing();
    s = answer(s, 1, false);
    s = answer(s, 2, false);
    s = answer(s, 3, false);
    expect(s.currentTeamIndex).toBe(0);
  });
});

describe("завершение", () => {
  it("игра заканчивается, когда использованы все вопросы", () => {
    let s = playing();
    for (const q of qs) s = answer(s, q.id, true);
    expect(s.gameStatus).toBe("finished");
    expect(selectQuestion(s, 1)).toBe(s);
  });
  it("«Новая игра» обнуляет всё, кроме названий", () => {
    let s = renameTeam(createInitialState(qs, teams), 1, "Знатоки");
    s = answer(startGame(s), 1, true);
    const r = resetGame(s);
    expect(r.gameStatus).toBe("not_started");
    expect(r.usedQuestionIds).toEqual([]);
    expect(r.currentTeamIndex).toBe(0);
    expect(r.teams.map((t) => t.score)).toEqual([0, 0, 0]);
    expect(r.teams[0].name).toBe("Знатоки");
  });
  it("ничья: делённые места и несколько победителей", () => {
    const t = [
      { id: 1, name: "А", score: 500 },
      { id: 2, name: "Б", score: 700 },
      { id: 3, name: "В", score: 700 },
    ];
    expect(rankTeams(t).map((x) => [x.id, x.place])).toEqual([[2, 1], [3, 1], [1, 3]]);
    expect(getWinners(t).map((x) => x.id)).toEqual([2, 3]);
  });
});

describe("поле и данные", () => {
  it("пустые ячейки недоступны, использованные — тоже", () => {
    let s = playing();
    const board = buildBoard(s);
    const easyDetails = board[0][1];
    expect(easyDetails.next?.id).toBe(1);
    expect(board[0][0].hasQuestions).toBe(false);
    s = answer(s, 1, true);
    expect(buildBoard(s)[0][1].next).toBeNull();
    expect(buildBoard(s)[0][1].hasQuestions).toBe(true);
  });
  it("проверка находит повторяющиеся id и ошибки полей", () => {
    const bad = [qs[0], { ...qs[1], id: 1, level: "super" as never, answer: "" }];
    expect(validateQuestions(bad).length).toBe(3);
    expect(validateQuestions(qs)).toEqual([]);
  });
});
