# Paper Switch architecture

## Current boundaries

```text
index.html / app.js          UI events and rendering only
  ├─ i18n.js / locales.js    Explicit UI translations; never translates files
  └─ bootstrap.js            Dependency composition
       ├─ batch-service      Validation, sequencing, limits, per-file failures
       ├─ access-service     Local development policy; no authentication yet
       ├─ conversion-service Converter routing, no DOM control IDs
       │    ├─ pdf-worker-client  Worker and OCR lifetime / AbortSignal
       │    │    └─ worker.js     PDF/TIFF conversion and OCR image rendering
       │    ├─ svg-image.js       SVG and raster image conversion
       │    └─ src/converters/   Source for bundled jsPDF adapters
       └─ download-service   Blob URLs, individual outputs, ZIP, cleanup
```

`conversions.js` lists supported directions. Both UI tabs reuse the same service for SVG → PDF. Application components use `bootstrap.js` instead of creating engines themselves. A future remote implementation can be provided there.

## Service contract

- `access.authorize({ conversion, files: [{ name, size }] }, signal)` resolves or throws **before** any conversion begins.
- `conversion.convert(file, { input, output }, { pages, scale, ocr }, { signal, onProgress })` returns `{ [outputName]: Uint8Array }`.
- Progress events contain page counts or OCR progress. Engines do not access UI elements.
- `runBatch()` handles duplicate filenames, partial failure, limits and abort. Abort rejects the batch and prevents further files from starting. Native synchronous SVG/PDF processing cannot be interrupted mid-call; its result is discarded after abort. PDF and OCR workers are terminated.
- `DownloadService.prepare()` creates URLs. `clear()` revokes them on reset or unload.

## Login and subscriptions: next integration boundary

There is **no login, billing or paid feature enforcement in this release**. The local access provider explicitly permits local development. It must not be presented as production security.

When implementing a server product:

1. Add a real identity provider and server session validation. Keep secrets and payment keys on the server.
2. Implement the access provider against an authenticated API. The server checks subscription status, entitlements and usage for every protected operation. Do not trust localStorage, a client-supplied plan, or a hidden button.
3. Add a remote conversion provider when protecting source code requires server execution. The server must revalidate file type, size, limits and authorization regardless of client checks.
4. Add signed, idempotent payment webhook handling for activation, renewal, cancellation and refund states. Redirecting from a checkout page must not grant access by itself.
5. Define storage/deletion rules for uploaded files, job ownership and download authorization before enabling uploads. No upload endpoint exists now.

No payment vendor, account system, server or deployment is chosen by this refactor. MuPDF is still present under its existing AGPL license; moving it to a server is not a substitute for resolving the product's licensing plan.

## SVG color pipeline

1. Validate SVG and reject scripts/external resources.
2. Read the raw `style` attribute rather than `element.style`, which can be empty under extension CSP.
3. Parse CSS as constructed stylesheets. Resolve the cascade in an isolated shadow tree, including class selectors, inline declarations, inherited colors and CSS variables.
4. Freeze computed paint/text properties into SVG attributes and remove style/class dependencies before passing to svg2pdf.
5. Keep vector paths in the PDF. The pipeline does not silently rasterize.

Temporary SVG styles never enter the application's stylesheet scope. CSP is not weakened. Advanced filters/masks and arbitrary fonts remain subject to the converter's capabilities; the test suite does not promise compatibility with every SVG.

## Versioning and packaging

- `package.json`: one authoritative exact version for each direct dependency.
- `pnpm-lock.yaml`: transitive dependency lock.
- `config/assets.json`: external OCR/font sources and SHA-256 fingerprints.
- `scripts/check-dependencies.mjs`: fails on mismatched installs/assets.
- `scripts/build.mjs`: copies packaged engines and bundles `src/pdf-converters.js`. Never edit `extension/vendor` by hand.
- Runtime translations are in `extension/locales.js`. Use `setText()` for UI strings; use ordinary text nodes for filenames. UI locale does not change OCR languages or document contents.

## Verification

`pnpm test` checks conversion utilities, batch isolation, denied access and cancellation, and translation interpolation. `tests/browser.mjs` tests under the extension's CSP in Chrome: both SVG menus, image/PDF/TXT/TIFF/OCR flows, real next/prev SVG fixtures, inline CSS colors, CSS variables, vector preservation, four UI languages and saved preferences. Optional `SVG_FIXTURE` runs an additional local SVG comparison.

Set `PLAYWRIGHT_MODULE` to the installed Playwright `index.mjs` path before `pnpm test:browser`. This suite uses a temporary local server and a separate headless browser; it does not install the extension in a user's Chrome profile.

## PDF merge
The pdf-merge mode validates the entire batch and authorizes it once. merge-service runs merge-worker off the UI thread and terminates it on cancellation. conversion/merge-pdf copies page objects in queue order, including each document's full page range (maximum 100 pages per input). Failure prevents any partial download. Output is merged.pdf; document-level bookmarks and digital signatures are not preserved. No new dependencies were added.


PDF-target conversions share an individual/combined output option (individual by default). The batch service converts inputs in queue order, then invokes the same cancellable merge service for combined output. All pages of generated PDFs are retained. Any failed input prevents a partial combined download; individual mode retains partial-success behavior. The standalone PDF merge mode is unchanged.


PNG tools reuse conversion services for PDF/SVG/JPG/WebP/TIFF in both directions. OCR language presets live in extension/ocr-languages.js, independently from UI locale. Selected presets always include English except English-only; models are bundled offline and SHA256-pinned in config/assets.json. Newly bundled models: Japanese, simplified/traditional Chinese, French, German, Spanish, Portuguese. OCR remains PDF-to-TXT; selecting a UI language does not change recognition language.


WebP and TIFF have dedicated bidirectional tabs using the existing converters. sourceTabs centrally defines navigation order, including keyboard navigation. TIFF input retains all pages for PDF and produces one output per page for SVG/JPG/PNG/WebP. Six tabs wrap on narrow screens.


QR utilities: qr.html and qr.js are separate from conversion batch UI. services/qr-service.js generates with qrcode (high error correction, four-module margin) and decodes with jsqr. Logos occupy 15% of canvas width; generated content is decoded and compared exactly before download. Uploaded content is displayed only in a readonly textarea. No remote requests or automatic URL opening. PNG/JPG/WebP input is capped at 10 MB and 24 MP. New dependencies are pinned in package.json and bundled with their licenses by scripts/build.mjs.


Image utilities: image-editor.html uses services/image-edit-service.js for pixel resizing and edge-connected solid-color removal (optional global matching). This is not AI segmentation. Original pixels are retained for reset and repeat edits. Exports are PNG with alpha; checkerboard exists only in CSS. Inputs capped at 10 MB/24 MP, output 24 MP and 16,000 per side. No new libraries or server uploads.

