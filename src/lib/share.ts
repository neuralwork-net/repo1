// Shared helpers for the viral share flow. Pure + dependency-free so they work
// in Astro frontmatter and in bundled client scripts.

/** Flag emoji for each qualified nation. Keys match fixtures.json team names. */
export const FLAGS: Record<string, string> = {
  Algeria: '🇩🇿',
  Argentina: '🇦🇷',
  Australia: '🇦🇺',
  Austria: '🇦🇹',
  Belgium: '🇧🇪',
  'Bosnia and Herzegovina': '🇧🇦',
  Brazil: '🇧🇷',
  'Cabo Verde': '🇨🇻',
  Canada: '🇨🇦',
  Colombia: '🇨🇴',
  'Congo DR': '🇨🇩',
  Croatia: '🇭🇷',
  'Curaçao': '🇨🇼',
  Czechia: '🇨🇿',
  "Côte d'Ivoire": '🇨🇮',
  Ecuador: '🇪🇨',
  Egypt: '🇪🇬',
  England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  France: '🇫🇷',
  Germany: '🇩🇪',
  Ghana: '🇬🇭',
  Haiti: '🇭🇹',
  'IR Iran': '🇮🇷',
  Iraq: '🇮🇶',
  Japan: '🇯🇵',
  Jordan: '🇯🇴',
  'Korea Republic': '🇰🇷',
  Mexico: '🇲🇽',
  Morocco: '🇲🇦',
  Netherlands: '🇳🇱',
  'New Zealand': '🇳🇿',
  Norway: '🇳🇴',
  Panama: '🇵🇦',
  Paraguay: '🇵🇾',
  Portugal: '🇵🇹',
  Qatar: '🇶🇦',
  'Saudi Arabia': '🇸🇦',
  Scotland: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  Senegal: '🇸🇳',
  'South Africa': '🇿🇦',
  Spain: '🇪🇸',
  Sweden: '🇸🇪',
  Switzerland: '🇨🇭',
  Tunisia: '🇹🇳',
  'Türkiye': '🇹🇷',
  USA: '🇺🇸',
  Uruguay: '🇺🇾',
  Uzbekistan: '🇺🇿',
};

export function flag(team: string): string {
  return FLAGS[team] || '';
}

/** True if `team` is a known qualified nation (guards challenge-banner input). */
export function validTeam(team: string): boolean {
  return Object.prototype.hasOwnProperty.call(FLAGS, team);
}

function withFlag(team: string): string {
  const f = flag(team);
  return f ? `${f} ${team}` : team;
}

/**
 * Personalized share text for a single match.
 * `pick` is 'home' | 'away' | 'draw' | null (no vote yet).
 */
export function predictionShareText(
  home: string,
  away: string,
  pick: string | null,
): string {
  if (pick === 'home') return `I'm backing ${withFlag(home)} to beat ${away} at the World Cup 2026 — agree? ⚽`;
  if (pick === 'away') return `I'm backing ${withFlag(away)} to beat ${home} at the World Cup 2026 — agree? ⚽`;
  if (pick === 'draw') return `I'm calling ${home} vs ${away} a draw at the World Cup 2026 🤝 — agree?`;
  return `Who wins — ${home} or ${away}? 🔮 Make your World Cup 2026 prediction`;
}

export function championShareText(team: string): string {
  return `I'm backing ${withFlag(team)} to win the World Cup 2026 🏆 Who's your pick?`;
}

/** Append challenge query params to a share URL (encodes the sender's result). */
export function withChallenge(url: string, params: Record<string, string>): string {
  const u = new URL(url);
  for (const [k, v] of Object.entries(params)) if (v) u.searchParams.set(k, v);
  return u.toString();
}

/** Parse a `?c=score-total` challenge param. Returns null if malformed. */
export function parseScore(raw: string | null, max?: number): { score: number; total: number } | null {
  if (!raw || !/^\d+-\d+$/.test(raw)) return null;
  const [score, total] = raw.split('-').map(Number);
  if (total <= 0 || score < 0 || score > total) return null;
  if (max && total > max) return null;
  return { score, total };
}

export interface NetworkHrefs {
  wa: string;
  x: string;
  tg: string;
  fb: string;
}

/** Build the per-network share URLs (matches the patterns already in use). */
export function networkHrefs(text: string, url: string): NetworkHrefs {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  return {
    wa: `https://wa.me/?text=${t}%20${u}`,
    x: `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
    tg: `https://t.me/share/url?url=${u}&text=${t}`,
    fb: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
  };
}
