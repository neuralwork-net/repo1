import sharp from 'sharp';
import { writeFileSync } from 'fs';

// 1200×630 — standard OG image size
const W = 1200;
const H = 630;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0b6b3a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#064d2a;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bg)" />

  <!-- Subtle pitch lines -->
  <rect x="60" y="60" width="${W - 120}" height="${H - 120}" rx="16"
        fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2" />
  <line x1="${W / 2}" y1="60" x2="${W / 2}" y2="${H - 60}"
        stroke="rgba(255,255,255,0.06)" stroke-width="2" />
  <circle cx="${W / 2}" cy="${H / 2}" r="80"
          fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="2" />

  <!-- Trophy SVG (centered at 600,200, scaled ~2x) -->
  <g transform="translate(510, 100) scale(3)">
    <!-- cup body -->
    <path d="M20 4 H60 L54 36 Q50 50 40 50 Q30 50 26 36 Z"
          fill="rgba(255,215,0,0.9)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" />
    <!-- handles -->
    <path d="M20 10 Q6 12 8 26 Q10 36 26 36" fill="none"
          stroke="rgba(255,215,0,0.9)" stroke-width="5" stroke-linecap="round" />
    <path d="M60 10 Q74 12 72 26 Q70 36 54 36" fill="none"
          stroke="rgba(255,215,0,0.9)" stroke-width="5" stroke-linecap="round" />
    <!-- stem -->
    <rect x="36" y="50" width="8" height="14" rx="2" fill="rgba(255,215,0,0.9)" />
    <!-- base -->
    <rect x="28" y="64" width="24" height="6" rx="3" fill="rgba(255,215,0,0.9)" />
    <!-- shine -->
    <path d="M30 12 Q36 10 38 20" fill="none"
          stroke="rgba(255,255,255,0.4)" stroke-width="3" stroke-linecap="round" />
  </g>

  <!-- Site name -->
  <text x="${W / 2}" y="360" font-size="72" font-weight="900" text-anchor="middle"
        font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif"
        fill="white" letter-spacing="-1">World Sports Quiz</text>

  <!-- Tagline -->
  <text x="${W / 2}" y="430" font-size="34" text-anchor="middle"
        font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif"
        fill="rgba(255,255,255,0.7)">Test your football knowledge. Challenge your friends.</text>

  <!-- URL pill -->
  <rect x="${W / 2 - 200}" y="480" width="400" height="52" rx="26"
        fill="rgba(255,255,255,0.12)" />
  <text x="${W / 2}" y="514" font-size="26" text-anchor="middle"
        font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif"
        fill="rgba(255,255,255,0.85)">worldsportsquiz.com</text>
</svg>`;

const png = await sharp(Buffer.from(svg)).png().toBuffer();
writeFileSync('public/og.png', png);
console.log('✅ public/og.png generated (' + Math.round(png.length / 1024) + ' KB)');
