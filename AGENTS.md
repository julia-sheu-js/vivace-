# Agent notes

## What this is
A static brochure site for the Vivace music club: five hand-written HTML pages
(`index.html`, `about.html`, `signups.html`, `forms.html`, `rec.html`) plus a
single shared `styles.css` and `script.js`. There is **no** build step, no
package manager, no backend, no database and no server-side rendering — pages
are opened directly, and navigation is plain `<a href="x.html">` links.

Consequences worth remembering:
- No external API is called at runtime; every outbound link (Google Forms,
  Sheets, Instagram, `placehold.co` images) is a plain user-facing link, so no
  credentials or secrets are required to run the site.
- Editing a page or the CSS/JS needs only a browser reload — there is no
  compile or bundle step. The server reads the file from disk per request.

## Running it (Base44 sandbox)
`docker compose -f docker-compose.base44.yml up -d --build`

Single service `web`: `nginx:alpine` serving the bind-mounted working tree on
host port 3000 → container port 80. Dockerfile: none (none needed).

Sandbox-only override, documented here on purpose:
- `docker/nginx.conf` is mounted over the image's `default.conf` and adds
  `Cache-Control: no-store`. It exists only so the preview shows a fresh
  stylesheet/script right after an edit instead of a cached copy. Production is
  plain static hosting and is unaffected.

Because the server is not a live-reloading dev server, call `reload_preview`
(or just refresh) after an edit to see it.

## Verifying
- `curl -fsS http://localhost:3000/` returns `index.html`; the other pages are
  at `/about.html`, `/signups.html`, `/forms.html`, `/rec.html`.
- Serving live source check: the response body must match `index.html` on disk
  (e.g. `grep -c "<title>"` / diff against the file), not a prebuilt bundle.
- `docker compose -f docker-compose.base44.yml ps` shows `web` healthy.
- In the browser: the "Menu" button opens the nav list (Escape or a click
  outside closes it), and on `index.html` the scroll-driven photo stage
  advances as the page scrolls (it is disabled for
  `prefers-reduced-motion: reduce` or viewports under 620px tall).
