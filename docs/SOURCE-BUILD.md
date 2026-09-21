# Paper Switch source and build instructions

Paper Switch project code is licensed under GNU AGPL version 3 or later. See LICENSE. Third-party code, font and language data retain their own licenses. This grant applies to project code the publisher is entitled to license, not to a user's uploaded documents or third-party trademarks.

## Website source bundle
The download is made from the same working files used by the website build. It includes extension and web sources, src, scripts, configuration, package.json, pnpm-lock.yaml, licenses, README and this guide. Font and OCR language inputs listed in config/assets.json are included. It excludes .git history, local environment files, credentials, test outputs and caches. Generated vendor libraries are obtained from exact package versions using the lockfile.

## Build
Use Node.js 22 and pnpm 10.11.1. In the extracted directory:

    pnpm install --frozen-lockfile
    pnpm run build
    pnpm run preview

The web output is dist. scripts/build.mjs copies libraries into extension/vendor and bundles browser helpers; scripts/build-web.mjs builds localized pages. If asset checks fail, do not silently replace inputs: check config/assets.json. Network is needed for the locked packages and first-time source archive downloads. No paid service is required to build. The project build and sources are provided without warranty under LICENSE.

## Engine source archives
config/source-archives.json records original download URLs, versions and SHA-256 hashes. scripts/build-source-distribution.mjs verifies hashes before copying these source archives to the website. Larger archives are split into 20 MiB parts to fit static hosting limits. Join the parts in the listed order as bytes; the joined file must match the recorded SHA-256. The original upstream URL is also provided as a one-file alternative.

MuPDF: the official 1.28.0 source release contains native sources, thirdparty sources, platform/wasm and its build scripts. Follow the included platform/wasm build instructions and tools/build.sh with Emscripten and the required compiler tools. The npm package is mupdf 1.28.0. Its reported gitHead is 3ca91bae5abf5bbafaf72d715f4e95142b6666e7, while the public 1.28.0 release tag is 205b8cf43551279d1215e88fe2845c5d595bade9. We provide the official same-version release; a bit-for-bit rebuild against the npm WASM has not been performed. Exact correspondence of that npm packaging commit remains an upstream verification item.

HEIC: heic-to v1.5.2 source includes wrapper source and esbuild.mjs. The upstream README identifies libheif 1.22.2 and shows LIBDE265_VERSION=1.0.16 USE_WASM=0 for its decoder build; those native source archives are supplied too. Follow that README and libheif/build-emscripten.sh, including its documented llvm-nm substitution. An independent bit-for-bit build of the distributed decoder has not been performed. Compiler versions and native build options should be verified with upstream if replacing the decoder.

## Replacing libraries and modifications
There is no application integrity check that prevents a locally rebuilt HEIC library from being used. Replace the package's dist/next/heic-to.js with your compatible build before running build:web, or adjust the explicit copy in scripts/build-web.mjs. Keep API compatibility. License-required changes to third-party components must retain their original notices.

Our build modifies svg2pdf.js style parsing: the DOM style-element injection is replaced with CSSStyleSheet.replaceSync. The full patch operation is in scripts/build.mjs; it fails if the expected upstream code changes. Other listed packages are copied/bundled without a deliberate source patch.

## Maintaining a redistribution
Keep LICENSE, third-party notices, and corresponding source/build information with your distribution. Update source archives and notices when changing dependency versions. A link to a moving upstream branch is not a replacement for the exact source required for a particular distributed build. Old deployments should retain access to their matching source downloads.

## Verification status
Website build and source-package integrity are tested. Native MuPDF/HEIC recompilation is not verified in this Windows environment; do not describe this package as a legal certification or a bit-identical native build. Confirm outstanding engine provenance with the rightsholder before claiming all licensing obligations are fully discharged.
