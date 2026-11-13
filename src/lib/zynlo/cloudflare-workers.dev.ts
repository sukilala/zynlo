/**
 * Stand-in for the `cloudflare:workers` module while `vite dev` runs on Node.
 * The Worker build does not alias this file; it imports the real module.
 */
export const env: { FIREBASE_SERVICE_ACCOUNT_JSON?: string } = {};
