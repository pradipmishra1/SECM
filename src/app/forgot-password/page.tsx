"use client";
import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { LogoMark } from "@/components/Logo";
import "../auth.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
               await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });
      setSent(true);
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="auth-body">
      <div className="auth-card" style={{ maxWidth: 420 }}>
        <div className="auth-brand">
          <LogoMark size={38} />
          <h1>SECM</h1>
        </div>

        {sent ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📧</div>
            <h2 style={{ fontSize: 19, color: "#111", marginBottom: 10 }}>Check your email</h2>
            <p style={{ color: "rgba(0,0,0,0.5)", fontSize: 13.5, lineHeight: 1.6, marginBottom: 20 }}>
              If an account exists for <strong>{email}</strong>, we've sent a link to reset your password. It'll expire in 1 hour.
            </p>
            <Link href="/login" className="auth-switch-link">← Back to Login</Link>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 20, marginBottom: 8, color: "#111" }}>Forgot your password?</h2>
            <p style={{ color: "rgba(0,0,0,0.45)", fontSize: 13.5, marginBottom: 24 }}>
              Enter your email and we'll send you a link to reset it.
            </p>

            <form onSubmit={handleSubmit}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: "#333", marginBottom: 6, display: "block" }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1.5px solid rgba(0,0,0,0.1)",
                  fontSize: 14,
                  marginBottom: 18,
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />

              {error && (
                <div style={{ background: "rgba(255,70,70,0.06)", color: "#d32f2f", fontSize: 12.5, padding: "8px 12px", borderRadius: 8, marginBottom: 16 }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  background: "#6D4AFF",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "13px 0",
                  fontSize: 14.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <Link href="/login" className="auth-switch-link" style={{ display: "block", marginTop: 18, textAlign: "center" }}>
              ← Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}