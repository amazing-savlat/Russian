import { QUIZ_SUBTITLE, QUIZ_TITLE } from "../data/config";
import type { Team } from "../game/types";

interface Props {
  teams: Team[];
  questionCount: number;
  dataErrors: string[];
  onRename: (teamId: number, name: string) => void;
  onStart: () => void;
}

export function StartScreen({ teams, questionCount, dataErrors, onRename, onStart }: Props) {
  const hasErrors = dataErrors.length > 0;
  const canStart = questionCount > 0 && !hasErrors;

  return (
    <div className="screen start-screen">
      <div className="start-title-block">
        <div className="start-kicker">Командная игра</div>
        <h1 className="start-title">{QUIZ_TITLE}</h1>
        {QUIZ_SUBTITLE && <div className="start-subtitle">{QUIZ_SUBTITLE}</div>}
      </div>

      <div className="start-teams">
        {teams.map((team, i) => (
          <label key={team.id} className={`start-team team-${i}`}>
            <span className="start-team-number">{i + 1}</span>
            <input
              className="start-team-input"
              value={team.name}
              maxLength={24}
              onChange={(e) => onRename(team.id, e.target.value)}
              aria-label={`Название команды ${i + 1}`}
            />
          </label>
        ))}
      </div>

      {questionCount === 0 && (
        <div className="notice">
          <strong>Вопросы ещё не добавлены.</strong>
          <span>
            Добавьте вопросы в файл <code>src/data/questions.ts</code>, после чего можно будет
            начать игру.
          </span>
        </div>
      )}

      {hasErrors && (
        <div className="notice notice-error">
          <strong>В файле с вопросами есть ошибки:</strong>
          <ul>
            {dataErrors.slice(0, 6).map((e) => (
              <li key={e}>{e}</li>
            ))}
            {dataErrors.length > 6 && <li>…и ещё {dataErrors.length - 6}</li>}
          </ul>
        </div>
      )}

      <button className="btn btn-primary btn-huge" disabled={!canStart} onClick={onStart}>
        Начать игру
      </button>
      {canStart && <div className="start-hint">Вопросов в игре: {questionCount}</div>}
    </div>
  );
}
