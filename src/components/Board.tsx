import { CATEGORIES } from "../data/config";
import { buildBoard } from "../game/logic";
import type { GameState } from "../game/types";

interface Props {
  state: GameState;
  onSelect: (questionId: number) => void;
}

export function Board({ state, onSelect }: Props) {
  const board = buildBoard(state);
  const locked = state.selectedQuestionId !== null;

  return (
    <div
      className="board"
      style={{ gridTemplateColumns: `repeat(${CATEGORIES.length}, 1fr)` }}
      role="grid"
    >
      {CATEGORIES.map((c) => (
        <div key={c.type} className="board-header" role="columnheader">
          {c.label}
        </div>
      ))}

      {board.map((row) =>
        row.map((cell) => {
          const q = cell.next;
          const status = q ? "available" : cell.hasQuestions ? "used" : "empty";
          return (
            <button
              key={`${cell.level}-${cell.questionType}`}
              className={`cell cell-${status}${q?.isCatInBag ? " cell-cat" : ""}`}
              disabled={!q || locked}
              onClick={() => q && onSelect(q.id)}
              aria-label={
                q
                  ? `${CATEGORIES.find((c) => c.type === cell.questionType)?.label}, ${q.answerPoints} баллов${q.isCatInBag ? ", кот в мешке" : ""}`
                  : "Вопрос недоступен"
              }
            >
              {q ? (
                <>
                  <span className="cell-points">{q.answerPoints}</span>
                  {q.isCatInBag && <span className="cell-cat-badge">🐱 Кот в мешке</span>}
                  {cell.remaining > 1 && <span className="cell-remaining">×{cell.remaining}</span>}
                </>
              ) : cell.hasQuestions ? (
                <span className="cell-used-mark">✓</span>
              ) : (
                <span className="cell-empty-mark">—</span>
              )}
            </button>
          );
        }),
      )}
    </div>
  );
}
