import type { Quiz } from './types';

// Eagerly import every quiz JSON in data/quizzes. Add a file → it appears.
const modules = import.meta.glob<{ default: Quiz }>('../data/quizzes/*.json', {
  eager: true,
});

export const QUIZZES: Quiz[] = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => a.title.localeCompare(b.title));

export function getQuiz(slug: string): Quiz | undefined {
  return QUIZZES.find((q) => q.slug === slug);
}

export function quizzesFor(sport: string, tournament: string): Quiz[] {
  return QUIZZES.filter((q) => q.sport === sport && q.tournament === tournament);
}

export function dailyQuiz(): Quiz | undefined {
  return QUIZZES.find((q) => q.daily);
}

export function quizzesForTeams(teamNames: string[], tournament = 'world-cup-2026'): Quiz[] {
  const specific = QUIZZES.filter((q) =>
    q.teams?.some((t) => teamNames.includes(t))
  );
  if (specific.length > 0) return specific.slice(0, 3);
  // Fallback: general quizzes for this tournament (no team tag, not daily)
  return QUIZZES.filter((q) => q.tournament === tournament && !q.teams && !q.daily).slice(0, 2);
}
