# Prediction vote counter (Cloudflare Worker + D1)

Free serverless tally for the `/predict/*` pages. The static site POSTs each
vote and reads back community percentages. Optional — with no worker configured,
prediction pages still record personal picks and reveal results, just without
the community bar.

## One-time deploy

Prereqs: a free Cloudflare account and `npm i -g wrangler` (or `npx wrangler`).

```bash
cd worker
wrangler login

# 1. Create the D1 database, then paste the printed database_id into wrangler.toml
wrangler d1 create wsq-votes

# 2. Create the table (run on the remote DB)
wrangler d1 execute wsq-votes --remote --file=./schema.sql

# 3. Deploy the worker
wrangler deploy
```

`wrangler deploy` prints a URL like `https://wsq-votes.<subdomain>.workers.dev`.

## Wire it into the site

Set the base URL in `src/lib/site.ts`:

```ts
voteApi: 'https://wsq-votes.<subdomain>.workers.dev',
```

Commit + push → GitHub Pages redeploys and the community bars go live.

### Custom subdomain (optional)

If the domain is on Cloudflare, uncomment the `routes` block in `wrangler.toml`,
redeploy, and set `voteApi: 'https://api.worldsportsquiz.com'`.

## Free-tier limits

Workers 100k requests/day, D1 ~100k writes/day — ample for this traffic.

## CORS

`src/index.ts` only accepts requests from the origins in `ALLOWED_ORIGINS`.
Add a localhost origin there if testing votes locally.
