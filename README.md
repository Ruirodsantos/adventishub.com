# adventishub.com

Official website for **Adventis L.L.C.-FZ** — a Dubai-based marketing, analytics and performance consultancy with global reach.

Live at: [adventishub.com](https://adventishub.com)

## Stack

Static HTML, CSS and JavaScript. No build step — files are served directly by GitHub Pages.

- 9 HTML pages (home, about, 6 service pages, contact)
- Shared `styles.css` with design tokens
- Shared `scripts.js` for drawer, accordion, reveal-on-scroll and KPI counters
- JSON-LD structured data on every page for SEO
- Open Graph + Twitter Card metadata
- Fully responsive, accessible, and fast

## Hosting

Hosted on **GitHub Pages** with the custom domain `adventishub.com` (configured via the `CNAME` file in the repo root).

## Local preview

Any static file server works. The simplest:

```
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## Structure

```
├── index.html
├── about.html
├── analytics.html
├── digital.html
├── ai.html
├── gaming.html
├── media.html
├── creative.html
├── contact.html
├── styles.css
├── scripts.js
├── images/
├── CNAME
├── sitemap.xml
├── robots.txt
├── llms.txt
└── favicon.png
```

## Contact

joy@adventishub.com
