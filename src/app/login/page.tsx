"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { LogIn, Scissors } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

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
      return;
    }

    router.push(callbackUrl);
  }

  return (
    <main className="login-shell">
      <div className="login-brand">
        <div className="login-glow" />

        <div className="login-logo fade-up">
          <BrandLogo
            priority
            className="brand-logo-login-hero"
            sizes="(max-width: 480px) 196px, 232px"
          />
        </div>

        <div className="fade-up-1" style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <div
            style={{
              fontSize: 15,
              color: "var(--accent)",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginTop: 6,
            }}
          >
            Staff Portal
          </div>
        </div>

        <div className="login-brand-sub fade-up-2">
          Premium barbershop management for Trinidad&apos;s finest — Icon Barbers, Aranguez
        </div>

        <div
          className="fade-up-3"
          style={{
            display: "flex",
            gap: 0,
            borderRadius: "var(--radius-lg)",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            overflow: "hidden",
            width: "100%",
            maxWidth: 320,
            position: "relative",
            zIndex: 1,
          }}
        >
          {[
            { value: "23+", label: "Years" },
            { value: "5.0 ★", label: "Rating" },
            { value: "174+", label: "Reviews" },
          ].map((stat, index) => (
            <div
              key={stat.label}
              style={{
                flex: 1,
                padding: "16px 12px",
                textAlign: "center",
                borderRight: index < 2 ? "1px solid rgba(255,255,255,0.07)" : "none",
              }}
            >
              <div
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 800,
                  color: "var(--accent)",
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--ink-3)",
                  marginTop: 3,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ position: "absolute", bottom: 30, right: 30, opacity: 0.06, zIndex: 0 }}>
          <Scissors size={120} color="#fff" />
        </div>
        <div
          style={{
            position: "absolute",
            top: 30,
            left: 30,
            opacity: 0.04,
            zIndex: 0,
            transform: "rotate(-30deg)",
          }}
        >
          <Scissors size={80} color="#fff" />
        </div>
      </div>

      <div className="login-form-side">
        <div className="login-card fade-up">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <BrandLogo
                className="brand-logo-login-card"
                sizes="(max-width: 480px) 124px, 144px"
              />
              <div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>Staff Portal</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)" }}>Icon Barbers</div>
              </div>
            </div>
            <div className="login-title">Sign in to your account</div>
            <div className="login-sub">Enter your staff credentials to access the dashboard</div>
          </div>

          <form className="form-stack" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
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
                onChange={(event) => setPassword(event.target.value)}
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
              {loading ? "Signing in…" : "Sign in to Icon Barbers"}
            </button>
          </form>

          <div
            style={{
              textAlign: "center",
              fontSize: 12,
              color: "var(--ink-3)",
              borderTop: "1px solid var(--line)",
              paddingTop: 16,
              marginTop: 4,
            }}
          >
            Use your assigned staff email and password to access the dashboard.
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
