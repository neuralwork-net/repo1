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
