import Link from "next/link";

import { signIn } from "@/features/auth/actions";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="landing-shell">
      <div className="auth-grid">
        <section className="hero-panel">
          <p className="eyebrow">GarageFlow launch build</p>
          <h1>Run the whole service floor from one board.</h1>
          <p>
            GarageFlow is built for real repair-shop movement: intake, diagnosis, approvals,
            technician handoff, invoice, and pickup without paper slip chaos.
          </p>

          <div className="hero-strip">
            <div>
              <strong>08 min</strong>
              <span>average intake target with the job card flow</span>
            </div>
            <div>
              <strong>1 board</strong>
              <span>for front desk, technician, and manager visibility</span>
            </div>
            <div>
              <strong>Live</strong>
              <span>customer approval route and invoice scaffold included</span>
            </div>
          </div>
        </section>

        <section className="form-panel">
          <p className="eyebrow">Staff access</p>
          <h2>Enter the shop floor</h2>
          <p>Use one of the seeded demo accounts while Supabase auth is still being wired in.</p>

          {error ? <div className="error-banner">Email or password did not match a demo user.</div> : null}

          <form action={signIn} className="stack-form">
            <label>
              Email
              <input defaultValue="owner@garageflow.app" name="email" type="email" required />
            </label>

            <label>
              Password
              <input defaultValue="garageflow" name="password" type="password" required />
            </label>

            <button className="primary-button" type="submit">
              Sign in to GarageFlow
            </button>
          </form>

          <div className="helper-copy">
            <span>`owner@garageflow.app` / `garageflow`</span>
            <span>`advisor@garageflow.app` / `garageflow`</span>
            <span>`tech@garageflow.app` / `garageflow`</span>
            <Link href="https://github.com/muhammedagic237-prog/garageflow-repair-shop">
              GitHub repository
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
