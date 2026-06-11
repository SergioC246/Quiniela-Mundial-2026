import { useTranslation } from '../hooks/useTranslation';

function winnerFromScore(homeScore, awayScore) {
  if (homeScore > awayScore) return "home";
  if (awayScore > homeScore) return "away";
  return "draw";
}

function scorePredictionWinner(pick) {
  return winnerFromScore(Number(pick.homeScore), Number(pick.awayScore));
}

function pointsForPick(match, pick, results) {
  const result = results[match.id];
  if (!result || !result.final || !pick) return { points: 0, exact: false };
  
  const actualWinner = winnerFromScore(Number(result.homeScore), Number(result.awayScore));

  if (pick.mode === "winner") {
    return { points: pick.winner === actualWinner ? 3 : 0, exact: false };
  }

  const exact = Number(pick.homeScore) === Number(result.homeScore) && 
                Number(pick.awayScore) === Number(result.awayScore);
  
  if (exact) return { points: 5, exact: true };
  
  return { points: scorePredictionWinner(pick) === actualWinner ? 3 : 0, exact: false };
}

export default function Leaderboard({ players, matches, results }) {
  const { t, lang } = useTranslation();

  // Compute standings
  const playerList = Object.values(players || {});
  const standings = playerList.map((player) => {
    const score = matches.reduce((acc, match) => {
      const pickScore = pointsForPick(match, player.picks?.[match.id], results);
      acc.points += pickScore.points;
      acc.exacts += pickScore.exact ? 1 : 0;
      return acc;
    }, { points: 0, exacts: 0 });
    return { ...player, ...score };
  }).sort((a, b) => 
    b.points - a.points || 
    b.exacts - a.exacts || 
    new Date(a.joinedAt) - new Date(b.joinedAt)
  );

  // Compute joined people sorted by joinedAt descending
  const joinedPeople = [...playerList].sort((a, b) => 
    new Date(b.joinedAt) - new Date(a.joinedAt)
  );

  return (
    <aside className="stack">
      {/* Live standing table */}
      <div className="panel">
        <div className="panel-head">
          <h2 id="leaderTitle">{t("leaderTitle")}</h2>
          <span className="pill" style={{ color: 'var(--text)', background: 'var(--panel-strong)', borderColor: 'var(--line)' }}>
            <span id="playerCount">{standings.length}</span>
          </span>
        </div>
        <div className="panel-body" id="leaderboardWrap">
          {standings.length === 0 ? (
            <div className="empty">{t("emptyBoard")}</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>{t("pos")}</th>
                  <th>{t("player")}</th>
                  <th>{t("exacts")}</th>
                  <th>{t("points")}</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((row, index) => (
                  <tr key={row.id}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{row.name}</strong>
                    </td>
                    <td>{row.exacts}</td>
                    <td className="points">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* People Joined */}
      <div className="panel">
        <div className="panel-head">
          <h2 id="peopleTitle">{t("peopleTitle")}</h2>
        </div>
        <div className="panel-body">
          <div className="people-list" id="peopleList">
            {joinedPeople.length === 0 ? (
              <div className="empty">{t("emptyPeople")}</div>
            ) : (
              joinedPeople.map((person) => (
                <div className="person" key={person.id}>
                  <strong>{person.name}</strong>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
