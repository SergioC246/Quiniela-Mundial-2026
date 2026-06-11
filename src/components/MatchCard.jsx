import { useTranslation } from '../hooks/useTranslation';

export default function MatchCard({ match, result, pick, onChangePick, viewMode = "picks" }) {
  const { t } = useTranslation();

  const actualScoreText = result?.final
    ? `${result.homeScore} - ${result.awayScore}`
    : t("pending");

  const sourceText = result?.source
    ? `${t("source")}: ${t(result.source) || result.source}`
    : "";

  // Set default values for pick if not present
  const currentMode = pick?.mode || "winner";
  const currentWinner = pick?.winner || "";
  const currentHomeScore = pick?.homeScore !== undefined ? pick.homeScore : "";
  const currentAwayScore = pick?.awayScore !== undefined ? pick.awayScore : "";

  const handleModeChange = (mode) => {
    onChangePick(match.id, {
      ...pick,
      mode,
      // Keep existing properties if they exist
      winner: currentWinner,
      homeScore: currentHomeScore,
      awayScore: currentAwayScore
    });
  };

  const handleWinnerChange = (winner) => {
    onChangePick(match.id, {
      mode: "winner",
      winner
    });
  };

  const handleScoreChange = (team, val) => {
    const numericVal = val === "" ? "" : Number(val);
    onChangePick(match.id, {
      mode: "score",
      homeScore: team === "home" ? numericVal : currentHomeScore,
      awayScore: team === "away" ? numericVal : currentAwayScore
    });
  };

  if (viewMode === "results") {
    return (
      <article className="match-card">
        <div className="match-main">
          <div className="team">
            <strong>{match.home}</strong>
            <small>{t("group")} {match.group}</small>
          </div>
          <div className="versus result-badge">{actualScoreText}</div>
          <div className="team" style={{ textAlign: 'right' }}>
            <strong>{match.away}</strong>
            <small>{sourceText}</small>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="match-card" data-match={match.id}>
      <div className="match-main">
        <div className="team">
          <strong>{match.home}</strong>
          <small>{t("group")} {match.group} · {match.venue}</small>
        </div>
        <div className="versus">VS</div>
        <div className="team" style={{ textAlign: 'right' }}>
          <strong>{match.away}</strong>
          <small>{match.date} · {match.time}</small>
        </div>
      </div>
      <div className="prediction">
        <div className="meta">{t("result")}: {actualScoreText}</div>
        <div className="mode-row">
          <button
            className={`choice ${currentMode === 'winner' ? 'active' : ''}`}
            type="button"
            onClick={() => handleModeChange('winner')}
          >
            {t("winnerMode")}
          </button>
          <button
            className={`choice ${currentMode === 'score' ? 'active' : ''}`}
            type="button"
            onClick={() => handleModeChange('score')}
          >
            {t("scoreMode")}
          </button>
        </div>

        {currentMode === 'winner' && (
          <div className="choice-row">
            <button
              className={`choice ${currentWinner === 'home' ? 'active' : ''}`}
              type="button"
              onClick={() => handleWinnerChange('home')}
            >
              {match.home}
            </button>
            <button
              className={`choice ${currentWinner === 'draw' ? 'active' : ''}`}
              type="button"
              onClick={() => handleWinnerChange('draw')}
            >
              {t("draw")}
            </button>
            <button
              className={`choice ${currentWinner === 'away' ? 'active' : ''}`}
              type="button"
              onClick={() => handleWinnerChange('away')}
            >
              {match.away}
            </button>
          </div>
        )}

        {currentMode === 'score' && (
          <div className="score-inputs">
            <label>
              <span>{match.home}</span>
              <input
                min="0"
                max="30"
                type="number"
                inputMode="numeric"
                value={currentHomeScore}
                onChange={(e) => handleScoreChange('home', e.target.value)}
              />
            </label>
            <span>-</span>
            <label style={{ textAlign: 'right' }}>
              <span>{match.away}</span>
              <input
                min="0"
                max="30"
                type="number"
                inputMode="numeric"
                value={currentAwayScore}
                onChange={(e) => handleScoreChange('away', e.target.value)}
              />
            </label>
          </div>
        )}
      </div>
    </article>
  );
}
