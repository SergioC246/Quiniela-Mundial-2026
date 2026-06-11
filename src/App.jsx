import { useState, useEffect } from "react";
import { TranslationProvider } from "./hooks/TranslationProvider";
import { useTranslation } from "./hooks/useTranslation";
import { useAuth } from "./hooks/useAuth";
import { matches } from "./constants/matches";
import { fetchResultsForMatches } from "./services/espnApi";
import { apiService } from "./services/apiServices";

import StatusPills from "./components/StatusPills";
import MatchCard from "./components/MatchCard";
import Leaderboard from "./components/Leaderboard";
import AdminPanel from "./components/AdminPanel";
import AuthForm from "./components/AuthForm";
import UserProfile from "./components/UserProfile";

function AppContent() {
  const { t, lang, toggleLang } = useTranslation();
  const { token, user, loading: authLoading, login, register, logout, isAuthenticated } = useAuth();

  // App state
  const [state, setState] = useState({
    players: {},
    results: {},
    updatedAt: new Date().toISOString(),
  });

  const [storageMode, setStorageMode] = useState("checking");
  const [currentTab, setCurrentTab] = useState("picks");
  const [theme, setTheme] = useState(
    () => localStorage.getItem("quiniela_theme") || "light",
  );

  const [adminLoggedIn, setAdminLoggedIn] = useState(
    () => sessionStorage.getItem("mundial_2026_admin_session") === "true",
  );
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  const [playerPicks, setPlayerPicks] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);

  // Status message states
  const [formMsg, setFormMsg] = useState({ text: "", type: "" });
  const [apiMsg, setApiMsg] = useState({ text: "", type: "" });
  const [adminMsg, setAdminMsg] = useState({ text: "", type: "" });

  // Load leaderboard
  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const data = await apiService.getLeaderboard();
        setLeaderboard(data);
      } catch (error) {
        console.error("Error loading leaderboard:", error);
      }
    }
    loadLeaderboard();
  }, [state.players]);



  // Load initial state from API
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    async function loadInitialState() {
      try {
        const [playersData, matchesData] = await Promise.all([
          apiService.getPlayers(token).catch(() => []),
          apiService.getMatches(token).catch(() => [])
        ]);

        const playersObj = {};
        for (const player of playersData) {
          const predictions = await apiService.getPredictions(player.id, token).catch(() => ({ predictions: {} }));
          playersObj[player.id] = {
            id: player.id,
            name: player.name,
            email: player.email,
            picks: predictions.predictions || {},
            joinedAt: player.joinedAt,
            updatedAt: player.updatedAt
          };
        }

        const resultsObj = {};
        for (const match of matchesData) {
          if (match.result) {
            resultsObj[match.id] = match.result;
          }
        }

        setState({
          players: playersObj,
          results: resultsObj,
          updatedAt: new Date().toISOString()
        });
        setStorageMode("api");
      } catch (error) {
        console.error("Error loading initial state:", error);
        setStorageMode("error");
      }
    }
    loadInitialState();
  }, [isAuthenticated, token]);

  // Sync loop polling from API
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const interval = setInterval(async () => {
      try {
        const matchesData = await apiService.getMatches(token);
        const resultsObj = {};
        for (const match of matchesData) {
          if (match.result) {
            resultsObj[match.id] = match.result;
          }
        }
        setState((current) => ({
          ...current,
          results: resultsObj,
          updatedAt: new Date().toISOString()
        }));
      } catch (err) {
        console.debug("Sync loop failed", err);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated, token]);

  // Theme effect
  useEffect(() => {
    localStorage.setItem("quiniela_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleAdminBtnClick = () => {
    if (adminLoggedIn) {
      setAdminPanelOpen((prev) => !prev);
    } else {
      setAdminModalOpen(true);
    }
  };

  const handlePickChange = (matchId, newPick) => {
    setPlayerPicks((prev) => ({
      ...prev,
      [matchId]: newPick,
    }));
  };

  const handleSubmitPicks = async () => {
    // Validate picks
    const completedPicks = {};
    for (const match of matches) {
      const p = playerPicks[match.id];
      if (!p) {
        setFormMsg({ text: t("needPicks"), type: "err" });
        return;
      }
      if (p.mode === "winner") {
        if (!p.winner) {
          setFormMsg({ text: t("needPicks"), type: "err" });
          return;
        }
        completedPicks[match.id] = { mode: p.mode, winner: p.winner };
      } else {
        if (p.homeScore === "" || p.awayScore === "") {
          setFormMsg({ text: t("needPicks"), type: "err" });
          return;
        }
        completedPicks[match.id] = {
          mode: p.mode,
          homeScore: Number(p.homeScore),
          awayScore: Number(p.awayScore),
        };
      }
    }

    try {
      // Save predictions for current user
      await apiService.savePredictions(user.id, completedPicks, token);

      // Update local state
      const updatedPlayers = {
        ...state.players,
        [user.id]: {
          id: user.id,
          name: user.name,
          email: user.email,
          picks: completedPicks,
          joinedAt: state.players[user.id]?.joinedAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
      setState({
        ...state,
        players: updatedPlayers,
        updatedAt: new Date().toISOString(),
      });

      setFormMsg({ text: t("saveOk"), type: "ok" });
    } catch (error) {
      console.error(error);
      setFormMsg({ text: "Error al guardar predicciones", type: "err" });
    }
  };

  const handleFetchApiResults = async () => {
    setApiMsg({ text: t("apiLoading"), type: "" });
    try {
      const { results: newResults, updatedCount } =
        await fetchResultsForMatches(matches);

      const newState = {
        ...state,
        results: {
          ...state.results,
          ...newResults,
        },
        updatedAt: new Date().toISOString(),
      };

      setState(newState);

      // Save to backend
      for (const [matchId, result] of Object.entries(newResults)) {
        if (result && (result.homeScore !== undefined && result.awayScore !== undefined)) {
          await apiService.saveMatchResult(
            matchId,
            result.homeScore,
            result.awayScore,
            result.winner,
            token
          );
        }
      }

      setApiMsg({
        text: updatedCount ? t("apiDone") : t("apiNone"),
        type: updatedCount ? "ok" : "",
      });
    } catch (error) {
      console.error(error);
      setApiMsg({ text: t("apiError"), type: "err" });
    }
  };

  const handleSaveResults = async (updatedResults) => {
    try {
      // Save each match result to API
      for (const [matchId, result] of Object.entries(updatedResults)) {
        if (result && (result.homeScore !== undefined && result.awayScore !== undefined)) {
          await apiService.saveMatchResult(
            matchId,
            result.homeScore,
            result.awayScore,
            result.winner,
            token
          );
        }
      }

      const newState = {
        ...state,
        results: updatedResults,
        updatedAt: new Date().toISOString(),
      };
      setState(newState);
      setAdminMsg({ text: t("adminSaved"), type: "ok" });
    } catch (error) {
      console.error(error);
      setAdminMsg({ text: "Error al guardar resultados", type: "err" });
    }
  };

  const handleClearData = async () => {
    // Clear local state (data remains on server)
    const newState = {
      players: {},
      results: {},
      updatedAt: new Date().toISOString(),
    };
    setState(newState);
    setPlayerPicks({});
    setAdminMsg({ text: t("localCleared"), type: "ok" });
  };

  if (!isAuthenticated) {
    return (
      <main className="app" data-theme={theme}>
        <section className="hero">
          <div className="topbar">
            <div className="brand">
              <div className="logo" aria-hidden="true">
                <span></span>
              </div>
              <div className="brand-text">
                <strong>Mundial 2026</strong>
                <small>{t("brandSub")}</small>
              </div>
            </div>
            <div className="controls">
              <button className="icon-btn" type="button" onClick={handleToggleTheme}>
                {theme === "dark" ? t("themeLight") : t("themeBtn")}
              </button>
            </div>
          </div>
          <div className="hero-content">
            <h1>{t("title")}</h1>
            <p className="hero-copy">{t("heroCopy")}</p>
          </div>
        </section>
        <section className="grid">
          <div className="panel">
            <AuthForm
              onAuthSuccess={async (data) => {
                if (data.isLogin) {
                  await login(data.email, data.password, apiService);
                } else {
                  await register(data.name, data.email, data.password, apiService);
                }
              }}
              isLoading={authLoading}
            />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app" data-theme={theme}>
      <section className="hero">
        <div className="topbar">
          <div className="brand">
            <div className="logo" aria-hidden="true">
              <span></span>
            </div>
            <div className="brand-text">
              <strong>Mundial 2026</strong>
              <small>{t("brandSub")}</small>
            </div>
          </div>
          <div className="controls">
            <button
              className="icon-btn"
              id="langBtn"
              type="button"
              onClick={toggleLang}
            >
              {lang.toUpperCase()}
            </button>
            <button
              className="icon-btn"
              id="themeBtn"
              type="button"
              onClick={handleToggleTheme}
            >
              {theme === "dark" ? t("themeLight") : t("themeBtn")}
            </button>
            <button
              className="icon-btn"
              id="adminBtn"
              type="button"
              onClick={handleAdminBtnClick}
            >
              {t("adminBtn")}
            </button>
          </div>
        </div>

        <div className="hero-content">
          <h1>{t("title")}</h1>
          <p className="hero-copy">{t("heroCopy")}</p>
          {adminLoggedIn && (
            <StatusPills
              storageMode={storageMode}
              apiStatusText={t("apiReady")}
            />
          )}
        </div>
      </section>

      <section className="grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>{t("predictionsTitle")}</h2>
              <p className="fineprint">{t("scoring")}</p>
            </div>
            <div className="tabs" role="tablist" aria-label="Prediction mode">
              <button
                className={`tab-btn ${currentTab === "picks" ? "active" : ""}`}
                id="viewPicks"
                type="button"
                onClick={() => setCurrentTab("picks")}
              >
                {t("tabPicks")}
              </button>
              <button
                className={`tab-btn ${currentTab === "results" ? "active" : ""}`}
                id="viewResults"
                type="button"
                onClick={() => setCurrentTab("results")}
              >
                {t("tabResults")}
              </button>
            </div>
          </div>

          {currentTab === "picks" ? (
            <>
              <UserProfile user={user} onLogout={logout} />
              <div className="match-list" id="matchList" style={{ marginTop: "16px" }}>
                {matches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    result={state.results[match.id]}
                    pick={playerPicks[match.id]}
                    onChangePick={handlePickChange}
                    viewMode="picks"
                  />
                ))}
              </div>
              <div className="submit-row">
                <button
                  className="primary"
                  id="submitBtn"
                  type="button"
                  onClick={handleSubmitPicks}
                >
                  {t("submitBtn")}
                </button>
                {formMsg?.text && (
                  <span
                    className={`msg ${formMsg.type === "ok" ? "ok" : "err"}`}
                    id="formMsg"
                  >
                    {formMsg.text}
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="panel-body" id="resultsView">
              <div className="match-list" id="resultsList">
                {matches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    result={state.results[match.id]}
                    viewMode="results"
                  />
                ))}
              </div>
            </div>
          )}

          <AdminPanel
            adminLoggedIn={adminLoggedIn}
            setAdminLoggedIn={setAdminLoggedIn}
            isOpen={adminPanelOpen}
            setIsOpen={setAdminPanelOpen}
            isModalOpen={adminModalOpen}
            setIsModalOpen={setAdminModalOpen}
            matches={matches}
            results={state.results}
            players={state.players}
            onSaveResults={handleSaveResults}
            onClearData={handleClearData}
            onFetchApiResults={handleFetchApiResults}
            apiMsg={apiMsg}
            adminMsg={adminMsg}
          />
        </div>

        <Leaderboard
          leaderboard={leaderboard}
          players={state.players}
          matches={matches}
          results={state.results}
        />
      </section>
    </main>
  );
}

export default function App() {
  return (
    <TranslationProvider>
      <AppContent />
    </TranslationProvider>
  );
}
