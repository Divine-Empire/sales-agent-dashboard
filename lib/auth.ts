import "server-only";

import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "./auth-token";

export async function hasDashboardSession(): Promise<boolean> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

export async function requireDashboardSession(): Promise<void> {
  if (!(await hasDashboardSession())) {
    throw new Error("UNAUTHORIZED");
  }
}
