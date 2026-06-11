import type { APIRoute } from 'astro';
import { QUIZZES } from '../lib/quizzes';
import { FIXTURES, fixtureUrl, isFinished, ROUND_LABELS } from '../lib/predictions';
import { SITE } from '../lib/site';

function esc(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export const GET: APIRoute = () => {
  const now = new Date().toUTCString();

  const quizItems = QUIZZES.filter((q) => !q.daily).map(
    (q) => `<item>
      <title>${esc(q.title)} — Free Quiz</title>
      <link>${SITE.url}/quiz/${q.slug}/</link>
      <guid isPermaLink="true">${SITE.url}/quiz/${q.slug}/</guid>
      <description>${esc(q.description)}</description>
    </item>`,
  );

  const upcoming = FIXTURES.filter((f) => !f.tbd && !isFinished(f)).slice(0, 20);
  const matchItems = upcoming.map(
    (f) => `<item>
      <title>${esc(`${f.home} vs ${f.away} — who wins?`)}</title>
      <link>${SITE.url}${fixtureUrl(f)}</link>
      <guid isPermaLink="true">${SITE.url}${fixtureUrl(f)}</guid>
      <description>${esc(`Predict ${f.home} vs ${f.away} — ${ROUND_LABELS[f.round]}, ${f.kickoff} at ${f.venue}. FIFA World Cup 2026.`)}</description>
    </item>`,
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${esc(SITE.name)}</title>
    <link>${SITE.url}/</link>
    <description>${esc(SITE.description)}</description>
    <language>en</language>
    <lastBuildDate>${now}</lastBuildDate>
    ${matchItems.join('\n    ')}
    ${quizItems.join('\n    ')}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
