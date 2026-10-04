import {tools} from './tools.mjs';
// Shared by the Worker, static SEO build and checks.
export const indexableRoutes=['/',...tools.map(t=>'/'+t.slug),'/about','/contact','/privacy','/terms'];
