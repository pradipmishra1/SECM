"use client";

import { useState } from "react";
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
    setLoading(false);

    if (error) {
      setError(error.message || "Something went wrong.");
      return;
    }

    router.push("/login");
  }

  return (
    <div className="auth-body">
      <div className="auth-card">
        <div className="auth-brand">
          <LogoMark size={38} />
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
          Continue with Google
        </button>

        <div className="auth-switch-link">
          Already have an account? <Link href="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}