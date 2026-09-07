"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { LogoMark } from "@/components/Logo";
import "../auth.css";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (!token) {
      setError("Invalid or missing reset link. Please request a new one.");
      return;
    }

    setLoading(true);
    try {
      await authClient.resetPassword({
        newPassword: password,
        token,
      });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err?.message || "This link may have expired. Please request a new one.");
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

        {!token ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontSize: 19, color: "#111", marginBottom: 10 }}>Invalid link</h2>
            <p style={{ color: "rgba(0,0,0,0.5)", fontSize: 13.5, marginBottom: 20 }}>
              This reset link is invalid or has expired.
            </p>
            <Link href="/forgot-password" className="auth-switch-link">Request a new link</Link>
          </div>
        ) : success ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: 19, color: "#111", marginBottom: 10 }}>Password reset</h2>
            <p style={{ color: "rgba(0,0,0,0.5)", fontSize: 13.5 }}>Redirecting you to login...</p>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 20, marginBottom: 8, color: "#111" }}>Set a new password</h2>
            <p style={{ color: "rgba(0,0,0,0.45)", fontSize: 13.5, marginBottom: 24 }}>
              Choose a strong password you haven't used before.
            </p>

            <form onSubmit={handleSubmit}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: "#333", marginBottom: 6, display: "block" }}>New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="At least 8 characters"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1.5px solid rgba(0,0,0,0.1)",
                  fontSize: 14,
                  marginBottom: 16,
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />

              <label style={{ fontSize: 12.5, fontWeight: 600, color: "#333", marginBottom: 6, display: "block" }}>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter your password"
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
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}