"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Scissors, LogIn } from "lucide-react";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password. Try again.");
      setLoading(false);
    } else {
      router.push(callbackUrl);
    }
  }

  return (
    <main className="login-shell">
      {/* ── LEFT: Brand panel ── */}
      <div className="login-brand">
        <div className="login-glow" />

        <div className="login-logo fade-up">
          <Scissors size={36} />
        </div>

        <div className="fade-up-1" style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <div className="login-brand-title">
            <span style={{ color: "var(--ink-3)" }}>Icon</span>
            <span style={{ color: "var(--ink)" }}>Book</span>
          </div>
          <div style={{ fontSize: 15, color: "var(--accent)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 6 }}>
            Staff Portal
          </div>
        </div>

        <div className="login-brand-sub fade-up-2">
          Premium barbershop management for Trinidad&apos;s finest — Icon Barbers, Aranguez
        </div>

        {/* Stats bar */}
        <div className="fade-up-3" style={{
          display: "flex", gap: 0, borderRadius: "var(--radius-lg)",
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
          overflow: "hidden", width: "100%", maxWidth: 320, position: "relative", zIndex: 1,
        }}>
          {[
            { value: "23+",    label: "Years" },
            { value: "5.0 ★", label: "Rating" },
            { value: "174+",   label: "Reviews" },
          ].map((s, i) => (
            <div key={s.label} style={{
              flex: 1, padding: "16px 12px", textAlign: "center",
              borderRight: i < 2 ? "1px solid rgba(255,255,255,0.07)" : "none",
            }}>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--accent)", fontFamily: "JetBrains Mono,monospace" }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 3, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Decorative scissors */}
        <div style={{ position: "absolute", bottom: 30, right: 30, opacity: 0.06, zIndex: 0 }}>
          <Scissors size={120} color="#fff" />
        </div>
        <div style={{ position: "absolute", top: 30, left: 30, opacity: 0.04, zIndex: 0, transform: "rotate(-30deg)" }}>
          <Scissors size={80} color="#fff" />
        </div>
      </div>

      {/* ── RIGHT: Login form ── */}
      <div className="login-form-side">
        <div className="login-card fade-up">
          {/* Header */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 40, height: 40, borderRadius: "var(--radius-md)",
                background: "var(--accent)", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Scissors size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>
                  <span style={{ color: "var(--ink-3)" }}>Icon</span>
                  <span>Book</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-3)" }}>Icon Barbers</div>
              </div>
            </div>
            <div className="login-title">Sign in to your account</div>
            <div className="login-sub">Enter your staff credentials to access the dashboard</div>
          </div>

          {/* Form */}
          <form className="form-stack" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@iconbook.local"
                style={{ minHeight: 52 }}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ minHeight: 52 }}
                required
              />
            </div>

            {error ? <div className="login-err">{error}</div> : null}

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
              style={{ marginTop: 4 }}
            >
              <LogIn size={18} />
              {loading ? "Signing in…" : "Sign in to IconBook"}
            </button>
          </form>

          <div style={{
            textAlign: "center", fontSize: 12, color: "var(--ink-3)",
            borderTop: "1px solid var(--line)", paddingTop: 16, marginTop: 4,
          }}>
            <span style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 11 }}>
              Anil → admin123 &nbsp;·&nbsp; Barbers → barber123
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
