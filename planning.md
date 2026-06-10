# Multi-Sport Quiz Site — Plan (World Cup 2026 launch)

## Context
Goal: launch a **sports quiz site covering all sports and tournaments**, attract traffic, earn ad revenue. FIFA World Cup 2026 is the **launch event** to bootstrap cold-start traffic (opener ~25h out; ~104 matches, ~5–6 week runway). Site is **not** World Cup-only — durable, multi-sport, multi-tournament; domain/brand tournament-neutral (e.g. worldsportsquiz.com).

Starting conditions: **cold start** — new domain, no audience, no ad account, no budget.

### Target: $1k this World Cup season (locked, realistic)
- **Display-led math:** RPM $4–5 → need **~200–250k pageviews ≈ ~25–30k sessions** (8 PV/session) over 5–6 weeks = **~700–850 sessions/day**. Hittable with daily social seeding.
- **Mixed path (de-risks AdSense approval lag):**
  - 1 sponsored quiz (local biz / betting site): **$300–500** — no traffic threshold, closes the gap alone. This is the insurance.
  - Display on ~150k PV: **~$500–700**.
  - Affiliate on results (merch/streaming/tickets): **$50–150**.
  - **= $1k even if traffic underperforms.**
- **Make-or-break:** daily shareable quiz + score card pushed to Reddit/TikTok/WhatsApp groups each match day. ~800 sessions/day is small — one good share thread per match day covers it.

### Reality check (read before building)
- **Quiz-only site = display-ads volume game.** No betting-affiliate "predict→bet" adjacency, so the high-CPA lever is gone. Revenue depends on raw impressions.
- **$10k in month one is very unlikely** (needs ~1.5–3M+ PV). $10k = **1-year, multi-tournament goal**. **This season target = $1k.**
- **SEO won't rank in time** (new domain). Cold-start traffic = social/viral sharing of quiz scores.
- **Quiz's edge = impressions-per-session multiplier.** Built right, one visit = many ad views.

### Monetization stack (priority order)
1. **Display ads (core).** AdSense day 1 → migrate to **Ezoic** ASAP (low entry bar, ~2–4× AdSense RPM) → AdThrive/Mediavine later (needs ~100k sessions/mo). House-ad/affiliate fallback fills slots while AdSense pending.
2. **Sponsored quizzes.** Brand/betting site pays for a branded quiz — direct deal, no traffic threshold. Real money early.
3. **Affiliate on results page.** Merch, tickets, streaming, fantasy/DFS. Geo-gate any betting links (jurisdiction-restricted; skip where illegal).
4. **Email capture at score reveal.** Builds a list = free re-traffic for every future tournament. The real compounding asset, beyond ad pennies.

## Build Plan

### Hosting: GitHub Pages (static, free, Fastly CDN)
- **Why:** free CDN bandwidth, no surprise bill on a viral spike (vs Vercel free tier overage throttle/billing). Quiz site is mostly static → ideal fit. Handles traffic via Fastly.
- **Constraints + how we work around them:**
  - **Static only — no server/SSR/API.** Quiz data = static JSON in repo. Trivia isn't live data, so fine.
  - **No server cron** → **GitHub Actions scheduled build**: pull tournament results via sports API at build time, regenerate the daily quiz, redeploy. Freshness with zero server.
  - **No server email capture** → third-party form service (Formspree / Brevo / ConvertKit) via client POST.
  - **Ads + analytics** = client-side JS (AdSense, GA4/Plausible) — works on static.
  - **Custom domain required:** `worldsportsquiz.com` via CNAME (AdSense distrusts `*.github.io`; custom domain = approval + legitimacy). HTTPS auto-provisioned by GitHub.
  - **API keys** live only in GitHub Actions secrets (build-time), never shipped to client.
- **Limits to respect:** soft ~100GB/mo bandwidth + 1GB site size (quiz pages are tiny → millions of views fit), ~10 builds/hr (daily Actions build is fine).

### Stack
- **Astro** (static-site generator) — tiny JS bundle, fast Core Web Vitals → better AdSense RPM + future SEO. Interactive **islands** for the quiz player. (Next.js `output: 'export'` also works but heavier; Astro preferred.)
- **Tailwind** for fast UI.
- **Data:** **static question banks** (JSON in repo) — curated trivia, no runtime API. Sports data API (`api-football` etc.) used **only at build time in GitHub Actions** to auto-generate fresh tournament questions (recent results, scorers). Email/list via third-party form (Formspree/Brevo/ConvertKit).
- **Analytics:** GA4 or Plausible (client JS) — needed to prove traffic to sponsors.

### Engagement / impressions design (critical for revenue)
- **One question = one real prerendered page/URL** (`/quiz/[slug]/q1`, `/q2`, …). Every "next" is a real navigation = real pageview + fresh ad load. On static GitHub Pages this beats SPA ad-refresh and maxes impressions. A 10-question quiz = ~10 pageviews/session (5× a single-page quiz). Biggest revenue lever.
- Carry quiz state (score, answers) in URL params / localStorage across the prerendered pages — no server needed.
- **Score reveal gated by email capture** (optional but high-value for the list).
- **Shareable score card** ("I scored 9/10 on the World Cup quiz — beat me") with prefilled WhatsApp/X/Telegram/FB buttons = the cold-start viral engine.
- **Leaderboard + daily quiz** = repeat visits across the tournament.

### Routing model (multi-sport, multi-tournament)
Sport + tournament + quiz are data dimensions, never hardcoded. One engine, infinite quizzes:
- `/` — landing: featured/daily quizzes, trending, category grid (Football, Cricket, Basketball, Tennis, …).
- `/[sport]` — sport hub (e.g. `/football`).
- `/[sport]/[tournament]` — e.g. `/football/world-cup-2026`: tournament quizzes hub.
- `/quiz/[slug]` — a quiz (the question-per-step player).
- Adding a sport/tournament/quiz later = data/config entries + same components, no rebuild.

### Quiz types (ship a few formats)
- Trivia ("Who won the 2014 final?"), guess-the-player, predict-the-result (fun, not betting), daily challenge, "how well do you know team X".
- Auto-generate some from live results during the tournament to stay fresh.

## Traffic playbook (the hard 70%)
- Pre-seed quizzes in football subreddits, X, TikTok, Telegram/WhatsApp groups **before kickoff** (next 25h).
- One shareable quiz per match day tied to the day's drama (upsets, star players).
- Short-form video (TikTok/Reels/Shorts): "can you score 10/10?" = high organic reach, zero budget.
- Score-share card is the loop: every player who shares recruits more players.

## Realistic revenue expectation
- **This tournament: $200–1500** (display-led + maybe 1–2 sponsored quizzes).
- **$10k = 1-year goal** across many tournaments as audience + email list + domain age + ad RPM tier (Ezoic→AdThrive) compound.

## Launch checklist
1. Astro site builds + deploys to GitHub Pages via GitHub Actions; custom domain (worldsportsquiz.com) live with HTTPS.
2. Per-question prerendered pages navigate correctly on mobile; score carries via URL/localStorage; ad slots render.
3. Score-share card generates correct prefilled links on mobile.
4. AdSense applied hour 1 (custom domain); house/affiliate fallback fills slots while pending; Ezoic signup queued.
5. Email capture (third-party form) stores addresses end-to-end.
6. Analytics firing.

## Phase 1 (next 25h, in order)
1. Apply AdSense **first** on the custom domain (gates revenue). Queue Ezoic.
2. Register **tournament-neutral, multi-sport domain** (e.g. worldsportsquiz.com). Create GitHub repo, scaffold Astro + Tailwind, set up GitHub Actions deploy to Pages, point CNAME → HTTPS.
3. Build config-driven quiz engine (static JSON banks); seed **World Cup 2026 football quizzes**. Per-question prerendered pages + shareable score card.
4. Wire ad slots (with fallback) + email capture (third-party form) at score reveal.
5. Add GitHub Actions scheduled build to regenerate the daily quiz from build-time API data.
6. Pre-seed quizzes to social/groups before kickoff.
7. Fast-follow: leaderboard, more sports/tournaments, sponsored-quiz outreach.
