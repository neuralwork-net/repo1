import type { Fixture, Quiz } from './types';
import { FIXTURES, ROUND_LABELS, isFinished, outcome } from './predictions';
import { QUIZZES } from './quizzes';

export interface MatchContent {
  /** The question searchers ask, used as an H2 — e.g. "Who will win Mexico vs South Africa?" */
  question: string;
  /** Direct 2–3 sentence answer rendered immediately under the question. */
  answer: string;
  /** Key facts table rows. */
  facts: { label: string; value: string }[];
  /** One short background paragraph per team, when a team quiz exists. */
  teamNotes: { team: string; note: string }[];
}

const STAKES: Record<string, string> = {
  group: 'Three points here go a long way toward the knockout rounds — the top two in each group advance automatically, and the eight best third-placed teams also go through.',
  r32: 'It is win or go home: the Round of 32 is the first knockout round of the new 48-team format.',
  r16: 'A place in the quarter-finals is on the line — lose and the tournament is over.',
  qf: 'The winner is one match from a World Cup semi-final.',
  sf: 'The winner books a place in the World Cup final.',
  bronze: 'The third-place play-off — one last chance to leave the tournament with a win and a medal.',
  final: 'The biggest match in football: the winner lifts the World Cup.',
};

function longDate(kickoff: string): string {
  return new Date(kickoff + 'T00:00:00Z').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** Other teams a side faces in its group, from the fixture list itself. */
function groupOpponents(team: string, group: string): string[] {
  const teams = new Set<string>();
  for (const f of FIXTURES) {
    if (f.round !== 'group' || f.group !== group) continue;
    teams.add(f.home);
    teams.add(f.away);
  }
  teams.delete(team);
  return [...teams].sort();
}

/** The dedicated team quiz for a side, if one exists. */
function teamQuiz(team: string): Quiz | undefined {
  return QUIZZES.find((q) => q.slug.startsWith('team-') && q.teams?.length === 1 && q.teams[0] === team);
}

/** One factual background line for a team, reused from its quiz's explanations. */
function teamNote(team: string): string | null {
  const quiz = teamQuiz(team);
  const explain = quiz?.questions.find((q) => q.explain && q.explain.length > 60)?.explain;
  return explain ?? null;
}

function listWithAnd(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

export function buildMatchContent(f: Fixture): MatchContent | null {
  if (f.tbd) return null;

  const date = longDate(f.kickoff);
  const roundLabel = ROUND_LABELS[f.round];
  const finished = isFinished(f);
  const result = outcome(f);

  const question = finished
    ? `Who won ${f.home} vs ${f.away}?`
    : `Who will win ${f.home} vs ${f.away}?`;

  let answer: string;
  if (finished) {
    const score = `${f.homeScore}–${f.awayScore}`;
    if (result === 'draw') {
      answer = `${f.home} and ${f.away} drew ${score} at ${f.venue} on ${date} in the ${roundLabel.toLowerCase()} of the FIFA World Cup 2026 (match ${f.match}).`;
    } else {
      const winner = result === 'home' ? f.home : f.away;
      const loser = result === 'home' ? f.away : f.home;
      answer = `${winner} beat ${loser} ${score} at ${f.venue} on ${date} in the ${roundLabel.toLowerCase()} of the FIFA World Cup 2026 (match ${f.match}). See below how fans predicted it before kick-off.`;
    }
  } else if (f.round === 'group') {
    const others = groupOpponents(f.home, f.group!).filter((t) => t !== f.away);
    answer =
      `${f.home} play ${f.away} in Group ${f.group} of the FIFA World Cup 2026 on ${date} at ${f.venue} (match ${f.match}). ` +
      `Both sides also face ${listWithAnd(others)} in the group, so the result here shapes the race for the knockout rounds. ` +
      `Cast your prediction below and see how fans around the world are calling it.`;
  } else {
    answer =
      `${f.home} meet ${f.away} in the ${roundLabel} of the FIFA World Cup 2026 on ${date} at ${f.venue} (match ${f.match}). ` +
      `${STAKES[f.round]} ` +
      `Make your prediction below and see how fans around the world are calling it.`;
  }

  const facts: { label: string; value: string }[] = [
    { label: 'Match', value: `#${f.match} of 104` },
    { label: 'Round', value: f.round === 'group' ? `Group ${f.group} (group stage)` : roundLabel },
    { label: 'Date', value: date },
    { label: 'Venue', value: f.venue },
    { label: 'Tournament', value: 'FIFA World Cup 2026 — USA, Canada & Mexico' },
  ];
  if (finished) {
    facts.push({ label: 'Final score', value: `${f.home} ${f.homeScore}–${f.awayScore} ${f.away}` });
  } else if (f.round === 'group') {
    facts.push({ label: 'What’s at stake', value: STAKES.group });
  }

  const teamNotes: { team: string; note: string }[] = [];
  for (const team of [f.home, f.away]) {
    const note = teamNote(team);
    if (note) teamNotes.push({ team, note });
  }

  return { question, answer, facts, teamNotes };
}

/** Search-optimised meta description for a match page. */
export function matchDescription(f: Fixture): string {
  if (f.tbd) {
    return `${f.home} vs ${f.away} — ${ROUND_LABELS[f.round]}, FIFA World Cup 2026. Teams confirmed once the bracket fills in. Make your prediction.`;
  }
  const date = longDate(f.kickoff);
  if (isFinished(f)) {
    const result = outcome(f);
    const headline =
      result === 'draw'
        ? `${f.home} ${f.homeScore}–${f.awayScore} ${f.away}`
        : `${result === 'home' ? f.home : f.away} won ${f.homeScore}–${f.awayScore}`;
    return `${f.home} vs ${f.away} result: ${headline}. ${ROUND_LABELS[f.round]}, ${date} at ${f.venue} — FIFA World Cup 2026.`;
  }
  return `${f.home} vs ${f.away} prediction — ${ROUND_LABELS[f.round]}, ${date} at ${f.venue}, FIFA World Cup 2026. Vote for the winner and see live fan predictions.`;
}
