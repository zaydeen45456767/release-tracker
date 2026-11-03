# Going live: step-by-step

Everything on the code side is ready: a local git repo (branch `main`), tests, the daily job (`.github/workflows/daily.yml`) and a test job (`.github/workflows/ci.yml`). These steps need your accounts. Do them in order; tell Claude after each one that needs a follow-up.

## 1. Pick the name and buy the domain (you)
- Decide the brand (for example "Penguin Almanac", penguinalmanac.com was free on 2026-11-03).
- Buy the domain. Easiest: buy it directly in Cloudflare (Dashboard, then Domain Registration), so DNS is set up automatically. Any registrar works.
- Tell Claude the name: the logo, page titles and footer get updated.

## 2. GitHub (you, about 5 minutes)
1. Create a free account at github.com if you do not have one.
2. Click "New repository". Name it (for example `linux-release-tracker`), choose **Private**, and do **not** add a README, .gitignore or license (the project already has them).
3. Copy the repository address shown, like `https://github.com/YOUR-NAME/linux-release-tracker.git`.
4. In a terminal, run these two commands in the project folder (Claude can run them for you once you paste the address):
   ```
   git remote add origin https://github.com/YOUR-NAME/linux-release-tracker.git
   git push -u origin main
   ```
   GitHub asks you to sign in in the browser the first time.
5. In the repo: Settings, then Actions, then General: under "Workflow permissions" choose **Read and write permissions** and save. (The daily job needs this to save data and open alert issues.)
6. Turn on notifications so alerts reach you: click "Watch" on the repo, then "All activity" (or at least "Issues"). GitHub then emails you each alert.

## 3. Cloudflare Pages (you, about 10 minutes)
1. Create a free Cloudflare account at dash.cloudflare.com.
2. Go to Workers & Pages, then Create, then Pages, then "Connect to Git", and pick the GitHub repo.
3. Build settings:
   - Framework preset: **Astro**
   - Root directory: **site**
   - Build command: **npm run build**
   - Build output directory: **dist**
   - Environment variables: `NODE_VERSION` = `22`, and `SITE_URL` = `https://your-domain.com` (or the `*.pages.dev` address Cloudflare gives you until the domain is ready)
4. Save and deploy. You get a `something.pages.dev` address; check the site there.
5. Custom domains, then add your domain (and `www`). If the domain is on Cloudflare, it connects automatically.
6. Back in GitHub: Settings, then Secrets and variables, then Actions, then the Variables tab: add `SITE_URL` with the same address. The daily job uses it for the sitemap.
7. Optional but recommended: in Cloudflare, Web Analytics, add the site. It counts visits without cookies, so no cookie banner is needed.

From now on: every push to GitHub (including the daily job's data commit) rebuilds and publishes the site in about a minute.

## 4. Google Search Console (you, about 10 minutes)
1. Go to search.google.com/search-console and add a **Domain** property for your domain.
2. Verify with the DNS record Google shows. In Cloudflare: DNS, then Add record, type TXT, paste the value. Verification usually takes a few minutes.
3. Sitemaps, then submit `https://your-domain.com/sitemap.xml`.
4. For the most important new pages (see `docs/PRIORITY.md`): URL Inspection, paste the address, then "Request indexing". Google allows about 10 a day.
5. Later, for automatic weekly numbers: Claude will create the setup; you will add a Google "service account" email as a restricted (read-only) user under Settings, then Users and permissions. Never share your Google password.

## 5. Bing Webmaster Tools and IndexNow (you, 5 minutes; then Claude)
1. bing.com/webmasters: sign in, choose "Import from Google Search Console" to copy the site over.
2. Tell Claude when the domain is live: Claude adds the IndexNow key file and a step to the daily job that pings Bing and Yandex for every changed page.

## 6. First checks after launch (Claude)
- Run the daily job once by hand: GitHub, Actions, "Daily update", "Run workflow".
- Check the live site on desktop and phone, the sitemap, robots.txt, and that every download button works (`npm run check-links` runs daily anyway).
