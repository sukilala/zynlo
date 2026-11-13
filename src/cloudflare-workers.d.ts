/** Worker bindings. Secrets are set with `wrangler secret put`, not in wrangler.jsonc. */
declare module "cloudflare:workers" {
  export const env: {
    FIREBASE_SERVICE_ACCOUNT_JSON?: string;
  };
}
