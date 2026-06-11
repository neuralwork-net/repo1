// Build-time mystery-player dataset refresher.
//
// Runs in GitHub Actions before `astro build`. If API_FOOTBALL_KEY is set, it
// pulls current national-team squads from api-sports.io and refreshes each
// committed player's shirt number and age by matching on normalized names.
// With no key it validates the committed players.json and exits cleanly — so
// local/dev builds never break.
//
// Env (all optional):
//   API_FOOTBALL_KEY - api-sports.io key (secret). No key => validate only.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const PLAYERS_PATH = fileURLToPath(
  new URL('../src/data/players.json', import.meta.url),
);

const KEY = process.env.API_FOOTBALL_KEY;

function norm(name) {
  return (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z ]/g, '')
    .trim();
}

async function api(path) {
  const res = await fetch(`https://v3.football.api-sports.io${path}`, {
    headers: { 'x-apisports-key': KEY },
  });
  if (!res.ok) throw new Error(`API ${path} -> ${res.status}`);
  const body = await res.json();
  return body.response || [];
}

function validate(players) {
  const ids = new Set();
  const errors = [];
  for (const p of players) {
    if (ids.has(p.id)) errors.push(`duplicate id: ${p.id}`);
    ids.add(p.id);
    for (const k of ['id', 'name', 'nation', 'confederation', 'position', 'birthYear', 'club', 'league', 'shirt']) {
      if (p[k] === undefined || p[k] === '') errors.push(`${p.id}: missing ${k}`);
    }
    if (!['GK', 'DEF', 'MID', 'FWD'].includes(p.position)) errors.push(`${p.id}: bad position`);
  }
  if (errors.length) {
    console.error('[gen:players] Validation failed:\n' + errors.join('\n'));
    process.exit(1);
  }
}

async function main() {
  const players = JSON.parse(await readFile(PLAYERS_PATH, 'utf8'));
  validate(players);

  if (!KEY) {
    console.log(`[gen:players] No API_FOOTBALL_KEY — committed players.json OK (${players.length} players).`);
    return;
  }

  const nations = [...new Set(players.map((p) => p.nation))];
  let updated = 0;
  for (const nation of nations) {
    try {
      const teams = await api(`/teams?name=${encodeURIComponent(nation)}&country=${encodeURIComponent(nation)}`);
      const national = teams.find((t) => t.team?.national);
      if (!national) continue;
      const squads = await api(`/players/squads?team=${national.team.id}`);
      const squad = squads[0]?.players || [];
      for (const p of players.filter((x) => x.nation === nation)) {
        const match = squad.find((s) => norm(s.name) === norm(p.name) || norm(s.name).includes(norm(p.name).split(' ').pop()));
        if (match?.number && match.number !== p.shirt) {
          p.shirt = match.number;
          updated++;
        }
        if (match?.age) {
          const by = new Date().getFullYear() - match.age;
          if (Math.abs(by - p.birthYear) <= 2) p.birthYear = by;
        }
      }
    } catch (err) {
      console.warn(`[gen:players] ${nation}: ${err.message} — keeping committed data.`);
    }
  }

  await writeFile(PLAYERS_PATH, JSON.stringify(players, null, 0).replace(/},{/g, '},\n{') + '\n');
  console.log(`[gen:players] Refreshed ${updated} shirt numbers across ${nations.length} nations.`);
}

main().catch((err) => {
  console.warn(`[gen:players] ${err.message} — keeping committed players.json.`);
});
