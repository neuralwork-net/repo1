export interface MysteryPlayer {
  id: string;
  name: string;
  nation: string;
  confederation: string;
  /** simplified position: GK | DEF | MID | FWD */
  position: string;
  birthYear: number;
  club: string;
  league: string;
  shirt: number;
}

export type ChipColor = 'green' | 'yellow' | 'gray';

export interface AttributeFeedback {
  color: ChipColor;
  /** 'up' = answer is higher than the guess, 'down' = lower (age, shirt) */
  arrow?: 'up' | 'down';
}

export interface Feedback {
  correct: boolean;
  nation: AttributeFeedback;
  position: AttributeFeedback;
  age: AttributeFeedback;
  league: AttributeFeedback;
  shirt: AttributeFeedback;
}

/** First puzzle day; puzzle number = days since EPOCH + 1. */
export const MYSTERY_EPOCH = '2026-06-11';

/** Deterministic 32-bit hash of a string (FNV-1a). */
export function dateSeed(isoDate: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < isoDate.length; i++) {
    h ^= isoDate.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Small deterministic PRNG so the daily pick is stable everywhere. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function puzzleNumber(isoDate: string): number {
  const days = Math.round(
    (Date.parse(isoDate) - Date.parse(MYSTERY_EPOCH)) / 864e5,
  );
  return days + 1;
}

export function pickDaily(players: MysteryPlayer[], isoDate: string): MysteryPlayer {
  const rand = mulberry32(dateSeed(isoDate));
  return players[Math.floor(rand() * players.length)];
}

export function compareGuess(guess: MysteryPlayer, answer: MysteryPlayer): Feedback {
  const num = (g: number, a: number, near: number): AttributeFeedback => ({
    color: g === a ? 'green' : Math.abs(g - a) <= near ? 'yellow' : 'gray',
    ...(g === a ? {} : { arrow: a > g ? 'up' : 'down' }) as { arrow?: 'up' | 'down' },
  });
  return {
    correct: guess.id === answer.id,
    nation: {
      color:
        guess.nation === answer.nation
          ? 'green'
          : guess.confederation === answer.confederation
            ? 'yellow'
            : 'gray',
    },
    position: { color: guess.position === answer.position ? 'green' : 'gray' },
    // birthYear comparison is inverted for age arrows: an earlier birth year
    // means an older player, so the arrow flips inside the page script — here
    // we report raw birthYear direction and let the UI label it.
    age: num(guess.birthYear, answer.birthYear, 2),
    league: { color: guess.league === answer.league ? 'green' : 'gray' },
    shirt: num(guess.shirt, answer.shirt, 3),
  };
}
