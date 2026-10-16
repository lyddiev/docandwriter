# docandwriter.com

Plain HTML and CSS with one small JavaScript file. There is no build step. Netlify publishes this folder exactly as it is.

## What is in here

| File | URL | Notes |
|---|---|---|
| `index.html` | `/` | Home page |
| `on-demand.html` | `/on-demand` | Pricing. The old URL is kept on purpose, so Google keeps its history. |
| `wrong-answer-report.html` | `/wrong-answer-report` | Free report request form (Netlify Forms) |
| `work.html` | `/work` | Results and case studies. `/case-study` redirects here. |
| `about-us.html` | `/about-us` | Old URL kept |
| `partners.html` | `/partners` | For agencies, with a printable capabilities statement |
| `support.html` | `/support` | Contact form. Old URL kept. |
| `privacy-policy.html`, `terms-and-conditions.html` | same as before | |
| `thanks.html` | `/thanks` | Where both forms land after sending |
| `404.html` | any missing page | |
| `_redirects` | | Sends old Squarespace pages to their new homes |
| `_headers` | | Security and caching headers |
| `sitemap.xml`, `robots.txt` | | For Google and Bing |
| `assets/site.css`, `assets/site.js` | | Styles, the cost calculator, and the print button |
| `assets/img/logo.svg` | | The quill, traced from the old site as a sharp vector |
| `assets/fonts/` | | Source Serif 4 and Source Sans 3, self-hosted (SIL Open Font License) |

To edit text, open the page's `.html` file in Sublime, change the words, save, then commit and push. Netlify republishes in about a minute.

## Photos

Add two square photos, at least 224 by 224 pixels:

- `assets/img/alexander-dade.jpg`
- `assets/img/lydia-dade.jpg`

Until they exist, the site shows initials in their place.

## 1. Put the site on GitHub

In Terminal:

```
cd ~/Desktop/doc\&writer/website
git init
git add .
git commit -m "New Doc & Writer site"
git branch -M main
```

Create an empty private repository on github.com (no README), then:

```
git remote add origin https://github.com/YOUR-USERNAME/docandwriter.git
git push -u origin main
```

## 2. Connect Netlify

1. Netlify, then Add new site, then Import an existing project, then GitHub, then pick the repo.
2. Leave the build command empty. Set the publish directory to `.` (the `netlify.toml` file already says this).
3. Deploy. You get a test address like `something.netlify.app`. Check every page there before touching the domain.
4. Turn on forms: Site configuration, then Forms, then Enable form detection. Redeploy once, then send a test from both forms.
5. Form emails: Site configuration, then Notifications, then add an email notification for new form submissions.

## 3. Before you switch the domain (do not skip)

Squarespace is still serving the live site during these steps.

1. **Google Search Console.** Add a Domain property for `docandwriter.com`, verified with a DNS TXT record. Then export Performance (queries and pages, last 16 months) as a backup.
2. **Screenshot every DNS record** in Squarespace: Domains, then docandwriter.com, then DNS. Note every MX, TXT (SPF, DKIM, DMARC, Google verification) and CNAME record. Those keep your email working. Do not delete them.
3. Optional: lower the TTL on the website records a day ahead so the switch spreads faster.

## 4. Switch the domain

1. Netlify: Domain management, then Add a domain. Add `www.docandwriter.com` as the primary domain, and add `docandwriter.com` too.
2. Squarespace DNS: change only the website records.
   - Remove Squarespace's default website records (the A records on `@` and the CNAME on `www`).
   - Add `A` record, host `@`, value `75.2.60.5`.
   - Add `CNAME` record, host `www`, value `YOUR-SITE.netlify.app`.
   - Leave every MX and TXT record alone.
3. Wait for Netlify to issue the HTTPS certificate. It usually takes minutes and can take up to a day.

## 5. Check it worked

```
curl -sI http://docandwriter.com | grep -i -E "^HTTP|^location"
curl -sI https://www.docandwriter.com/home | grep -i -E "^HTTP|^location"
curl -sI https://www.docandwriter.com/case-study | grep -i -E "^HTTP|^location"
curl -sI https://www.docandwriter.com/about-us | grep -i "^HTTP"
```

- The first should be a 301 to `https://www.docandwriter.com/`. If it returns 200 instead, uncomment the last two lines in `_redirects` and push.
- `/home` and `/case-study` should be 301s to `/` and `/work`.
- `/about-us` should be 200.

Send yourself an email to and from your `@docandwriter.com` address to confirm mail still works.

## 6. After launch

1. Search Console: submit `https://www.docandwriter.com/sitemap.xml`, then use URL Inspection to request indexing for the home page.
2. Bing Webmaster Tools: import the site from Search Console and submit the sitemap. Bing feeds Copilot and other AI search tools.
3. Check Search Console Page indexing weekly for a month. Expect some movement in rankings for a few weeks.
4. Keep the Squarespace website subscription until everything above checks out, then cancel the **website plan only**. If the domain is registered at Squarespace, the domain registration is a separate subscription. Keep it.
5. Turn off what the old site sold: the Stripe payment link for the resume refresh, the individuals Typeform, and any promo codes.
6. Optional: create a Google Business Profile as a service-area business (no street address shown).
