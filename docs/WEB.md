# Web pages and Cloudflare deployment

The Chrome extension remains in `extension/`. The website is built separately into `dist/`, with shared conversion assets under `dist/assets/`.

## Build and deploy

- Install: `pnpm install --frozen-lockfile` (verified with pnpm 10.11.1).
- Cloudflare Build command: `pnpm run build`.
- Cloudflare Deploy command: `npx wrangler deploy`.
- Remove an old `--assets ./extension` override: the checked-in Wrangler configuration now uses `dist/` and `web/worker.js`.
- The build output is ignored by Git and generated during deployment.
- `pnpm run build:extension` builds only the extension.
- `pnpm run preview` serves the static website at http://127.0.0.1:4173.
- `npx wrangler dev --port 4174 --local` previews canonical links, robots.txt and sitemap.xml in the Cloudflare runtime.

The 36 tools are defined in `web/tools.mjs`. `scripts/build-web.mjs` generates separate HTML documents containing unique titles, descriptions, instructions and limitations before JavaScript runs. Conversion pages set a mode on the shared engine. QR creation and reading have separate visible workspaces.

The homepage links to every tool. About, contact and privacy pages are generated with the public contact address glsrhfo17@gmail.com. Google AdSense is loaded once in the head of each public content page. The publisher ID is ca-pub-6110796878581495. The 404 page and extension assets do not load advertising.

## Search behavior

The build generates 160 localized HTML pages and sitemap.xml for https://paperswitch.saerokbit.com. English keeps its existing root URLs; Korean uses /ko/, Japanese /ja/, and Simplified Chinese /zh-cn/. Each HTML has canonical, reciprocal hreflang links and language-specific content before JavaScript. CSS and JavaScript assets remain crawlable. Legacy HTML assets, error pages and preview hosts are noindex. The Worker normalizes URL aliases and redirects www and HTTP to the primary domain.

## Validation

`pnpm test` runs the existing core checks. With a local static preview running, set PLAYWRIGHT_MODULE to the installed Playwright index.mjs and run `pnpm run test:web`. The browser suite exercises all 36 tools with real inputs, checks mobile overflow, metadata, 404 behavior and content without JavaScript.

With Wrangler running on port 4174, run `node tests/web-routing.mjs` to check production routing, sitemap, canonical links and stylesheet delivery.

Changes are local until committed and pushed to the connected repository. This implementation includes the AdSense site code. Site approval and Auto ads settings are managed in the AdSense account; adding the script alone does not guarantee that ads will appear.


## Shared navigation and languages

The header is identical on every page. Format menus support hover, click, keyboard and touch. The homepage shows one source format at a time. The menu includes all existing supported conversion pairs, including PNG to SVG.

English, Korean, Japanese and Simplified Chinese share the translation service. web/copy.mjs provides the website copy; the extension catalog covers conversion controls and results. The selected language persists between pages. Brand markup is excluded from translation. Titles and description metadata also update with the selected language.

Run pnpm run test:web:locales with PLAYWRIGHT_MODULE set to check every page in all four languages, metadata, logo geometry, navigation, mobile layout, and file selection retention.

## Multilingual SEO verification

With Wrangler running on port 4174, set PLAYWRIGHT_MODULE and run pnpm run test:web:seo. It checks all 160 raw HTML pages and responses, no-JavaScript content, metadata, sitemap, language switching and file retention. See docs/SEO-AUDIT.md for the live-site audit and post-deployment steps.
