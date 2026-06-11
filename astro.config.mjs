// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Custom domain on GitHub Pages → site is the apex domain, base is '/'.
// If you ever deploy to <user>.github.io/<repo> instead, set base: '/<repo>/'.
export default defineConfig({
  site: 'https://worldsportsquiz.com',
  base: '/',
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => {
        // Quiz: only keep question 1 as the entry point; drop q2+, result pages
        const quizMidOrResult = /\/quiz\/[^/]+\/(result\/|[2-9]\/|[1-9]\d+\/)$/;
        return !quizMidOrResult.test(page);
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
