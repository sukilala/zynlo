import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createLocalJWKSet,
  exportJWK,
  generateKeyPair,
  SignJWT,
} from "jose";
import {
  accessAgentId,
  isAdminEmail,
  isAllowedAgentEmail,
  nameFromEmail,
  parseAdminEmails,
  planAgentLink,
} from "./agent-identity.ts";
import {
  emailFromAccessJwt,
  isLocalDevRequest,
  readAccessToken,
  resolveAccessConfig,
  verifiedAccessEmail,
} from "./access.server.ts";
import { isSafeRecordId } from "./ids.ts";
import { isStaticAssetPath } from "./security-headers.ts";

const AUD = "bef128d05837d7d49acd8bb11f65e07633813d13dd6d5239d9773b23a743788c";
const ISSUER = "https://zynlo.cloudflareaccess.com";

test("agent link matches email and does not rewrite other rows", () => {
  const agents = [
    { id: "a1", name: "Susika", email: "" },
    { id: "a2", name: "Yashodha", email: "edirisinghayashodha@gmail.com" },
  ];
  assert.deepEqual(planAgentLink(agents, "Edirisinghayashodha@gmail.com"), {
    kind: "email",
    id: "a2",
  });
  assert.deepEqual(planAgentLink(agents, "susika.vs@gmail.com"), {
    kind: "create",
  });
});

test("blank email is filled only when the name matches the local-part exactly", () => {
  const agents = [
    { id: "a1", name: "Susika Vs", email: "" },
    { id: "a2", name: "Other", email: "" },
  ];
  assert.deepEqual(planAgentLink(agents, "susika.vs@gmail.com"), {
    kind: "backfill",
    id: "a1",
  });
  assert.equal(planAgentLink(
    [
      { id: "a1", name: "Susika Vs", email: "" },
      { id: "a2", name: "susika vs", email: "" },
    ],
    "susika.vs@gmail.com",
  ).kind, "create");
});

test("duplicate emails keep the lowest id and do not create another agent", () => {
  const plan = planAgentLink(
    [
      { id: "b", name: "B", email: "susika.vs@gmail.com" },
      { id: "a", name: "A", email: "susika.vs@gmail.com" },
    ],
    "susika.vs@gmail.com",
  );
  assert.deepEqual(plan, { kind: "email", id: "a" });
});

test("admin emails are the two named addresses, case-insensitive", () => {
  const admins = parseAdminEmails(
    " Susika.VS@gmail.com, edirisinghayashodha@gmail.com ",
  );
  assert.equal(admins.size, 2);
  assert.equal(isAdminEmail("susika.vs@gmail.com", admins), true);
  assert.equal(isAdminEmail("EDIRISINGHAYASHODHA@gmail.com", admins), true);
  assert.equal(isAdminEmail("sivakumarpraveena804@gmail.com", admins), false);
  assert.equal(isAdminEmail("iamharshika.7@gmail.com", admins), false);
  assert.equal(parseAdminEmails("").size, 0);
  assert.equal(parseAdminEmails("not-an-email, ,").size, 0);
});

test("names from the four roster addresses stay short labels", () => {
  assert.equal(nameFromEmail("susika.vs@gmail.com"), "Susika Vs");
  assert.equal(nameFromEmail("edirisinghayashodha@gmail.com"), "Edirisinghayashodha");
  assert.equal(nameFromEmail("sivakumarpraveena804@gmail.com"), "Sivakumarpraveena804");
  assert.equal(nameFromEmail("iamharshika.7@gmail.com"), "Iamharshika 7");
  for (const email of [
    "susika.vs@gmail.com",
    "edirisinghayashodha@gmail.com",
    "sivakumarpraveena804@gmail.com",
    "iamharshika.7@gmail.com",
  ]) {
    assert.equal(isAllowedAgentEmail(email), true);
  }
  assert.equal(isAllowedAgentEmail("someone@gmail.com"), false);
});

test("access agent ids are stable and path-safe", async () => {
  const id = await accessAgentId("susika.vs@gmail.com");
  assert.equal(id, await accessAgentId("susika.vs@gmail.com"));
  assert.equal(isSafeRecordId(id), true);
  assert.equal(isSafeRecordId("a/b"), false);
  assert.equal(isSafeRecordId("foo.bar"), false);
  assert.equal(isSafeRecordId("bad$id"), false);
  assert.equal(isSafeRecordId("__proto__"), false);
});

test("access config and dev override", async () => {
  const config = resolveAccessConfig({
    teamDomain: "zynlo.cloudflareaccess.com",
    aud: AUD,
  });
  assert.equal(config?.issuer, ISSUER);
  assert.equal(config?.certsUrl, `${ISSUER}/cdn-cgi/access/certs`);
  assert.equal(resolveAccessConfig({ teamDomain: "", aud: AUD }), null);

  const local = new Request("http://127.0.0.1:8787/CRM/");
  assert.equal(isLocalDevRequest(local), true);
  assert.equal(
    await verifiedAccessEmail(local, { devEmail: "susika.vs@gmail.com" }),
    "susika.vs@gmail.com",
  );
  await assert.rejects(
    verifiedAccessEmail(new Request("https://zynlo.lk/CRM/"), {}),
    /Sign in required/,
  );
  await assert.rejects(
    verifiedAccessEmail(local, { devEmail: "stranger@gmail.com" }),
    /Sign in required/,
  );
});

test("jwt email is taken from the header or CF_Authorization cookie", async () => {
  const { publicKey, privateKey } = await generateKeyPair("RS256", {
    extractable: true,
  });
  const jwks = createLocalJWKSet({ keys: [await exportJWK(publicKey)] });
  const config = {
    issuer: ISSUER,
    audience: AUD,
    certsUrl: `${ISSUER}/cdn-cgi/access/certs`,
  };
  const token = await new SignJWT({ email: "Susika.VS@gmail.com" })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(ISSUER)
    .setAudience(AUD)
    .setExpirationTime("10m")
    .sign(privateKey);
  assert.equal(await emailFromAccessJwt(token, config, jwks), "susika.vs@gmail.com");

  const headerRequest = new Request("https://zynlo.lk/CRM/", {
    headers: { "Cf-Access-Jwt-Assertion": token },
  });
  assert.equal(readAccessToken(headerRequest), token);

  const cookieRequest = new Request("https://zynlo.lk/CRM/", {
    headers: { cookie: `CF_Authorization=${token}` },
  });
  assert.equal(readAccessToken(cookieRequest), token);

  const wrongAud = await new SignJWT({ email: "susika.vs@gmail.com" })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(ISSUER)
    .setAudience("other-aud")
    .setExpirationTime("10m")
    .sign(privateKey);
  await assert.rejects(emailFromAccessJwt(wrongAud, config, jwks), /Sign in required/);

  const stranger = await new SignJWT({ email: "stranger@gmail.com" })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(ISSUER)
    .setAudience(AUD)
    .setExpirationTime("10m")
    .sign(privateKey);
  await assert.rejects(
    emailFromAccessJwt(stranger, config, jwks),
    /not on the Zynlo roster/,
  );
});

test("static assets under /CRM are recognized without treating the app shell as a file", () => {
  assert.equal(isStaticAssetPath("/CRM/"), false);
  assert.equal(isStaticAssetPath("/CRM/assets/index-abc.js"), true);
  assert.equal(isStaticAssetPath("/CRM/logo-wordmark.png"), true);
  assert.equal(isStaticAssetPath("/CRM/__grok/manifest.webmanifest"), true);
});
