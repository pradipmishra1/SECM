"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
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
          <div className="auth-brand-icon">✦</div>
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
              >
                {showPassword ? "🙈" : "👁️"}
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

        <div className="auth-switch-link">
          Already have an account? <Link href="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}