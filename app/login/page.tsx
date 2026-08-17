import Image from "next/image";
import { redirect } from "next/navigation";
import { hasDashboardSession } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  if (await hasDashboardSession()) redirect("/");

  return (
    <main className="grid min-h-svh place-items-center bg-surface px-5 py-10">
      <section className="w-full max-w-sm" aria-labelledby="login-title">
        <Image
          src="/logo_DE_dark.avif"
          alt="Divine Empire"
          width={156}
          height={52}
          priority
          className="h-11 w-auto dark:hidden"
        />
        <Image
          src="/logo_DE_light.avif"
          alt="Divine Empire"
          width={156}
          height={52}
          priority
          className="hidden h-11 w-auto dark:block"
        />
        <p className="mt-10 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
          Sales CRM
        </p>
        <h1
          id="login-title"
          className="mt-2 text-3xl font-semibold tracking-tight text-foreground"
        >
          Sign in to continue
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Customer records and conversations are restricted to the sales team.
        </p>
        <LoginForm />
      </section>
    </main>
  );
}
