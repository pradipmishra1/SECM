"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { LogoMark } from "@/components/Logo";
import "../auth.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await authClient.signIn.email({ email, password });
    setLoading(false);

    if (error) {
      setError(error.message || "Invalid email or password.");
      return;
    }

    const session = await authClient.getSession();
    const status = (session.data?.user as any)?.status;
    if (status === "SUSPENDED" || status === "DELETED") {
      router.push(`/account-blocked?status=${status}`);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="auth-body">
      <div className="auth-card">
        <div className="auth-brand">
          <LogoMark size={38} />
          <h1>SECM</h1>
        </div>

        <div className="auth-tabs">
          <Link href="/register" className="auth-tab-btn">Sign up</Link>
          <span className="auth-tab-btn active">Log in</span>
        </div>

        <p className="auth-subtitle">
          <strong>Welcome back!</strong> Log in to continue.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="auth-field-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="auth-field-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label htmlFor="password">Password</label>
              <Link href="/forgot-password" style={{ fontSize: 12.5, color: "#7c5cfc", fontWeight: 600, textDecoration: "none" }}>
                Forgot password?
              </Link>
            </div>
            <div className="auth-password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="auth-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M3 3l18 18M10.6 10.7a2.5 2.5 0 0 0 3.5 3.5M9.4 5.5A9.9 9.9 0 0 1 12 5c5 0 9 4.5 10 7-.5 1.2-1.4 2.6-2.7 3.9M6.6 6.6C4.5 8 3 10 2 12c1 2.5 5 7 10 7 1.2 0 2.3-.2 3.4-.7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && <div className="auth-error-msg">{error}</div>}

          <button type="submit" className="auth-btn-submit" disabled={loading}>
            {loading && <span className="auth-spinner"></span>}
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <div className="auth-social-row-inline">
          <button
            type="button"
            className="auth-btn-google"
            onClick={() => authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" })}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.766 12.276c0-.818-.074-1.606-.21-2.364H12.24v4.475h6.482a5.54 5.54 0 0 1-2.4 3.633v3.02h3.885c2.274-2.094 3.559-5.176 3.559-8.764z"/>
              <path fill="#34A853" d="M12.24 24c3.24 0 5.956-1.075 7.94-2.91l-3.885-3.02c-1.075.72-2.45 1.147-4.055 1.147-3.12 0-5.76-2.107-6.705-4.938H1.52v3.11A11.997 11.997 0 0 0 12.24 24z"/>
              <path fill="#FBBC05" d="M5.535 14.28a7.2 7.2 0 0 1 0-4.56V6.61H1.52a12 12 0 0 0 0 10.78l4.015-3.11z"/>
              <path fill="#EA4335" d="M12.24 4.77c1.762 0 3.344.606 4.588 1.796l3.442-3.442C18.192 1.19 15.477 0 12.24 0 7.61 0 3.61 2.66 1.52 6.61l4.015 3.11c.945-2.83 3.585-4.94 6.705-4.94z"/>
            </svg>
            Google
          </button>

          <button
            type="button"
            className="auth-btn-github"
            onClick={() => authClient.signIn.social({ provider: "github", callbackURL: "/dashboard" })}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.7 5.38-5.27 5.67.42.36.78 1.07.78 2.16 0 1.56-.01 2.82-.01 3.2 0 .3.2.66.79.55A10.52 10.52 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5Z"/>
            </svg>
            GitHub
          </button>
        </div>

        <div className="auth-switch-link">
          Don't have an account? <Link href="/register">Sign up</Link>
        </div>
      </div>
    </div>
  );
}