"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createSessionToken,
  credentialsMatch,
  isAuthConfigured,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
} from "@/lib/auth-token";

export interface LoginState {
  error?: string;
}

export async function login(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!isAuthConfigured()) {
    return {
      error:
        "Dashboard access is not configured. Add CRM_AUTH_PASSWORD and a 32+ character CRM_SESSION_SECRET.",
    };
  }

  const password = String(formData.get("password") ?? "");
  if (!credentialsMatch(password)) {
    return { error: "Incorrect password." };
  }

  (await cookies()).set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  redirect("/");
}

export async function logout(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
