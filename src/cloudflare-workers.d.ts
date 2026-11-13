/** Worker bindings. Secrets are set with `wrangler secret put`, not in wrangler.jsonc. */
declare module "cloudflare:workers" {
  export const env: {
    FIREBASE_SERVICE_ACCOUNT_JSON?: string;
    ACCESS_TEAM_DOMAIN?: string;
    ACCESS_AUD?: string;
    /** Local dev only, and only when the Access vars are unset. */
    DEV_AGENT_EMAIL?: string;
    /** Comma-separated Access emails that sign in with role Admin. */
    ADMIN_EMAILS?: string;
    ASSETS?: { fetch(request: Request): Promise<Response> };
  };
}
