/** Public file URL under the Vite base (`/CRM/` in this app). */
export function publicAsset(path: string): string {
  const base = import.meta.env.BASE_URL || "/";
  const clean = path.replace(/^\/+/, "");
  return `${base}${clean}`;
}
