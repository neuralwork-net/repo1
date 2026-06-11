// Community-vote counter for World Sports Quiz predictions.
//
// Cloudflare Worker backed by D1. Two endpoints:
//   POST /vote   { poll, option }  -> increments and returns the poll's tally
//   GET  /tally?poll=<id>          -> returns the poll's tally
//
// CORS is locked to ALLOWED_ORIGINS. Deploy with `wrangler deploy` (see README).

export interface Env {
  DB: D1Database;
}

// Origins allowed to call the API. Add localhost for local testing if needed.
const ALLOWED_ORIGINS = new Set([
  'https://worldsportsquiz.com',
  'https://www.worldsportsquiz.com',
]);

// Guardrails so a single client can't bloat the DB with junk polls/options.
const MAX_POLL_LEN = 64;
const MAX_OPTION_LEN = 64;

function corsHeaders(origin: string | null): HeadersInit {
  const allow = origin && ALLOWED_ORIGINS.has(origin) ? origin : '';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(data: unknown, origin: string | null, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
  });
}

async function tally(env: Env, poll: string): Promise<Record<string, number>> {
  const { results } = await env.DB.prepare(
    'SELECT option, count FROM votes WHERE poll_id = ?',
  )
    .bind(poll)
    .all<{ option: string; count: number }>();
  const out: Record<string, number> = {};
  for (const row of results ?? []) out[row.option] = row.count;
  return out;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin');
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // Reject cross-origin callers we don't recognise.
    if (origin && !ALLOWED_ORIGINS.has(origin)) {
      return json({ error: 'forbidden' }, origin, 403);
    }

    if (request.method === 'GET' && url.pathname === '/tally') {
      const poll = url.searchParams.get('poll');
      if (!poll) return json({ error: 'missing poll' }, origin, 400);
      return json(await tally(env, poll), origin);
    }

    if (request.method === 'POST' && url.pathname === '/vote') {
      let body: { poll?: string; option?: string };
      try {
        body = await request.json();
      } catch {
        return json({ error: 'bad json' }, origin, 400);
      }
      const poll = (body.poll || '').trim();
      const option = (body.option || '').trim();
      if (!poll || !option) return json({ error: 'missing poll/option' }, origin, 400);
      if (poll.length > MAX_POLL_LEN || option.length > MAX_OPTION_LEN) {
        return json({ error: 'too long' }, origin, 400);
      }
      await env.DB.prepare(
        `INSERT INTO votes (poll_id, option, count) VALUES (?, ?, 1)
         ON CONFLICT(poll_id, option) DO UPDATE SET count = count + 1`,
      )
        .bind(poll, option)
        .run();
      return json(await tally(env, poll), origin);
    }

    return json({ error: 'not found' }, origin, 404);
  },
};
