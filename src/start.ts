import { createCsrfMiddleware, createMiddleware, createStart } from "@tanstack/react-start";
import { accessDeniedResponse, verifiedAccessEmail } from "./lib/zynlo/access.server";
import {
  applySecurityHeaders,
  cloneWithHeaders,
  expireLegacyGateCookie,
  isStaticAssetPath,
} from "./lib/zynlo/security-headers";

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

const gate = createMiddleware().server(async ({ request, next }) => {
  try {
    await verifiedAccessEmail(request);
  } catch {
    return cloneWithHeaders(accessDeniedResponse(), (headers) => {
      applySecurityHeaders(request, headers);
    });
  }

  if (
    (request.method === "GET" || request.method === "HEAD") &&
    isStaticAssetPath(new URL(request.url).pathname)
  ) {
    try {
      const { env } = await import("cloudflare:workers");
      if (env.ASSETS) {
        const asset = await env.ASSETS.fetch(request);
        return cloneWithHeaders(asset, (headers) => {
          applySecurityHeaders(request, headers, true);
        });
      }
    } catch {
      /* Vite dev has no asset binding; the dev server serves the file. */
    }
  }

  const result = await next();
  if (result?.response instanceof Response) {
    return {
      ...result,
      response: cloneWithHeaders(result.response, (headers) => {
        applySecurityHeaders(request, headers);
        headers.append("set-cookie", expireLegacyGateCookie(request));
      }),
    };
  }
  return result;
});

export const startInstance = createStart(() => ({
  requestMiddleware: [gate, csrfMiddleware],
}));
