import { questions } from "./data/questions";
import { teams } from "./data/teams";
import { getSelectedQuestion, validateQuestions } from "./game/logic";
import { useGame } from "./game/useGame";
import { StartScreen } from "./components/StartScreen";
import { Board } from "./components/Board";
import { Scoreboard } from "./components/Scoreboard";
import { QuestionScreen } from "./components/QuestionScreen";
import { ResultsScreen } from "./components/ResultsScreen";

const dataErrors = validateQuestions(questions);

export function App() {
  const game = useGame(dataErrors.length ? [] : questions, teams);
  const { state } = game;
  const selected = getSelectedQuestion(state);

  if (state.gameStatus === "not_started") {
    return (
      <StartScreen
        teams={state.teams}
        questionCount={questions.length}
        dataErrors={dataErrors}
        onRename={game.renameTeam}
        onStart={game.startGame}
      />
    );
  }

  if (state.gameStatus === "finished") {
    return <ResultsScreen teams={state.teams} onNewGame={game.newGame} />;
  }

  return (
    <div className="screen game-screen">
      <Board state={state} onSelect={game.selectQuestion} />
      <Scoreboard teams={state.teams} currentTeamIndex={state.currentTeamIndex} />
      {selected && (
        <QuestionScreen
          key={selected.id}
          question={selected}
          team={state.teams[state.currentTeamIndex]}
          teamIndex={state.currentTeamIndex}
          isAnswerVisible={state.isAnswerVisible}
          onShowAnswer={game.showAnswer}
          onCorrect={game.markAnswerCorrect}
          onIncorrect={game.markAnswerIncorrect}
        />
      )}
    </div>
  );
}
