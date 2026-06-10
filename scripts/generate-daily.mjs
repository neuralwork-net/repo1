// Build-time daily-quiz generator.
//
// Runs in GitHub Actions before `astro build`. If API_FOOTBALL_KEY is set, it
// pulls recently finished World Cup matches and turns the latest result into a
// fresh question prepended to the daily quiz. With no key it exits cleanly and
// the committed daily.json is used as-is — so local/dev builds never break.
//
// Configure via env (all optional, defaults shown):
//   API_FOOTBALL_KEY   - api-sports.io key (secret). No key => no-op.
//   WC_LEAGUE_ID=1     - api-football league id for the World Cup
//   WC_SEASON=2026     - season year

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const DAILY_PATH = fileURLToPath(
  new URL('../src/data/quizzes/daily.json', import.meta.url),
);

const KEY = process.env.API_FOOTBALL_KEY;
const LEAGUE = process.env.WC_LEAGUE_ID || '1';
const SEASON = process.env.WC_SEASON || '2026';

async function main() {
  if (!KEY) {
    console.log('[gen:daily] No API_FOOTBALL_KEY — keeping committed daily.json.');
    return;
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const url = `https://v3.football.api-sports.io/fixtures?league=${LEAGUE}&season=${SEASON}&date=${yesterday}`;

  let data;
  try {
    const res = await fetch(url, { headers: { 'x-apisports-key': KEY } });
    data = await res.json();
  } catch (err) {
    console.warn('[gen:daily] API fetch failed, keeping daily.json:', err.message);
    return;
  }

  const finished = (data?.response || []).filter(
    (f) => f.fixture?.status?.short === 'FT' && f.teams?.home && f.teams?.away,
  );
  if (!finished.length) {
    console.log('[gen:daily] No finished matches yesterday — no change.');
    return;
  }

  const m = finished[0];
  const home = m.teams.home.name;
  const away = m.teams.away.name;
  const winner = m.teams.home.winner ? home : m.teams.away.winner ? away : null;
  const options = shuffle([home, away, 'It was a draw', 'Match was postponed']);
  const correct = winner ?? 'It was a draw';

  const question = {
    q: `Yesterday's World Cup result: who won ${home} vs ${away}?`,
    options,
    answer: options.indexOf(correct),
    explain: `Final score: ${m.goals.home}–${m.goals.away}.`,
  };

  const daily = JSON.parse(await readFile(DAILY_PATH, 'utf8'));
  // Prepend fresh result, cap at 6 questions.
  daily.questions = [question, ...daily.questions].slice(0, 6);
  await writeFile(DAILY_PATH, JSON.stringify(daily, null, 2) + '\n');
  console.log(`[gen:daily] Added fresh question: ${home} vs ${away}.`);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

main();
