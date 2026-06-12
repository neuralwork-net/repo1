import type { Fixture, FixtureRound } from './types';
import fixturesData from '../data/fixtures.json';

// All FIFA World Cup 2026 fixtures (committed fallback; refreshed at build time
// by scripts/generate-fixtures.mjs when API_FOOTBALL_KEY is set).
export const FIXTURES: Fixture[] = (fixturesData as Fixture[]).slice().sort(
  (a, b) => a.match - b.match,
);

export function getFixture(id: string): Fixture | undefined {
  return FIXTURES.find((f) => f.id === id);
}

function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function fixtureSlug(f: Fixture): string {
  if (f.tbd) return `match-${f.match}`;
  return `${slugify(f.home)}-vs-${slugify(f.away)}`;
}

export function fixtureUrl(f: Fixture): string {
  return `/predict/world-cup-2026/${fixtureSlug(f)}/`;
}

export function getFixtureByMatchSlug(matchSlug: string): Fixture | undefined {
  return FIXTURES.find((f) => fixtureSlug(f) === matchSlug);
}

export function allFixtures(): Fixture[] {
  return FIXTURES;
}

/** Group-stage fixtures keyed by group letter, in match order. */
export function fixturesByGroup(): Record<string, Fixture[]> {
  const out: Record<string, Fixture[]> = {};
  for (const f of FIXTURES) {
    if (f.round !== 'group' || !f.group) continue;
    (out[f.group] ??= []).push(f);
  }
  return out;
}

/** Distinct group letters, sorted (A, B, C, …). */
export function groupLetters(): string[] {
  return [...new Set(FIXTURES.filter((f) => f.group).map((f) => f.group!))].sort();
}

/** Fixtures grouped by kickoff date, in chronological order. */
export function fixturesByDate(): { date: string; fixtures: Fixture[] }[] {
  const map = new Map<string, Fixture[]>();
  for (const f of FIXTURES) {
    (map.get(f.kickoff) ?? map.set(f.kickoff, []).get(f.kickoff)!).push(f);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, fixtures]) => ({ date, fixtures }));
}

export const ROUND_LABELS: Record<FixtureRound, string> = {
  group: 'Group stage',
  r32: 'Round of 32',
  r16: 'Round of 16',
  qf: 'Quarter-final',
  sf: 'Semi-final',
  bronze: 'Third-place play-off',
  final: 'Final',
};

export function knockoutFixtures(): Fixture[] {
  return FIXTURES.filter((f) => f.round !== 'group');
}

/** Host city + ISO country for each 2026 venue — powers schema.org location.address. */
export const VENUE_INFO: Record<string, { city: string; country: string }> = {
  'Atlanta Stadium': { city: 'Atlanta', country: 'US' },
  'BC Place Vancouver': { city: 'Vancouver', country: 'CA' },
  'Boston Stadium': { city: 'Foxborough', country: 'US' },
  'Dallas Stadium': { city: 'Arlington', country: 'US' },
  'Estadio Guadalajara': { city: 'Guadalajara', country: 'MX' },
  'Estadio Monterrey': { city: 'Monterrey', country: 'MX' },
  'Houston Stadium': { city: 'Houston', country: 'US' },
  'Kansas City Stadium': { city: 'Kansas City', country: 'US' },
  'Los Angeles Stadium': { city: 'Inglewood', country: 'US' },
  'Mexico City Stadium': { city: 'Mexico City', country: 'MX' },
  'Miami Stadium': { city: 'Miami Gardens', country: 'US' },
  'New York New Jersey Stadium': { city: 'East Rutherford', country: 'US' },
  'Philadelphia Stadium': { city: 'Philadelphia', country: 'US' },
  'San Francisco Bay Area Stadium': { city: 'Santa Clara', country: 'US' },
  'Seattle Stadium': { city: 'Seattle', country: 'US' },
  'Toronto Stadium': { city: 'Toronto', country: 'CA' },
};

export function isFinished(f: Fixture): boolean {
  return f.status === 'finished' && f.homeScore != null && f.awayScore != null;
}

/** 'home' | 'draw' | 'away' for a finished fixture, else null. */
export function outcome(f: Fixture): 'home' | 'draw' | 'away' | null {
  if (!isFinished(f)) return null;
  if (f.homeScore! > f.awayScore!) return 'home';
  if (f.homeScore! < f.awayScore!) return 'away';
  return 'draw';
}
