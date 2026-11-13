/**
 * Stand-in for the `cloudflare:workers` module while `vite dev` runs on Node.
 * The Worker build does not alias this file; it imports the real module.
 */
export const env: {
  FIREBASE_SERVICE_ACCOUNT_JSON?: string;
  ACCESS_TEAM_DOMAIN?: string;
  ACCESS_AUD?: string;
  DEV_AGENT_EMAIL?: string;
  ASSETS?: { fetch(request: Request): Promise<Response> };
} = {
  FIREBASE_SERVICE_ACCOUNT_JSON: process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
  ACCESS_TEAM_DOMAIN: process.env.ACCESS_TEAM_DOMAIN,
  ACCESS_AUD: process.env.ACCESS_AUD,
  DEV_AGENT_EMAIL: process.env.DEV_AGENT_EMAIL,
};
