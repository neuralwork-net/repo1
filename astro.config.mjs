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
        // Quiz: the landing page /quiz/[slug]/ is the canonical entry point;
        // drop individual question pages and result pages from the sitemap.
        const quizQuestionOrResult = /\/quiz\/[^/]+\/(result\/|\d+\/)$/;
        return !quizQuestionOrResult.test(page);
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
