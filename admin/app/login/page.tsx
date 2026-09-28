import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAuthenticated()) redirect("/");
  const { error } = await searchParams;

  return (
    <main className="loginPage">
      <section className="loginCard" aria-labelledby="login-title">
        <div className="brandLockup">
          <span className="brandMark" aria-hidden="true">LT</span>
          <div><strong>Lakay Toussaint</strong><span>Event administration</span></div>
        </div>
        <p className="eyebrow">Authorized access only</p>
        <h1 id="login-title">Welcome back.</h1>
        <p>Sign in to create, publish, and maintain community events.</p>
        <form className="loginForm" action="/api/login" method="post">
          <label htmlFor="password">Admin password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required />
          {error === "invalid" ? (
            <p className="formError" role="alert">That password is not valid. Please try again.</p>
          ) : null}
          <button type="submit">Sign in</button>
        </form>
      </section>
    </main>
  );
}
