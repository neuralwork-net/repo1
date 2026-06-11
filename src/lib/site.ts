// Central site config. Public, build-time values only — never put secrets here.
export const SITE = {
  name: 'World Sports Quiz',
  domain: 'worldsportsquiz.com',
  url: 'https://worldsportsquiz.com',
  tagline: 'Test your sports knowledge. Beat your friends.',
  description:
    'Free sports quizzes across every major tournament — football, World Cup, and more. Play, score, and challenge your friends.',
};

// Monetization / integration switches. Fill these in as accounts get approved.
// Empty string = feature renders a safe fallback (house ad / disabled form).
export const INTEGRATIONS = {
  // Google AdSense publisher id, e.g. 'ca-pub-1234567890123456'. Empty until approved.
  adsenseClient: '',
  // GA4 measurement id, e.g. 'G-XXXXXXXXXX'. Empty disables analytics.
  ga4Id: 'G-21HGGPKR89',
  // Plausible domain (alternative to GA4). Empty disables.
  plausibleDomain: '',
  // Email capture: a third-party form POST endpoint (Formspree/Brevo/etc).
  // Empty disables the form gracefully.
  emailFormEndpoint: 'https://formspree.io/f/xkoavaqd',
  // Community-vote counter base URL (Cloudflare Worker). e.g.
  // 'https://api.worldsportsquiz.com'. Empty => prediction pages show personal
  // picks + result reveal only, with no community % bar (no errors).
  voteApi: 'https://wsq-votes.maruf-csdu.workers.dev',
};

// Affiliate links shown on results pages. Geo-gate betting client-side before showing.
export const AFFILIATES = {
  merch: '', // e.g. Fanatics / Amazon tag link
  streaming: '', // streaming service referral
  tickets: '', // ticket resale referral
};

export const SHARE_TEXT = (score: number, total: number, title: string) =>
  `I scored ${score}/${total} on the "${title}" quiz! Can you beat me?`;
