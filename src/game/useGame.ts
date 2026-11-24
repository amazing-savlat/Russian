import { useReducer } from "react";
import * as logic from "./logic";
import type { GameState, Question, Team } from "./types";

type Action =
  | { type: "start" }
  | { type: "select"; questionId: number }
  | { type: "showAnswer" }
  | { type: "correct" }
  | { type: "incorrect" }
  | { type: "rename"; teamId: number; name: string }
  | { type: "reset" };

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "start":
      return logic.startGame(state);
    case "select":
      return logic.selectQuestion(state, action.questionId);
    case "showAnswer":
      return logic.showAnswer(state);
    case "correct":
      return logic.markAnswerCorrect(state);
    case "incorrect":
      return logic.markAnswerIncorrect(state);
    case "rename":
      return logic.renameTeam(state, action.teamId, action.name);
    case "reset":
      return logic.resetGame(state);
  }
}

/** Связка чистой игровой логики с React. */
export function useGame(questions: Question[], teams: Team[]) {
  const [state, dispatch] = useReducer(reducer, undefined, () =>
    logic.createInitialState(questions, teams),
  );
  return {
    state,
    startGame: () => dispatch({ type: "start" }),
    selectQuestion: (questionId: number) => dispatch({ type: "select", questionId }),
    showAnswer: () => dispatch({ type: "showAnswer" }),
    markAnswerCorrect: () => dispatch({ type: "correct" }),
    markAnswerIncorrect: () => dispatch({ type: "incorrect" }),
    renameTeam: (teamId: number, name: string) => dispatch({ type: "rename", teamId, name }),
    newGame: () => dispatch({ type: "reset" }),
  };
}
