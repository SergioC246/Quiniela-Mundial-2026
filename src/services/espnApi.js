const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard";

export function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/united states|u\.s\.a\.|usa/g, "usa")
    .replace(/cote d ivoire|ivory coast/g, "cote divoire")
    .replace(/curacao/g, "curacao")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function findMatchingEvent(match, events) {
  const home = normalize(match.home);
  const away = normalize(match.away);
  return events.find((event) => {
    if (String(event.id) === String(match.id)) return true;
    const competitors = event.competitions?.[0]?.competitors || [];
    const names = competitors.map((entry) =>
      normalize(entry.team?.displayName || entry.team?.shortDisplayName || entry.team?.name)
    );
    return names.includes(home) && names.includes(away);
  });
}

function resultFromEvent(match, event) {
  const competition = event.competitions?.[0];
  const completed = event.status?.type?.completed || competition?.status?.type?.completed;
  if (!competition || !completed) return null;
  const competitors = competition.competitors || [];
  const mapped = {};
  competitors.forEach((entry) => {
    const name = normalize(entry.team?.displayName || entry.team?.shortDisplayName || entry.team?.name);
    if (name === normalize(match.home)) mapped.home = Number(entry.score);
    if (name === normalize(match.away)) mapped.away = Number(entry.score);
  });
  if (!Number.isFinite(mapped.home) || !Number.isFinite(mapped.away)) return null;
  return {
    final: true,
    homeScore: mapped.home,
    awayScore: mapped.away,
    source: "api",
    updatedAt: new Date().toISOString()
  };
}

export async function fetchResultsForMatches(matches) {
  const dates = [...new Set(matches.map((match) => match.date.replaceAll("-", "")))];
  const newResults = {};
  let updatedCount = 0;

  for (const date of dates) {
    const response = await fetch(`${ESPN_BASE}?dates=${date}`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}`);
    }
    const payload = await response.json();
    const dateMatches = matches.filter((item) => item.date.replaceAll("-", "") === date);
    
    for (const match of dateMatches) {
      const event = findMatchingEvent(match, payload.events || []);
      const result = event ? resultFromEvent(match, event) : null;
      if (result) {
        newResults[match.id] = result;
        updatedCount += 1;
      }
    }
  }

  return { results: newResults, updatedCount };
}
