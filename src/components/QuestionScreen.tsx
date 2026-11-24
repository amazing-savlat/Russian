import { CAT_IN_BAG_BONUS, categoryLabel } from "../data/config";
import type { Question, Team } from "../game/types";

interface Props {
  question: Question;
  team: Team;
  teamIndex: number;
  isAnswerVisible: boolean;
  onShowAnswer: () => void;
  onCorrect: () => void;
  onIncorrect: () => void;
}

export function QuestionScreen({
  question,
  team,
  teamIndex,
  isAnswerVisible,
  onShowAnswer,
  onCorrect,
  onIncorrect,
}: Props) {
  const cat = !!question.isCatInBag;

  return (
    <div className="overlay" role="dialog" aria-modal="true">
      <div className={`question-card${cat ? " question-cat" : ""}`}>
        <div className="question-meta">
          <span className="meta-category">{categoryLabel(question.questionType)}</span>
          <span className="meta-points">
            {question.answerPoints}
            {cat && <span className="meta-bonus"> + {CAT_IN_BAG_BONUS}</span>}
          </span>
          <span className={`meta-team team-${teamIndex}`}>Отвечает: {team.name}</span>
        </div>

        {cat && (
          <div className="cat-banner">
            🐱 Кот в мешке! За правильный ответ — дополнительно {CAT_IN_BAG_BONUS} баллов
          </div>
        )}

        <div className="question-text">{question.question}</div>

        {isAnswerVisible ? (
          <>
            <div className="answer-block">
              <div className="answer-label">Правильный ответ</div>
              <div className="answer-text">{question.answer}</div>
            </div>
            <div className="question-actions">
              <button className="btn btn-correct btn-big" onClick={onCorrect}>
                ✓ Правильно ответили
              </button>
              <button className="btn btn-incorrect btn-big" onClick={onIncorrect}>
                ✗ Неправильно ответили
              </button>
            </div>
          </>
        ) : (
          <div className="question-actions">
            <button className="btn btn-primary btn-big" onClick={onShowAnswer}>
              Показать ответ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
