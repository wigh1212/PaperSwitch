// Explicit local development policy: no accounts, subscriptions or secrets.
// Replace this provider when a backend exists. This is not a security boundary.
export const localAccessService=Object.freeze({
  async authorize(_request,signal){signal?.throwIfAborted();return {mode:'local-development'};}
});
