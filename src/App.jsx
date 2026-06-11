import { useState, useEffect } from "react";
import { TranslationProvider } from "./hooks/TranslationProvider";
import { useTranslation } from "./hooks/useTranslation";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { matches } from "./constants/matches";
import { storageService } from "./services/storageService";
import { fetchResultsForMatches, normalize } from "./services/espnApi";

import StatusPills from "./components/StatusPills";
import MatchList from "./components/MatchList";
import MatchCard from "./components/MatchCard";
import Leaderboard from "./components/Leaderboard";
import AdminPanel from "./components/AdminPanel";

const APP_KEY = "mundial_2026_quiniela_shared_v1";
const PLAYER_SESSION_KEY = "mundial_2026_player_session";

function emailKey(email) {
  return normalize(email).slice(0, 160);
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function AppContent() {
  const { t, lang, toggleLang } = useTranslation();

  // App state
  const [state, setState] = useState({
    players: {},
    results: {},
    updatedAt: new Date().toISOString(),
  });

  const [storageMode, setStorageMode] = useState("checking");
  const [currentTab, setCurrentTab] = useState("picks"); // 'picks' | 'results'
  const [theme, setTheme] = useState(
    () => localStorage.getItem("quiniela_theme") || "light",
  );

  // Admin session state
  const [adminLoggedIn, setAdminLoggedIn] = useState(
    () => sessionStorage.getItem("mundial_2026_admin_session") === "true",
  );
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  // Active Player session
  const [currentPlayer, setCurrentPlayer] = useLocalStorage(
    PLAYER_SESSION_KEY,
    null,
  );

  // Player picks state for form edits
  const [playerPicks, setPlayerPicks] = useState({});

  // Form input states
  const [formValues, setFormValues] = useState({ name: "", email: "" });

  // Status message states
  const [formMsg, setFormMsg] = useState({ text: "", type: "" });
  const [apiMsg, setApiMsg] = useState({ text: "", type: "" });
  const [adminMsg, setAdminMsg] = useState({ text: "", type: "" });

  // Theme effect
  useEffect(() => {
    localStorage.setItem("quiniela_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);



  // Load initial state
  useEffect(() => {
    async function loadInitialState() {
      const raw = await storageService.get(APP_KEY);
      let loadedState = {
        players: {},
        results: {},
        updatedAt: new Date().toISOString(),
      };
      if (raw) {
        try {
          loadedState = { ...loadedState, ...JSON.parse(raw) };
        } catch (error) {
          console.warn("Stored data could not be parsed", error);
        }
      }
      const mode = await storageService.set(
        APP_KEY,
        JSON.stringify(loadedState),
      );
      setState(loadedState);
      setStorageMode(mode);
    }
    loadInitialState();
  }, []);

  // Sync loop polling
  useEffect(() => {
    const interval = setInterval(async () => {
      const raw = await storageService.get(APP_KEY);
      if (raw) {
        try {
          const incoming = JSON.parse(raw);
          setState((current) => {
            if (
              incoming.updatedAt &&
              incoming.updatedAt !== current.updatedAt
            ) {
              return { ...current, ...incoming };
            }
            return current;
          });
        } catch (err) {
          console.debug("Sync loop state parse failed", err);
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Sync player picks when player session or global players state changes
  useEffect(() => {
    const picks =
      currentPlayer?.id && state.players[currentPlayer.id]
        ? state.players[currentPlayer.id].picks || {}
        : {};
    const timer = setTimeout(() => {
      setPlayerPicks(picks);
    }, 0);
    return () => clearTimeout(timer);
  }, [currentPlayer, state.players]);

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

  const handleLogoutPlayer = () => {
    setCurrentPlayer(null);
    setPlayerPicks({});
    setFormValues({ name: "", email: "" });
    setFormMsg({ text: "", type: "" });
  };

  const handlePickChange = (matchId, newPick) => {
    setPlayerPicks((prev) => ({
      ...prev,
      [matchId]: newPick,
    }));
  };

  const handleSubmitPicks = async () => {
    const name = formValues.name.trim();
    const email = formValues.email.trim().toLowerCase();

    const isNewSession = !currentPlayer;
    const playerKey = emailKey(email);

    if (isNewSession) {
      if (!name || !validEmail(email)) {
        setFormMsg({ text: t("needNameEmail"), type: "err" });
        return;
      }
    }

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

    const key = currentPlayer ? currentPlayer.id : playerKey;
    const targetEmail = currentPlayer ? currentPlayer.email : email;
    const targetName = currentPlayer ? currentPlayer.name : name;

    const updatedPlayers = {
      ...state.players,
      [key]: {
        id: key,
        name: targetName,
        email: targetEmail,
        picks: completedPicks,
        joinedAt: state.players[key]?.joinedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    const newState = {
      ...state,
      players: updatedPlayers,
      updatedAt: new Date().toISOString(),
    };

    setState(newState);

    setCurrentPlayer({
      id: key,
      name: targetName,
      email: targetEmail,
    });

    const mode = await storageService.set(APP_KEY, JSON.stringify(newState));
    setStorageMode(mode);
    setFormMsg({ text: t("saveOk"), type: "ok" });
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
      const mode = await storageService.set(APP_KEY, JSON.stringify(newState));
      setStorageMode(mode);

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
    const newState = {
      ...state,
      results: updatedResults,
      updatedAt: new Date().toISOString(),
    };
    setState(newState);
    const mode = await storageService.set(APP_KEY, JSON.stringify(newState));
    setStorageMode(mode);
    setAdminMsg({ text: t("adminSaved"), type: "ok" });
  };

  const handleClearData = async () => {
    localStorage.removeItem(APP_KEY);
    const newState = {
      players: {},
      results: {},
      updatedAt: new Date().toISOString(),
    };
    setState(newState);
    const mode = await storageService.set(APP_KEY, JSON.stringify(newState));
    setStorageMode(mode);
    setAdminMsg({ text: t("localCleared"), type: "ok" });
  };

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
            <MatchList
              matches={matches}
              results={state.results}
              picks={playerPicks}
              onChangePick={handlePickChange}
              currentPlayer={currentPlayer}
              formValues={formValues}
              setFormValues={setFormValues}
              onLogout={handleLogoutPlayer}
              onSubmitPicks={handleSubmitPicks}
              formMsg={formMsg}
            />
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
