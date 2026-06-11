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
