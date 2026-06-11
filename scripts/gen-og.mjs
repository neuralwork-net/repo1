import sharp from 'sharp';
import { writeFileSync, mkdirSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';

// 1200×630 — standard OG image size
const W = 1200;
const H = 630;

const FONT = '-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif';

function esc(s) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

/** Split a title into at most two roughly balanced lines. */
function splitLines(title, maxChars = 24) {
  if (title.length <= maxChars) return [title];
  const words = title.split(' ');
  let line1 = '';
  for (const w of words) {
    if ((line1 + ' ' + w).trim().length > title.length / 2 && line1) break;
    line1 = (line1 + ' ' + w).trim();
  }
  return [line1, title.slice(line1.length).trim()];
}

const frame = `
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0b6b3a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#064d2a;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)" />
  <rect x="60" y="60" width="${W - 120}" height="${H - 120}" rx="16"
        fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2" />
  <line x1="${W / 2}" y1="60" x2="${W / 2}" y2="${H - 60}"
        stroke="rgba(255,255,255,0.06)" stroke-width="2" />
  <circle cx="${W / 2}" cy="${H / 2}" r="80"
          fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="2" />`;

const trophy = (x, y, scale) => `
  <g transform="translate(${x}, ${y}) scale(${scale})">
    <path d="M20 4 H60 L54 36 Q50 50 40 50 Q30 50 26 36 Z"
          fill="rgba(255,215,0,0.9)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" />
    <path d="M20 10 Q6 12 8 26 Q10 36 26 36" fill="none"
          stroke="rgba(255,215,0,0.9)" stroke-width="5" stroke-linecap="round" />
    <path d="M60 10 Q74 12 72 26 Q70 36 54 36" fill="none"
          stroke="rgba(255,215,0,0.9)" stroke-width="5" stroke-linecap="round" />
    <rect x="36" y="50" width="8" height="14" rx="2" fill="rgba(255,215,0,0.9)" />
    <rect x="28" y="64" width="24" height="6" rx="3" fill="rgba(255,215,0,0.9)" />
    <path d="M30 12 Q36 10 38 20" fill="none"
          stroke="rgba(255,255,255,0.4)" stroke-width="3" stroke-linecap="round" />
  </g>`;

const urlPill = (y) => `
  <rect x="${W / 2 - 200}" y="${y}" width="400" height="52" rx="26"
        fill="rgba(255,255,255,0.12)" />
  <text x="${W / 2}" y="${y + 34}" font-size="26" text-anchor="middle"
        font-family="${FONT}" fill="rgba(255,255,255,0.85)">worldsportsquiz.com</text>`;

// ---------- 1. Default site-wide image ----------

const homeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  ${frame}
  ${trophy(510, 100, 3)}
  <text x="${W / 2}" y="360" font-size="72" font-weight="900" text-anchor="middle"
        font-family="${FONT}" fill="white" letter-spacing="-1">World Sports Quiz</text>
  <text x="${W / 2}" y="430" font-size="34" text-anchor="middle"
        font-family="${FONT}" fill="rgba(255,255,255,0.7)">Test your football knowledge. Challenge your friends.</text>
  ${urlPill(480)}
</svg>`;

// ---------- 2. Per-quiz images ----------

function quizSvg(quiz) {
  const lines = splitLines(quiz.title, 26);
  const size = lines.some((l) => l.length > 22) ? 56 : 68;
  const titleText =
    lines.length === 1
      ? `<text x="${W / 2}" y="330" font-size="${size}" font-weight="900" text-anchor="middle"
           font-family="${FONT}" fill="white" letter-spacing="-1">${esc(lines[0])}</text>`
      : `<text x="${W / 2}" y="300" font-size="${size}" font-weight="900" text-anchor="middle"
           font-family="${FONT}" fill="white" letter-spacing="-1">${esc(lines[0])}</text>
         <text x="${W / 2}" y="${300 + size + 14}" font-size="${size}" font-weight="900" text-anchor="middle"
           font-family="${FONT}" fill="white" letter-spacing="-1">${esc(lines[1])}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  ${frame}
  ${trophy(564, 78, 1.8)}
  <text x="${W / 2}" y="245" font-size="28" font-weight="700" text-anchor="middle"
        font-family="${FONT}" fill="rgba(244,194,13,0.95)" letter-spacing="6">FREE QUIZ</text>
  ${titleText}
  <text x="${W / 2}" y="445" font-size="32" text-anchor="middle"
        font-family="${FONT}" fill="rgba(255,255,255,0.75)">${quiz.questions.length} questions · Can you beat your friends?</text>
  ${urlPill(485)}
</svg>`;
}

// ---------- 3. Per-match images ----------

function slugify(s) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function fixtureSlug(f) {
  if (f.tbd) return `match-${f.match}`;
  return `${slugify(f.home)}-vs-${slugify(f.away)}`;
}

function fitTeamSize(name) {
  if (name.length <= 10) return 64;
  if (name.length <= 16) return 50;
  return 40;
}

function matchSvg(f) {
  const date = new Date(f.kickoff + 'T00:00:00Z').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  ${frame}
  <text x="${W / 2}" y="170" font-size="30" font-weight="700" text-anchor="middle"
        font-family="${FONT}" fill="rgba(244,194,13,0.95)" letter-spacing="6">WHO WINS?</text>
  <text x="${W / 2 - 130}" y="300" font-size="${fitTeamSize(f.home)}" font-weight="900" text-anchor="end"
        font-family="${FONT}" fill="white">${esc(f.home)}</text>
  <text x="${W / 2}" y="300" font-size="44" font-weight="700" text-anchor="middle"
        font-family="${FONT}" fill="rgba(255,255,255,0.45)">vs</text>
  <text x="${W / 2 + 130}" y="300" font-size="${fitTeamSize(f.away)}" font-weight="900" text-anchor="start"
        font-family="${FONT}" fill="white">${esc(f.away)}</text>
  <text x="${W / 2}" y="380" font-size="30" text-anchor="middle"
        font-family="${FONT}" fill="rgba(255,255,255,0.75)">FIFA World Cup 2026 · ${esc(date)}</text>
  <text x="${W / 2}" y="430" font-size="28" text-anchor="middle"
        font-family="${FONT}" fill="rgba(255,255,255,0.6)">Cast your prediction — see how the world votes</text>
  ${urlPill(480)}
</svg>`;
}

// ---------- 3b. Mystery Player game image ----------

const mysterySvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  ${frame}
  <circle cx="${W / 2}" cy="160" r="58" fill="rgba(255,255,255,0.1)" />
  <text x="${W / 2}" y="190" font-size="80" text-anchor="middle"
        font-family="${FONT}" fill="rgba(244,194,13,0.95)" font-weight="900">?</text>
  <text x="${W / 2}" y="290" font-size="28" font-weight="700" text-anchor="middle"
        font-family="${FONT}" fill="rgba(244,194,13,0.95)" letter-spacing="6">DAILY GAME</text>
  <text x="${W / 2}" y="370" font-size="68" font-weight="900" text-anchor="middle"
        font-family="${FONT}" fill="white" letter-spacing="-1">Mystery Player</text>
  <text x="${W / 2}" y="440" font-size="32" text-anchor="middle"
        font-family="${FONT}" fill="rgba(255,255,255,0.75)">Guess the World Cup star in 6 tries</text>
  ${urlPill(485)}
</svg>`;

// ---------- Generate ----------

async function render(svg, path) {
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  writeFileSync(path, png);
  return png.length;
}

// ---------- 4. PWA icons ----------

function iconSvg(size) {
  const s = size / 80; // trophy artwork is ~80 units wide
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.18}" fill="#0b6b3a" />
  ${trophy(size * 0.1, size * 0.08, s * 0.8)}
</svg>`;
}

mkdirSync('public/og', { recursive: true });

let bytes = await render(homeSvg, 'public/og.png');
bytes += await render(iconSvg(192), 'public/og/icon-192.png');
bytes += await render(iconSvg(512), 'public/og/icon-512.png');
bytes += await render(mysterySvg, 'public/og/mystery-player.png');
let count = 4;

const quizDir = 'src/data/quizzes';
for (const file of readdirSync(quizDir).filter((f) => f.endsWith('.json'))) {
  const quiz = JSON.parse(readFileSync(join(quizDir, file), 'utf8'));
  bytes += await render(quizSvg(quiz), `public/og/${quiz.slug}.png`);
  count++;
}

const fixtures = JSON.parse(readFileSync('src/data/fixtures.json', 'utf8'));
for (const f of fixtures) {
  if (f.tbd) continue; // TBD pages use the default image
  bytes += await render(matchSvg(f), `public/og/match-${fixtureSlug(f)}.png`);
  count++;
}

console.log(`✅ ${count} OG images generated (${Math.round(bytes / 1024 / 1024 * 10) / 10} MB total)`);
