import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "de_crm_session";
export const SESSION_TTL_SECONDS = 8 * 60 * 60;

interface SessionPayload {
  expiresAt: number;
  version: 1;
}

function sessionSecret(): string {
  return process.env.CRM_SESSION_SECRET ?? "";
}

export function isAuthConfigured(): boolean {
  return Boolean(process.env.CRM_AUTH_PASSWORD && sessionSecret().length >= 32);
}

function sign(payload: string): string {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

function equal(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export function credentialsMatch(password: string): boolean {
  const configured = process.env.CRM_AUTH_PASSWORD ?? "";
  return configured.length > 0 && equal(password, configured);
}

export function createSessionToken(now = Date.now()): string {
  if (!isAuthConfigured()) {
    throw new Error("CRM authentication is not configured");
  }
  const payload: SessionPayload = {
    expiresAt: now + SESSION_TTL_SECONDS * 1000,
    version: 1,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token || !isAuthConfigured()) return false;
  const [encoded, signature, extra] = token.split(".");
  if (!encoded || !signature || extra || !equal(signature, sign(encoded))) {
    return false;
  }
  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as Partial<SessionPayload>;
    return (
      payload.version === 1 &&
      typeof payload.expiresAt === "number" &&
      payload.expiresAt > Date.now()
    );
  } catch {
    return false;
  }
}
