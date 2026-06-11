# Deployment Guide — World Sports Quiz

Everything needed to ship and operate the site. The site is a static Astro build
hosted free on **GitHub Pages**; predictions use an optional free **Cloudflare
Worker + D1** vote counter. No server, no monthly bill.

- **Repo:** `git@github.com:neuralwork-net/worldsportsquiz.com.git`
- **Domain:** `worldsportsquiz.com`
- **Worker (votes):** `https://wsq-votes.maruf-csdu.workers.dev`

---

## 0. Prerequisites

- Node 18+ and npm (build needs Node 18+; CI uses Node 22)
- Git push access to the repo (must be a collaborator/member of `neuralwork-net`)
- A Cloudflare account (only for the prediction vote counter)
- `wrangler` via `npx` (no global install needed)

---

## 1. Local development

```bash
cd /mnt/volume2/apps/world-cup
npm install
npm run dev        # http://localhost:4321
npm run build      # static output in dist/
npm run preview    # serve the built dist/
```

Pages to smoke-test locally:

- `/` — homepage + predict CTAs
- `/predict/` — fixtures grouped by date
- `/predict/m1/` — a group fixture (pick → highlight + bar)
- `/predict/bracket/` — tap teams through to a champion
- `/predict/champion/` — pick the winner
- `/quiz/<slug>/1/` — play any quiz

> Community % bars on localhost require the worker to allow the dev origin —
> see §4.3.

---

## 2. Ship the site (GitHub Pages)

Pushing to `main` triggers the GitHub Actions workflow
(`.github/workflows/deploy.yml`): it generates the daily quiz, refreshes
fixtures, builds, and deploys to Pages.

```bash
git add -A
git commit -m "..."
git push origin main
```

Then:

1. **Watch the build** — repo → **Actions** tab → newest run turns green (~1–2 min).
2. **One-time Pages setup** (if not already done): repo → **Settings → Pages** →
   Source = **GitHub Actions**.
3. Site goes live at the custom domain once DNS + HTTPS are set (§3).

The workflow also runs on a daily cron (`0 6 * * *`) and via **Actions → Run
workflow** (manual).

---

## 3. Custom domain + HTTPS (one-time)

1. Repo → **Settings → Pages → Custom domain** = `worldsportsquiz.com`.
   (`public/CNAME` is already committed.)
2. At the DNS registrar (Spaceship), add:
   - Apex `A` records → `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`
   - `www` `CNAME` → `neuralwork-net.github.io`
3. Wait for GitHub's "DNS check successful", then tick **Enforce HTTPS**
   (cert auto-provisions via Let's Encrypt).

Local browser shows `DNS_PROBE_FINISHED_NXDOMAIN` but public resolvers work? That
is local DNS cache lag — flush DNS or switch resolver to `1.1.1.1` / `8.8.8.8`.

Verify globally:

```bash
dig +short @1.1.1.1 worldsportsquiz.com   # expect the four 185.199.* IPs
```

---

## 4. Prediction vote counter (Cloudflare Worker + D1)

Optional. Without it, prediction pages still record personal picks and reveal
results — just no community % bar. Lives in `worker/`.

### 4.1 One-time setup

```bash
cd worker
npx wrangler login

# Create the D1 database, then paste the printed database_id into wrangler.toml
npx wrangler d1 create wsq-votes

# Create the table on the remote DB
npx wrangler d1 execute wsq-votes --remote --file=./schema.sql

# Deploy — prints the worker URL
npx wrangler deploy
```

`wrangler.toml` notes:
- D1 binding name is `wsq_votes` (must match `env.wsq_votes` in `src/index.ts`).
- `database_id` is already set to the created DB.

### 4.2 Wire it into the site

Already done — `src/lib/site.ts` has:

```ts
voteApi: 'https://wsq-votes.maruf-csdu.workers.dev',
```

If the worker URL ever changes, update this value, commit, and push.

### 4.3 Redeploy after editing the worker

Worker changes are **separate from git** — they only go live on
`npx wrangler deploy`. The CORS allowlist in `src/index.ts` currently permits:

- `https://worldsportsquiz.com`
- `https://www.worldsportsquiz.com`
- `http://localhost:4321`, `http://127.0.0.1:4321` (dev testing)

After any edit:

```bash
cd worker && npx wrangler deploy
```

Verify CORS:

```bash
curl -s -D - -o /dev/null \
  "https://wsq-votes.maruf-csdu.workers.dev/tally?poll=m1" \
  -H 'origin: http://localhost:4321' | grep -i access-control-allow-origin
# expect: access-control-allow-origin: http://localhost:4321
```

Smoke-test a vote:

```bash
curl -s -X POST https://wsq-votes.maruf-csdu.workers.dev/vote \
  -H 'content-type: application/json' -H 'origin: https://worldsportsquiz.com' \
  -d '{"poll":"test","option":"home"}'      # -> {"home":1}
```

Clear a junk/test poll:

```bash
cd worker && npx wrangler d1 execute wsq-votes --remote \
  --command "DELETE FROM votes WHERE poll_id='test'"
```

Free-tier limits: Workers 100k req/day, D1 ~100k writes/day — ample.

---

## 5. Optional integrations (`src/lib/site.ts`)

Fill in as accounts are approved; commit + push to apply. Empty = safe fallback.

| Key | What | Where to get it |
| --- | --- | --- |
| `adsenseClient` | `ca-pub-…` | Google AdSense (apply on the custom domain) |
| `ga4Id` / `plausibleDomain` | analytics | GA4 or Plausible |
| `emailFormEndpoint` | email capture POST URL | Formspree / Brevo |
| `voteApi` | vote counter URL | the deployed worker (§4) |
| `AFFILIATES.*` | results-page links | affiliate programs |

---

## 6. Live scores / auto fixture results (optional)

`scripts/generate-fixtures.mjs` updates fixture scores + status at build time
**only if** the `API_FOOTBALL_KEY` secret is set. Without it the committed
`src/data/fixtures.json` is used as-is (no-op).

1. Get an api-sports.io key (the direct account, header `x-apisports-key` —
   **not** the RapidAPI variant). Note: api-sports.io may no longer offer a free
   tier; paid plans start ~$19/mo.
2. Repo → **Settings → Secrets and variables → Actions → New repository secret**:
   - Name: `API_FOOTBALL_KEY`
   - Value: the key
3. The daily cron (or a manual workflow run) then fills scores and reveals
   results on `/predict/*` pages.

> If no key is added, edit `src/data/fixtures.json` by hand to set
> `status: "finished"` + `homeScore`/`awayScore` for any match.

---

## 7. SEO (already configured)

- `@astrojs/sitemap` generates `sitemap-index.xml` on build.
- `public/robots.txt` points crawlers to it.
- Canonical + og:url tags are in `src/layouts/Base.astro`.

After go-live: **Google Search Console** → add `worldsportsquiz.com` → submit
`https://worldsportsquiz.com/sitemap-index.xml`.

---

## 8. Adding content (no code)

- **Quiz:** drop a JSON file in `src/data/quizzes/` (copy an existing one). Optional
  `category`; set `daily: true` for the homepage daily quiz. Auto-appears in
  routes and hubs.
- **Fixtures:** edit `src/data/fixtures.json`.
- **Sport / tournament:** add an entry in `src/data/sports.ts`.

Commit + push → rebuild + redeploy automatically.

---

## 9. Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| Push denied (`Permission … denied`) | Account lacks write access to the repo. Push from an authorized machine, or add the user as a collaborator with Write. |
| No community % bar | Worker not reachable or origin blocked. Redeploy worker (§4.3); check CORS for your origin. Bars also need at least one vote. |
| Clicking a poll does nothing | Already voted in this browser (one vote per poll). Clear `wsq:voted:<poll>` in Local Storage, or use incognito. |
| Knockout fixture pages locked ("teams TBD") | Expected until the bracket fills. Set real teams in `fixtures.json` or let the API fill them. |
| `gen:fixtures` matched 0 fixtures | API plan/coverage limit for WC 2026, not a bug — committed `fixtures.json` still serves. |
| DNS NXDOMAIN locally | Local cache lag; flush DNS or use `1.1.1.1`. |

---

## 10. Quick deploy checklist

- [ ] `npm run build` green locally
- [ ] `git push origin main`
- [ ] Actions run green
- [ ] Worker deployed (`npx wrangler deploy`) if predictions changed
- [ ] Custom domain + HTTPS green (one-time)
- [ ] Integrations filled in `src/lib/site.ts` as approved
- [ ] Sitemap submitted to Search Console
