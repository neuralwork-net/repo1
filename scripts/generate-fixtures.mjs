// Build-time fixtures refresher.
//
// Runs in GitHub Actions before `astro build`. If API_FOOTBALL_KEY is set, it
// pulls World Cup 2026 fixtures from api-sports.io and updates each committed
// fixture's status + score (and fills knockout teams once known) by matching on
// normalized team names. With no key it exits cleanly and the committed
// fixtures.json is used as-is — so local/dev builds never break.
//
// Env (all optional, defaults shown):
//   API_FOOTBALL_KEY  - api-sports.io key (secret). No key => no-op.
//   WC_LEAGUE_ID=1    - api-football league id for the World Cup
//   WC_SEASON=2026    - season year

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const FIXTURES_PATH = fileURLToPath(
  new URL('../src/data/fixtures.json', import.meta.url),
);

const KEY = process.env.API_FOOTBALL_KEY;
const LEAGUE = process.env.WC_LEAGUE_ID || '1';
const SEASON = process.env.WC_SEASON || '2026';

// Map api-football names → our committed names (only where they differ).
const NAME_ALIASES = {
  'south korea': 'korea republic',
  iran: 'ir iran',
  'united states': 'usa',
  'united states of america': 'usa',
  turkey: 'türkiye',
  'dr congo': 'congo dr',
  'congo dr': 'congo dr',
  'ivory coast': "côte d'ivoire",
  'cape verde': 'cabo verde',
  'cape verde islands': 'cabo verde',
};

function norm(name) {
  const n = (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents for matching
    .replace(/[^a-z ]/g, '')
    .trim();
  return NAME_ALIASES[n] || n;
}

function statusFromApi(short) {
  if (['FT', 'AET', 'PEN'].includes(short)) return 'finished';
  if (['1H', '2H', 'HT', 'ET', 'P', 'LIVE', 'BT'].includes(short)) return 'live';
  return 'scheduled';
}

async function main() {
  if (!KEY) {
    console.log('[gen:fixtures] No API_FOOTBALL_KEY — keeping committed fixtures.json.');
    return;
  }

  const url = `https://v3.football.api-sports.io/fixtures?league=${LEAGUE}&season=${SEASON}`;
  let data;
  try {
    const res = await fetch(url, { headers: { 'x-apisports-key': KEY } });
    data = await res.json();
  } catch (err) {
    console.warn('[gen:fixtures] API fetch failed, keeping fixtures.json:', err.message);
    return;
  }

  const apiFixtures = data?.response || [];
  if (!apiFixtures.length) {
    console.log('[gen:fixtures] API returned no fixtures — no change.');
    return;
  }

  // Index API fixtures by normalized "home|away".
  const byPair = new Map();
  for (const f of apiFixtures) {
    const h = norm(f.teams?.home?.name);
    const a = norm(f.teams?.away?.name);
    if (h && a) byPair.set(`${h}|${a}`, f);
  }

  const fixtures = JSON.parse(await readFile(FIXTURES_PATH, 'utf8'));
  let updated = 0;
  for (const fx of fixtures) {
    const match = byPair.get(`${norm(fx.home)}|${norm(fx.away)}`);
    if (!match) continue;
    const short = match.fixture?.status?.short;
    const status = statusFromApi(short);
    const hs = match.goals?.home;
    const as = match.goals?.away;
    if (status !== fx.status || hs !== fx.homeScore || as !== fx.awayScore) {
      fx.status = status;
      fx.homeScore = hs ?? null;
      fx.awayScore = as ?? null;
      updated++;
    }
  }

  if (updated) {
    await writeFile(FIXTURES_PATH, JSON.stringify(fixtures, null, 2) + '\n');
    console.log(`[gen:fixtures] Updated ${updated} fixture(s).`);
  } else {
    console.log('[gen:fixtures] No fixture changes.');
  }
}

main();
