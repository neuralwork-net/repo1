# World Sports Quiz

Static, multi-sport quiz site built with **Astro + Tailwind**, hosted free on **GitHub Pages**. Launch event: FIFA World Cup 2026. Target: ~$1k ad/sponsor revenue this tournament.

See `planning.md` for the full strategy + revenue model.

## Local dev

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
npm run preview  # preview the built site
```

## Add content (no code)

- **A quiz:** drop a JSON file in `src/data/quizzes/` (copy an existing one). Set `daily: true` for the homepage daily quiz, optional `category` to group it. It auto-appears in routes, hubs, and the landing page.
- **A sport / tournament:** add an entry in `src/data/sports.ts`, then add matching quiz JSON.
- **Fixtures / predictions:** the 104 World Cup 2026 matches live in `src/data/fixtures.json` and drive `/predict/*` (one page per match + bracket + champion poll). Scores/status refresh at build via `scripts/generate-fixtures.mjs` when `API_FOOTBALL_KEY` is set.

## Predictions community counter (optional)

`/predict/*` pages can show live community vote percentages via a free
Cloudflare Worker + D1. See `worker/README.md` to deploy, then set
`INTEGRATIONS.voteApi` in `src/lib/site.ts`. Left empty, prediction pages still
record personal picks and reveal results — just without the community bar.

## Go-live checklist (do in order)

1. **Apply for AdSense first** (approval is the bottleneck). Use the custom domain.
2. **Register `worldsportsquiz.com`** and create a GitHub repo.
3. Push this code to `main`:
   ```bash
   git init && git add -A && git commit -m "Launch quiz site"
   git branch -M main
   git remote add origin git@github.com:<you>/<repo>.git
   git push -u origin main
   ```
4. **Enable GitHub Pages:** repo Settings → Pages → Source = **GitHub Actions**.
5. **Custom domain:** Settings → Pages → Custom domain = `worldsportsquiz.com`. The `public/CNAME` file is already committed. Add DNS at your registrar:
   - apex `A` records → `185.199.108.153`, `.109.153`, `.110.153`, `.111.153`
   - `www` `CNAME` → `<you>.github.io`
   - Wait for "HTTPS enforced" to go green.
6. **Fill integrations** in `src/lib/site.ts`:
   - `adsenseClient` (`ca-pub-…`) once AdSense approves
   - `ga4Id` or `plausibleDomain` for analytics
   - `emailFormEndpoint` (Formspree/Brevo form POST URL)
   - `voteApi` (Cloudflare Worker URL for prediction community votes — see `worker/README.md`)
   - `AFFILIATES` links on results pages
7. **Daily quiz auto-refresh (optional):** add repo secret `API_FOOTBALL_KEY` (api-sports.io). The scheduled Action rebuilds daily and injects the latest match result. Without the key it safely no-ops.

## How revenue works here

- **Per-question pages** (`/quiz/<slug>/<n>/`) = a real pageview + ad load per question → ~10 impressions per completed quiz.
- **Score-share card** on the results page = the viral loop (WhatsApp/X/Telegram/FB).
- **`/sponsor`** page sells branded quizzes + banners (the no-traffic-threshold income).
- **Email capture** on results builds a list for free re-traffic each tournament.
