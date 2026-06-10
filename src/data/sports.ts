import type { Sport } from '../lib/types';

// Config-driven catalogue. Add a sport/tournament here + drop quiz JSON in
// src/data/quizzes/ and the whole site (landing, hubs, routes) picks it up.
export const SPORTS: Sport[] = [
  {
    id: 'football',
    name: 'Football',
    emoji: '⚽',
    tournaments: [
      {
        id: 'world-cup-2026',
        name: 'World Cup 2026',
        emoji: '🏆',
        blurb: '48 teams, 104 matches across USA, Canada & Mexico. Test your knowledge.',
      },
    ],
  },
  // Future: cricket, basketball, tennis... just add entries + quiz JSON.
];

export function findSport(id: string): Sport | undefined {
  return SPORTS.find((s) => s.id === id);
}

export function findTournament(sportId: string, tournamentId: string) {
  return findSport(sportId)?.tournaments.find((t) => t.id === tournamentId);
}
