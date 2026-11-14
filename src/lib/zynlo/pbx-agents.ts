/**
 * PBX name or extension → CRM user.
 * Edit this list when a phone extension changes hands.
 * crmEmail is matched first, then crmName.
 */
export type PbxAgentLink = {
  names: string[];
  extensions: string[];
  crmEmail: string;
  crmName: string;
};

export const PBX_AGENT_LINKS: PbxAgentLink[] = [
  {
    names: ["Oshadi"],
    extensions: ["11"],
    crmEmail: "sivakumarpraveena804@gmail.com",
    crmName: "Praveena",
  },
  {
    names: ["Harshika"],
    extensions: ["10"],
    crmEmail: "iamharshika.7@gmail.com",
    crmName: "Harshika",
  },
];

function clean(value: string): string {
  return (value || "").trim().toLowerCase();
}

function extensionKey(value: string): string {
  const digits = (value || "").replace(/\D/g, "");
  if (!digits) return "";
  const trimmed = digits.replace(/^0+/, "");
  return trimmed || "0";
}

/** The row's own agent name wins over its extension. A file-level export name is not a row agent. */
export function pbxLinkFor(name: string, extension: string): PbxAgentLink | null {
  const wanted = clean(name);
  if (wanted) {
    const byName = PBX_AGENT_LINKS.find((link) => link.names.some((item) => clean(item) === wanted));
    if (byName) return byName;
  }
  const ext = extensionKey(extension);
  if (!ext) return null;
  return (
    PBX_AGENT_LINKS.find((link) => link.extensions.some((item) => extensionKey(item) === ext)) ||
    null
  );
}
