"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { LogoMark } from "@/components/Logo";
import "../auth.css";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);



  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!agreed) {
      setError("You must agree to the privacy policy.");
      return;
    }


    setLoading(true);
    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
      role,
    } as any);

    if (error) {
      setLoading(false);
      setError(error.message || "Something went wrong.");
      return;
    }

    const otpRes = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "email-verification",
    });
    setLoading(false);

    if (otpRes.error) {
      setError("Account created, but we couldn't send a verification code. Try resending from the popup.");
    }
    setShowOtpModal(true);
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setOtpError("");
    if (otp.length !== 6) {
      setOtpError("Enter the 6-digit code.");
      return;
    }
    setVerifying(true);
    const { error } = await authClient.emailOtp.verifyEmail({ email, otp });
    setVerifying(false);
    if (error) {
      setOtpError(error.message || "Invalid or expired code.");
      return;
    }
    router.push("/login?verified=1");
  }

  async function handleResend() {
    setResending(true);
    setOtpError("");
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "email-verification",
    });
    setResending(false);
    if (error) {
      setOtpError("Failed to resend. Try again in a moment.");
      return;
    }
    setResent(true);
    setTimeout(() => setResent(false), 4000);
  }

  return (
    <div className="auth-body register-page">
      <style>{`
        .register-page .auth-btn-submit { background: linear-gradient(135deg,#6D4AFF,#8B5CF6); }
        .register-page .auth-field-group input:focus, .register-page .auth-field-group select:focus { border-color: rgba(109,74,255,0.5); box-shadow: 0 0 0 4px rgba(109,74,255,0.1); }
        .register-page a:focus-visible, .register-page button:focus-visible { outline: 3px solid #8B5CF6; outline-offset: 3px; }
        @media (prefers-reduced-motion: reduce) { .register-page .auth-card, .register-page button { animation: none !important; transition: none !important; } }
      `}</style>
      <div className="auth-card">
        <div className="auth-brand">
          <LogoMark size={60} />
          <h1>SECM</h1>
        </div>

        <div className="auth-tabs">
          <span className="auth-tab-btn active">Sign up</span>
          <Link href="/login" className="auth-tab-btn">Log in</Link>
        </div>

        <p className="auth-subtitle">
          <strong>Create an account</strong> to explore challenges and hackathons.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="auth-field-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
                minLength={8}
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

          <div className="auth-field-group">
            <label htmlFor="role">Role</label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="STUDENT">Student</option>
              <option value="ORGANIZER">Organizer</option>
            </select>
          </div>

          <label className="auth-checkbox-row">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            I agree with{" "}
            <Link href="/privacy" target="_blank" style={{ color: "#7c5cfc", fontWeight: 500 }}>
              privacy and policy
            </Link>
          </label>

                  {error && <div className="auth-error-msg">{error}</div>}

          <button type="submit" className="auth-btn-submit" disabled={loading}>
            {loading && <span className="auth-spinner"></span>}
            {loading ? "Creating..." : "Create an account"}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <div className="auth-social-row-inline">
          <button
            type="button"
            className="auth-btn-google"
            disabled={!agreed}
            onClick={() => {
              if (!agreed) {
                setError("You must agree to the privacy policy.");
                return;
              }
              authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" });
            }}
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
            disabled={!agreed}
            onClick={() => {
              if (!agreed) {
                setError("You must agree to the privacy policy.");
                return;
              }
              authClient.signIn.social({ provider: "github", callbackURL: "/dashboard" });
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.7 5.38-5.27 5.67.42.36.78 1.07.78 2.16 0 1.56-.01 2.82-.01 3.2 0 .3.2.66.79.55A10.52 10.52 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5Z"/>
            </svg>
            GitHub
          </button>
        </div>

        <div className="auth-switch-link">
          Already have an account? <Link href="/login">Log in</Link>
        </div>
      </div>

      {showOtpModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(20,19,43,0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 300,
            padding: 20,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: 30,
              width: "100%",
              maxWidth: 380,
              boxSizing: "border-box",
              boxShadow: "0 30px 60px rgba(20,19,43,0.3)",
            }}
          >
            <div style={{ fontSize: 34, textAlign: "center", marginBottom: 10 }}>📧</div>
            <h2 style={{ fontSize: 19, fontWeight: 700, color: "#14132B", textAlign: "center", marginBottom: 8 }}>
              Verify your email
            </h2>
            <p style={{ fontSize: 13, color: "rgba(20,19,43,0.55)", textAlign: "center", lineHeight: 1.6, marginBottom: 20 }}>
              We sent a 6-digit code to <strong>{email}</strong>. Enter it below to activate your account.
            </p>

            <form onSubmit={handleVerify}>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                inputMode="numeric"
                autoFocus
                style={{
                  width: "100%",
                  textAlign: "center",
                  letterSpacing: 8,
                  fontSize: 24,
                  fontWeight: 700,
                  padding: "14px 0",
                  borderRadius: 12,
                  border: "1.5px solid rgba(15,23,42,0.12)",
                  outline: "none",
                  marginBottom: 14,
                  boxSizing: "border-box",
                  color: "#14132B",
                }}
              />

              {otpError && (
                <div style={{ background: "rgba(255,70,70,0.06)", color: "#d32f2f", fontSize: 12.5, padding: "8px 12px", borderRadius: 10, marginBottom: 14, textAlign: "center" }}>
                  {otpError}
                </div>
              )}

              <button
                type="submit"
                disabled={verifying}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  padding: "13px 0",
                  fontSize: 14.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  opacity: verifying ? 0.6 : 1,
                  marginBottom: 12,
                }}
              >
                {verifying ? "Verifying..." : "Verify & Continue"}
              </button>
            </form>

            <div style={{ textAlign: "center" }}>
              <button
                onClick={handleResend}
                disabled={resending}
                style={{
                  background: "none",
                  border: "none",
                  color: resent ? "#15803D" : "#6D4AFF",
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {resent ? "✓ Code resent!" : resending ? "Resending..." : "Resend code"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
