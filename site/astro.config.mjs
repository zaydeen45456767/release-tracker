import { defineConfig } from 'astro/config';

// SITE_URL is set in Cloudflare Pages (and the daily job) once the domain is known.
export default defineConfig({
  site: process.env.SITE_URL || 'https://example.com',
  trailingSlash: 'always',
});
