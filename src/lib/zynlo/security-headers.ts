const PERMISSIONS =
  "camera=(), microphone=(), geolocation=(), payment=(), usb=()";

function isLocalHost(request: Request): boolean {
  try {
    const host = new URL(request.url).hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]";
  } catch {
    return false;
  }
}

function contentSecurityPolicy(https: boolean): string {
  const upgrade = https ? "; upgrade-insecure-requests" : "";
  // TanStack Start's streaming bootstrap is an inline module-less script, so
  // script-src keeps 'unsafe-inline'. Hosts other than this app and grok.com
  // stay blocked.
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://grok.com 'wasm-unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob:",
    "connect-src 'self'",
    "worker-src 'self' blob:",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ") + upgrade;
}

export function isStaticAssetPath(pathname: string): boolean {
  if (!pathname.startsWith("/CRM/")) return false;
  if (pathname.includes("/assets/") || pathname.includes("/__grok/")) return true;
  const leaf = pathname.split("/").pop() ?? "";
  return /\.(?:js|mjs|css|map|png|jpe?g|gif|webp|svg|ico|woff2?|ttf|webmanifest|txt|json|html)$/i.test(
    leaf,
  );
}

export function applySecurityHeaders(
  request: Request,
  headers: Headers,
  asset = false,
): void {
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", PERMISSIONS);
  const local = isLocalHost(request);
  const https = new URL(request.url).protocol === "https:";
  const viteDev = import.meta.env?.DEV === true;
  if (!viteDev && !asset) {
    headers.set("Content-Security-Policy", contentSecurityPolicy(https && !local));
    headers.set("X-Frame-Options", "DENY");
  }
  if (!local && https) {
    headers.set("Strict-Transport-Security", "max-age=15552000");
  }
  if (!asset && !headers.has("Cache-Control")) {
    headers.set("Cache-Control", "no-store");
  }
  if (!asset) headers.set("Cache-Control", "no-store");
}

export function cloneWithHeaders(
  response: Response,
  apply: (headers: Headers) => void,
): Response {
  const headers = new Headers();
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") return;
    headers.append(key, value);
  });
  const cookies =
    typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : [];
  for (const cookie of cookies) headers.append("set-cookie", cookie);
  apply(headers);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function expireLegacyGateCookie(request: Request): string {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `zynlo_gate=; Path=/CRM; Max-Age=0; HttpOnly; SameSite=Lax${secure}`;
}
