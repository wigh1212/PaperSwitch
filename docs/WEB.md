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

The 47 tools are defined in `web/tools.mjs`. `scripts/build-web.mjs` generates separate HTML documents containing titles, descriptions, instructions and limitations before JavaScript runs. `scripts/focus-tool-page.mjs` removes unrelated extension panels and options from the public HTML. Conversion pages set a fixed mode on the shared engine; QR reading, text QR creation and Wi-Fi QR creation contain only their own fields. The extension retains its full workspace.

The homepage links to every tool. About, contact and privacy pages are generated with the public contact address glsrhfo17@gmail.com. Google AdSense is loaded once in the head of each public content page. The publisher ID is ca-pub-6110796878581495. The 404 page and extension assets do not load advertising.

## Search behavior

The build generates 208 localized HTML pages and sitemap.xml for https://paperswitch.saerokbit.com. Korean uses the root URLs, English /en/, Japanese /ja/, and Simplified Chinese /zh-cn/. Old /ko/ URLs redirect to the Korean root URLs. Each HTML has canonical, reciprocal hreflang links and language-specific content before JavaScript. CSS and JavaScript assets remain crawlable. Legacy HTML assets, error pages and preview hosts are noindex. The Worker normalizes URL aliases and redirects www and HTTP to the primary domain.

## Validation

After building, `pnpm test` runs core, routing, source and page-structure checks. With a local static preview running, set PLAYWRIGHT_MODULE to the installed Playwright index.mjs and run `pnpm run test:web`. This suite exercises conversion pairs, merging, QR creation/reading and resizing with real inputs, and checks mobile overflow, metadata, 404 behavior and content without JavaScript. `pnpm run test:web:growth` covers PDF page editing, Wi-Fi QR and HEIC. `pnpm run test:web:focused` opens all 188 localized tool pages, checks mobile width and section links, and records screenshots.

With Wrangler running on port 4174, run `node tests/web-routing.mjs` to check production routing, sitemap, canonical links and stylesheet delivery.

Changes are local until committed and pushed to the connected repository. This implementation includes the AdSense site code. Site approval and Auto ads settings are managed in the AdSense account; adding the script alone does not guarantee that ads will appear.


## Shared navigation and languages

The shared header groups PDF, image and QR/GIF tools. Menus support hover, click, keyboard and touch. The homepage offers six shortcuts and a grouped tool directory; its measured examples and tool-selection guidance are visible without expanding an extra panel. Each tool links directly to its instructions and results/limitations, with related tools after the task content.

English, Korean, Japanese and Simplified Chinese share the translation service. web/copy.mjs provides the website copy; the extension catalog covers conversion controls and results. The selected language persists between pages. Brand markup is excluded from translation. Titles and description metadata also update with the selected language.

Run pnpm run test:web:locales with PLAYWRIGHT_MODULE set to check every page in all four languages, metadata, logo geometry, navigation, mobile layout, and file selection retention.

## Multilingual SEO verification

`pnpm run seo:check` checks all 208 generated pages, sitemap coverage and Worker routing. The static preview supports `test:web:focused` for language switching, readable HTML and mobile layout. Historical audits may describe the older English-root URL structure; use `web/seo-config.mjs` for the current language paths.
