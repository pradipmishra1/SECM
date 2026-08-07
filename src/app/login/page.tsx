"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
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
          <div className="auth-brand-icon">✦</div>
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
            <label htmlFor="password">Password</label>
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
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {error && <div className="auth-error-msg">{error}</div>}

          <button type="submit" className="auth-btn-submit" disabled={loading}>
            {loading && <span className="auth-spinner"></span>}
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <div className="auth-switch-link">
          Don't have an account? <Link href="/register">Sign up</Link>
        </div>
      </div>
    </div>
  );
}