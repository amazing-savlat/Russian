import { getWinners, rankTeams } from "../game/logic";
import type { Team } from "../game/types";

interface Props {
  teams: Team[];
  onNewGame: () => void;
}

export function ResultsScreen({ teams, onNewGame }: Props) {
  const ranked = rankTeams(teams);
  const winners = getWinners(teams);
  const isTie = winners.length > 1;
  const teamIndex = (id: number) => teams.findIndex((t) => t.id === id);

  let headline: string;
  if (winners.length === teams.length) headline = "Ничья! Все команды набрали поровну";
  else if (isTie) headline = `Ничья! Победители: ${joinNames(winners.map((w) => w.name))}`;
  else headline = `Победила команда «${winners[0].name}»`;

  return (
    <div className="screen results-screen">
      <div className="results-kicker">Игра окончена</div>
      <h1 className="results-headline">🏆 {headline}</h1>

      <ol className="results-list">
        {ranked.map((t) => (
          <li
            key={t.id}
            className={`results-row team-${teamIndex(t.id)}${t.place === 1 ? " winner" : ""}`}
          >
            <span className="results-place">{t.place}</span>
            <span className="results-name">{t.name}</span>
            <span className="results-score">{t.score}</span>
          </li>
        ))}
      </ol>

      <button className="btn btn-primary btn-huge" onClick={onNewGame}>
        Новая игра
      </button>
    </div>
  );
}

function joinNames(names: string[]): string {
  const quoted = names.map((n) => `«${n}»`);
  if (quoted.length <= 1) return quoted.join("");
  return `${quoted.slice(0, -1).join(", ")} и ${quoted[quoted.length - 1]}`;
}
