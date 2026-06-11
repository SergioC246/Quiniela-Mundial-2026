import { useTranslation } from '../hooks/useTranslation';
import PlayerAuth from './PlayerAuth';
import MatchCard from './MatchCard';

export default function MatchList({
  matches,
  results,
  picks,
  onChangePick,
  currentPlayer,
  formValues,
  setFormValues,
  onLogout,
  onSubmitPicks,
  formMsg
}) {
  const { t } = useTranslation();

  return (
    <div className="panel-body" id="picksView">
      <PlayerAuth
        currentPlayer={currentPlayer}
        formValues={formValues}
        setFormValues={setFormValues}
        onLogout={onLogout}
      />
      
      <div className="match-list" id="matchList" style={{ marginTop: '16px' }}>
        {matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            result={results[match.id]}
            pick={picks[match.id]}
            onChangePick={onChangePick}
            viewMode="picks"
          />
        ))}
      </div>

      <div className="submit-row">
        <button
          className="primary"
          id="submitBtn"
          type="button"
          onClick={onSubmitPicks}
        >
          {t("submitBtn")}
        </button>
        {formMsg?.text && (
          <span className={`msg ${formMsg.type === 'ok' ? 'ok' : 'err'}`} id="formMsg">
            {formMsg.text}
          </span>
        )}
      </div>
    </div>
  );
}
