// Deterministic seeded "social proof" numbers for prediction polls.
//
// The vote worker only stores tiny real tallies on a fresh site, so polls look
// empty. These seeded baseline counts are blended on top of the real tally to
// make predictions feel busy. Numbers are stable for a given (poll, date) and
// grow each day — so a daily rebuild ticks them up without ever jumping around.
//
// Pure + dependency-free so it works in Astro frontmatter (build time) and in
// the bundled PollWidget client script. Pass `today` as a local YYYY-MM-DD
// string so build-time and client agree.

const EPOCH = '2026-06-11';

/** Deterministic 32-bit hash of a string (FNV-1a). */
function dateSeed(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Small deterministic PRNG. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function daysSinceEpoch(today: string): number {
  const d = Math.round((Date.parse(today) - Date.parse(EPOCH)) / 864e5);
  return d > 0 ? d : 0;
}

function countriesFor(total: number): number {
  return Math.min(190, Math.round(80 + Math.sqrt(total) / 3));
}

export interface PollStats {
  total: number;
  counts: Record<string, number>;
  countries: number;
}

export interface PollOpts {
  /** option value to bias toward ~50–62% (finished result / favourite) */
  favor?: string | null;
}

/**
 * Seeded prediction counts for one poll.
 * - total: per-poll base ~5k–60k + daily drift.
 * - counts: deterministic split across optionValues (favoured option leads).
 */
export function pollStats(
  pollId: string,
  today: string,
  optionValues: string[],
  opts: PollOpts = {},
): PollStats {
  const rand = mulberry32(dateSeed('poll:' + pollId));
  const base = 5000 + Math.floor(rand() * 55000); // 5k–60k
  const perDay = 200 + Math.floor(rand() * 1400); // 200–1600/day
  const total = base + daysSinceEpoch(today) * perDay;

  // Seeded weights per option; favoured option gets a strong boost.
  const weights = optionValues.map((v) => {
    let w = 0.4 + rand() * 0.6; // 0.4–1.0
    if (opts.favor && v === opts.favor) w += 1.4 + rand() * 0.6; // clear lead
    return w;
  });
  const sumW = weights.reduce((a, b) => a + b, 0);

  const counts: Record<string, number> = {};
  let assigned = 0;
  optionValues.forEach((v, i) => {
    const c = i === optionValues.length - 1
      ? total - assigned // last option absorbs rounding so sum == total
      : Math.round((weights[i] / sumW) * total);
    counts[v] = c;
    assigned += c;
  });

  return { total, counts, countries: countriesFor(total) };
}

export interface GlobalStats {
  predictions: number;
  voters: number;
  countries: number;
}

/** Site-wide seeded totals for the predict banner. Grow daily. */
export function globalStats(today: string): GlobalStats {
  const rand = mulberry32(dateSeed('global'));
  const base = 1_000_000 + Math.floor(rand() * 1_500_000); // 1.0M–2.5M
  const perDay = 15000 + Math.floor(rand() * 25000); // 15k–40k/day
  const predictions = base + daysSinceEpoch(today) * perDay;
  const voters = Math.round(predictions * 0.62);
  const countries = Math.min(180, 160 + (dateSeed('countries') % 21)); // 160–180
  return { predictions, voters, countries };
}

/** 1_800_000 -> "1.8M", 24_000 -> "24,000". */
export function formatCompact(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return (m >= 10 ? Math.round(m) : Math.round(m * 10) / 10) + 'M';
  }
  if (n >= 100_000) return Math.round(n / 1000) + 'K';
  return n.toLocaleString('en-US');
}
