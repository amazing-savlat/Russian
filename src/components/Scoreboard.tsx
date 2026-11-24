import type { Team } from "../game/types";

interface Props {
  teams: Team[];
  currentTeamIndex: number;
}

export function Scoreboard({ teams, currentTeamIndex }: Props) {
  return (
    <div className="scoreboard">
      {teams.map((team, i) => {
        const active = i === currentTeamIndex;
        return (
          <div key={team.id} className={`score-card team-${i}${active ? " active" : ""}`}>
            <div className="score-turn">{active ? "▶ Сейчас ходит" : " "}</div>
            <div className="score-name">{team.name}</div>
            <div className="score-value" key={team.score}>
              {team.score}
            </div>
          </div>
        );
      })}
    </div>
  );
}
