export interface Question {
  q: string;
  options: string[];
  /** index into options of the correct answer */
  answer: number;
  /** optional one-line explanation shown after answering */
  explain?: string;
}

export interface Quiz {
  slug: string;
  title: string;
  /** sport id, e.g. 'football' */
  sport: string;
  /** tournament id, e.g. 'world-cup-2026' */
  tournament: string;
  description: string;
  emoji?: string;
  /** grouping label for hubs, e.g. 'History', 'Teams', 'Players' */
  category?: string;
  /** mark the auto-generated daily quiz */
  daily?: boolean;
  questions: Question[];
}

export type FixtureRound = 'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'bronze' | 'final';
export type FixtureStatus = 'scheduled' | 'live' | 'finished';

export interface Fixture {
  /** stable id, e.g. 'm1' */
  id: string;
  /** match number 1–104 */
  match: number;
  round: FixtureRound;
  /** group letter for group-stage matches, else null */
  group: string | null;
  /** team name, or a TBD descriptor like 'Winner Match 73' for knockouts */
  home: string;
  away: string;
  /** true when home/away are placeholders (teams not yet decided) */
  tbd: boolean;
  /** ISO date 'YYYY-MM-DD' */
  kickoff: string;
  venue: string;
  status: FixtureStatus;
  homeScore: number | null;
  awayScore: number | null;
}

export interface Tournament {
  id: string;
  name: string;
  emoji?: string;
  blurb?: string;
}

export interface Sport {
  id: string;
  name: string;
  emoji?: string;
  tournaments: Tournament[];
}
