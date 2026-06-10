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
  /** mark the auto-generated daily quiz */
  daily?: boolean;
  questions: Question[];
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
