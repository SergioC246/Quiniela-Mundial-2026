import { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';

const ADMIN_USER = "admin";
const DEFAULT_ADMIN_PASS = "Mundial2026!";

export default function AdminPanel({
  adminLoggedIn,
  setAdminLoggedIn,
  isOpen,
  setIsOpen,
  isModalOpen,
  setIsModalOpen,
  matches,
  results,
  players,
  onSaveResults,
  onClearData,
  onFetchApiResults,
  apiMsg,
  adminMsg
}) {
  const { t } = useTranslation();
  const playersList = Object.values(players || {});

  // Modal Login form state
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [loginMsg, setLoginMsg] = useState({ text: "", type: "" });

  // Manual scores editing state
  // Stores { [matchId]: { homeScore, awayScore, final } }
  const [manualScores, setManualScores] = useState({});

  // Initialize manual scores state when results or matches change
  useEffect(() => {
    const initial = {};
    matches.forEach((match) => {
      const res = results[match.id] || {};
      initial[match.id] = {
        homeScore: res.final ? String(res.homeScore) : "",
        awayScore: res.final ? String(res.awayScore) : "",
        final: Boolean(res.final)
      };
    });
    // Derailed from main effect to avoid React 19 warning
    const timer = setTimeout(() => {
      setManualScores(initial);
    }, 0);
    return () => clearTimeout(timer);
  }, [matches, results]);

  const handleLogin = () => {
    const adminPass = import.meta.env?.VITE_ADMIN_PASS || DEFAULT_ADMIN_PASS;
    if (user.trim() === ADMIN_USER && pass === adminPass) {
      setAdminLoggedIn(true);
      sessionStorage.setItem("mundial_2026_admin_session", "true");
      setLoginMsg({ text: t("adminLoginOk"), type: "ok" });
      setTimeout(() => {
        setIsModalOpen(false);
        setIsOpen(true);
        // Clear login form
        setUser("");
        setPass("");
        setLoginMsg({ text: "", type: "" });
      }, 500);
    } else {
      setLoginMsg({ text: t("adminLoginBad"), type: "err" });
    }
  };

  const handleLogout = () => {
    setAdminLoggedIn(false);
    sessionStorage.removeItem("mundial_2026_admin_session");
    setIsOpen(false);
  };

  const handleManualScoreChange = (matchId, field, val) => {
    setManualScores((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [field]: val
      }
    }));
  };

  const handleSaveManual = () => {
    const updatedResults = { ...results };
    matches.forEach((match) => {
      const manual = manualScores[match.id];
      if (manual && manual.final && manual.homeScore !== "" && manual.awayScore !== "") {
        updatedResults[match.id] = {
          final: true,
          homeScore: Number(manual.homeScore),
          awayScore: Number(manual.awayScore),
          source: "manual",
          updatedAt: new Date().toISOString()
        };
      } else {
        delete updatedResults[match.id];
      }
    });
    onSaveResults(updatedResults);
  };

  // Close modal when clicking backdrop
  const handleBackdropClick = (e) => {
    if (e.target.id === "adminModal") {
      setIsModalOpen(false);
      setLoginMsg({ text: "", type: "" });
    }
  };

  return (
    <>
      {/* Admin Panel (visible only when logged in and expanded) */}
      {adminLoggedIn && isOpen && (
        <div className="admin-panel open" id="adminPanel" style={{ display: 'grid' }}>
          <div className="submit-row" style={{ marginTop: 0 }}>
            <strong>{t("adminSessionTitle")}</strong>
            <button className="ghost" id="adminLogoutBtn" type="button" onClick={handleLogout}>
              {t("adminLogoutBtn")}
            </button>
          </div>

          <div className="api-box">
            <strong>{t("apiTitle")}</strong>
            <p className="fineprint">{t("apiCopy")}</p>
            <div className="submit-row">
              <button className="primary" id="apiLoadBtn" type="button" onClick={onFetchApiResults}>
                {t("apiLoadBtn")}
              </button>
              {apiMsg?.text && (
                <span className={`msg ${apiMsg.type === 'ok' ? 'ok' : apiMsg.type === 'err' ? 'err' : ''}`} id="apiMsg">
                  {apiMsg.text}
                </span>
              )}
            </div>
          </div>

          <div>
            <h3>{t("manualTitle")}</h3>
            <p className="fineprint">{t("manualCopy")}</p>
          </div>

          <div className="result-grid" id="adminResults">
            {matches.map((match) => {
              const scoreData = manualScores[match.id] || { homeScore: "", awayScore: "", final: false };
              return (
                <div className="result-row" key={match.id} data-admin-match={match.id}>
                  <strong>{match.home} vs {match.away}</strong>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    placeholder="0"
                    value={scoreData.homeScore}
                    onChange={(e) => handleManualScoreChange(match.id, 'homeScore', e.target.value)}
                    aria-label={match.home}
                  />
                  <input
                    type="number"
                    min="0"
                    max="30"
                    placeholder="0"
                    value={scoreData.awayScore}
                    onChange={(e) => handleManualScoreChange(match.id, 'awayScore', e.target.value)}
                    aria-label={match.away}
                  />
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)' }}>
                    <input
                      type="checkbox"
                      style={{ width: '18px', minHeight: '18px', margin: 0 }}
                      checked={scoreData.final}
                      onChange={(e) => handleManualScoreChange(match.id, 'final', e.target.checked)}
                    />
                    {t("final")}
                  </label>
                </div>
              );
            })}
          </div>

          <div className="submit-row">
            <button className="primary" id="saveResultsBtn" type="button" onClick={handleSaveManual}>
              {t("saveResultsBtn")}
            </button>
            <button className="ghost" id="clearDemoBtn" type="button" onClick={onClearData}>
              {t("clearBtn")}
            </button>
            {adminMsg?.text && (
              <span className={`msg ${adminMsg.type === 'ok' ? 'ok' : 'err'}`} id="adminMsg">
                {adminMsg.text}
              </span>
            )}
          </div>

          <div style={{ marginTop: '24px', borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
            <h3 style={{ textTransform: 'uppercase', fontSize: '1.05rem', fontFamily: 'var(--score-font)' }}>Apuestas de los Jugadores</h3>
            <p className="fineprint" style={{ marginBottom: '16px' }}>Listado de pronósticos y datos privados de los participantes.</p>
            <div style={{ display: 'grid', gap: '12px' }}>
              {playersList.length === 0 ? (
                <div className="empty">No hay jugadores registrados todavía.</div>
              ) : (
                playersList.map((p) => (
                  <details key={p.id} style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '12px', background: 'var(--panel-strong)' }}>
                    <summary style={{ fontWeight: 700, cursor: 'pointer', outline: 'none', color: 'var(--text)' }}>
                      {p.name} ({p.email}) - {new Date(p.joinedAt).toLocaleString()}
                    </summary>
                    <div style={{ marginTop: '12px', display: 'grid', gap: '8px', fontSize: '0.85rem' }}>
                      {matches.map((match) => {
                        const pick = p.picks?.[match.id];
                        let pickText = "Sin pronóstico";
                        if (pick) {
                          if (pick.mode === "winner") {
                            const teamName = pick.winner === "home" ? match.home : pick.winner === "away" ? match.away : "Empate";
                            pickText = `Ganador: ${teamName}`;
                          } else {
                            pickText = `Marcador: ${pick.homeScore} - ${pick.awayScore}`;
                          }
                        }
                        return (
                          <div key={match.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--line)', paddingBottom: '4px' }}>
                            <span>{match.home} vs {match.away}:</span>
                            <strong style={{ color: 'var(--field)' }}>{pickText}</strong>
                          </div>
                        );
                      })}
                    </div>
                  </details>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Login Modal (popup backdrop) */}
      {isModalOpen && (
        <div
          className="modal-backdrop open"
          id="adminModal"
          role="dialog"
          aria-modal="true"
          onClick={handleBackdropClick}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2 id="adminLoginTitle">{t("adminLoginTitle")}</h2>
              <button
                className="ghost"
                id="closeAdminModalBtn"
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setLoginMsg({ text: "", type: "" });
                }}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p className="fineprint">{t("adminLoginCopy")}</p>
              <label>
                <span>{t("adminUserLabel")}</span>
                <input
                  id="adminUser"
                  autoComplete="username"
                  placeholder="admin"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                />
              </label>
              <label>
                <span>{t("adminPassLabel")}</span>
                <input
                  id="adminPass"
                  autoComplete="current-password"
                  type="password"
                  placeholder="••••••••"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </label>
              <div className="submit-row">
                <button className="primary" id="adminLoginBtn" type="button" onClick={handleLogin}>
                  {t("adminLoginBtn")}
                </button>
                {loginMsg.text && (
                  <span className={`msg ${loginMsg.type === 'ok' ? 'ok' : 'err'}`} id="adminLoginMsg">
                    {loginMsg.text}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
