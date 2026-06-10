// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Custom domain on GitHub Pages → site is the apex domain, base is '/'.
// If you ever deploy to <user>.github.io/<repo> instead, set base: '/<repo>/'.
export default defineConfig({
  site: 'https://worldsportsquiz.com',
  base: '/',
  output: 'static',
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()],
  },
});
