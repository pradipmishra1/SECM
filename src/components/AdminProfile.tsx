"use client";

import { useEffect, useRef, useState, useCallback } from "react";

function AnimatedNum({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const from = prev.current;
    const to = value;
    prev.current = value;
    if (from === to) {
      setDisplay(to);
      return;
    }
    const start = performance.now();
    const duration = 700;
    function tick(now: number) {
      const p = Math.min((now - start) / duration, 1);
      setDisplay(Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [value]);
  return <>{display}</>;
}

export default function AdminProfile({ user }: { user: { name: string; email: string; username?: string; image?: string | null } }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    fetch("/api/admin/stats")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then((d) => {
        setStats(d);
        setLastUpdated(new Date());
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setError(true);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const cards = [
    { label: "Total Users", value: stats?.totalUsers || 0, pastelBg: "linear-gradient(155deg,#EDE9FE,#F5F3FF)", pastelText: "#4C2FCC" },
    { label: "Students", value: stats?.totalStudents || 0, pastelBg: "linear-gradient(155deg,#DBEAFE,#EFF6FF)", pastelText: "#1E40AF" },
    { label: "Organizers", value: stats?.totalOrganizers || 0, pastelBg: "linear-gradient(155deg,#FEF3C7,#FFFBEB)", pastelText: "#92400E" },
    { label: "Pending Verify", value: stats?.pendingVerifications || 0, pastelBg: "linear-gradient(155deg,#FEE2E2,#FEF2F2)", pastelText: "#B91C1C" },
    { label: "Challenges", value: stats?.totalChallenges || 0, pastelBg: "linear-gradient(155deg,#D1FAE5,#F0FDF4)", pastelText: "#166534" },
    { label: "Submissions", value: stats?.totalSubmissions || 0, pastelBg: "linear-gradient(155deg,#EDE9FE,#F5F3FF)", pastelText: "#5B21B6" },
    { label: "Winners", value: stats?.totalWinners || 0, pastelBg: "linear-gradient(155deg,#FCE7F3,#FDF2F8)", pastelText: "#9D174D" },
  ];

  const statusLabel = error ? "Sync failed" : loading ? "Syncing…" : "Live data";
  const statusColor = error ? "#F87171" : loading ? "#FBBF24" : "#34D399";

  return (
    <div style={{ maxWidth: 1200 }}>
      <style>{`
        @keyframes apFadeIn { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform: translateY(0); } }
        @keyframes apOrbFloat1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,-20px) scale(1.1); } }
        @keyframes apOrbFloat2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-25px,20px) scale(0.9); } }
        @keyframes apPulseGlow { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
        @keyframes apCardIn { from { opacity:0; transform: translateY(14px) scale(0.95); } to { opacity:1; transform: translateY(0) scale(1); } }
        @keyframes apRingSpin { to { transform: rotate(360deg); } }
        @keyframes apSpin { to { transform: rotate(360deg); } }
        @keyframes apShimmer { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }
        .ap-anim { animation: apFadeIn 0.5s cubic-bezier(.2,.8,.2,1) both; }
        .ap-card { animation: apCardIn 0.5s cubic-bezier(.2,.8,.2,1) both; transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.3s ease; }
        .ap-card:hover { transform: translateY(-6px) scale(1.02); }
        .ap-badge-glow { animation: apPulseGlow 2.4s ease infinite; }
        .ap-ring { animation: apRingSpin 8s linear infinite; }
        .ap-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; }
        .ap-refresh { transition: transform 0.15s ease, background 0.2s ease; }
        .ap-refresh:hover:not(:disabled) { background: rgba(255,255,255,0.28) !important; }
        .ap-refresh:active:not(:disabled) { transform: scale(0.92); }
        .ap-refresh:disabled { opacity: 0.6; cursor: not-allowed; }
        .ap-refresh:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
        .ap-spin { animation: apSpin 0.8s linear infinite; }
        .ap-skeleton { background: linear-gradient(90deg, #F0EEFA 25%, #E6E2F5 37%, #F0EEFA 63%); background-size: 400% 100%; animation: apShimmer 1.4s ease infinite; border-radius: 18px; }
        .ap-hero-inner { display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap; }
        @media (max-width: 640px) {
          .ap-hero-inner { flex-direction: column; align-items: flex-start; }
          .ap-hero-status { align-self: flex-start; text-align: left !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ap-anim, .ap-card, .ap-badge-glow, .ap-ring, .ap-spin, .ap-skeleton, .ap-refresh {
            animation: none !important; transition: none !important;
          }
        }
      `}</style>

      {/* Hero */}
      <div
        className="ap-anim"
        style={{
          position: "relative",
          borderRadius: 24,
          overflow: "hidden",
          marginBottom: 22,
          background: "linear-gradient(120deg,#6D4AFF 0%,#8B5CF6 45%,#A78BFA 100%)",
          padding: "40px 36px",
        }}
      >
        <div style={{ position: "absolute", top: -50, right: -30, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.08)", animation: "apOrbFloat1 8s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: -40, left: "25%", width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.06)", animation: "apOrbFloat2 7s ease-in-out infinite" }} />

        <div className="ap-hero-inner" style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <div style={{ position: "relative" }}>
              <svg className="ap-ring" width="92" height="92" style={{ position: "absolute", top: -6, left: -6 }}>
                <circle cx="46" cy="46" r="44" fill="none" stroke="url(#neonGrad)" strokeWidth="1.5" strokeDasharray="8 10" opacity="0.6" />
                <defs>
                  <linearGradient id="neonGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#6D4AFF" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: user.image ? "transparent" : "linear-gradient(135deg,#6D4AFF,#8B5CF6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 30,
                  fontFamily: "'Sora', sans-serif",
                  fontWeight: 700,
                  overflow: "hidden",
                  boxShadow: "0 0 30px rgba(109,74,255,0.5)",
                  flexShrink: 0,
                }}
              >
                {user.image ? <img src={user.image} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : user.name[0]?.toUpperCase()}
              </div>
            </div>
            <div>
              <span className="ap-badge-glow" style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", background: "rgba(255,255,255,0.2)", color: "#fff", padding: "4px 12px", borderRadius: 20, display: "inline-block", marginBottom: 8 }}>
                ⚡ System Administrator
              </span>
              <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 4, letterSpacing: -0.5 }}>
                {user.name}
              </h1>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 13.5 }}>@{user.username} · {user.email}</p>
            </div>
          </div>

          <div className="ap-hero-status" style={{ textAlign: "right" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end", marginBottom: 4 }}>
              <span className="ap-badge-glow" style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor, boxShadow: `0 0 10px ${statusColor}`, display: "inline-block", flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "#fff", fontWeight: 700 }}>{statusLabel}</span>
              <button
                className="ap-refresh"
                onClick={load}
                disabled={loading}
                aria-label="Refresh stats"
                title="Refresh stats"
                style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.18)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" className={loading ? "ap-spin" : ""} style={{ display: "block" }}>
                  <path d="M21 12a9 9 0 1 1-2.6-6.36" strokeLinecap="round" />
                  <path d="M21 3v6h-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>
              {error ? "Showing last known numbers" : lastUpdated ? `Updated at ${lastUpdated.toLocaleTimeString()}` : "Full platform access"}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: "#FEF2F2", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 14, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, color: "#B91C1C", fontWeight: 600 }}>Couldn't refresh dashboard stats.</span>
          <button className="ap-btn" onClick={load} style={{ background: "#B91C1C", color: "#fff", border: "none", borderRadius: 9, padding: "7px 16px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
            Try again
          </button>
        </div>
      )}

      {/* Stat grid — matches StatCard style used across student/organizer dashboards */}
      <div className="ap-stats-grid">
        {loading && !stats
          ? [1, 2, 3, 4, 5, 6, 7].map((i) => <div key={i} className="ap-skeleton" style={{ height: 106 }} />)
          : cards.map((c, i) => (
              <div
                key={c.label}
                className="ap-card"
                style={{
                  animationDelay: `${i * 0.06}s`,
                  background: c.pastelBg,
                  borderRadius: 18,
                  padding: "20px 22px",
                  border: "1px solid rgba(255,255,255,0.5)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <p style={{ fontSize: 12.5, fontWeight: 600, color: c.pastelText, opacity: 0.75, marginBottom: 12 }}>
                  {c.label}
                </p>
                <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 34, fontWeight: 700, color: c.pastelText, letterSpacing: -1, fontVariantNumeric: "tabular-nums" }}>
                  <AnimatedNum value={c.value} />
                </p>
              </div>
            ))}
      </div>
    </div>
  );
}