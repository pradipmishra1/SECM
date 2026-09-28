"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./icons";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function CountUpNumber({ value }: { value: number | undefined }) {
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (value === undefined || started.current) return;
    started.current = true;
    const duration = 800;
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value!));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [value]);

  return <span style={{ fontVariantNumeric: "tabular-nums" }}>{value === undefined ? "—" : display}</span>;
}

function CreditStat({
  icon,
  label,
  value,
  bg,
  accent,
  c1,
  c2,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | undefined;
  bg: string;
  accent: string;
  c1: string;
  c2: string;
  delay: string;
}) {
  return (
    <div
      className="ad-stat credit-card"
      style={{
        animationDelay: delay,
        background: bg,
        borderRadius: 20,
        padding: "20px 22px",
        position: "relative",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.6)",
        minHeight: 130,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transformStyle: "preserve-3d",
      }}
      onMouseMove={(e) => {
        const el = e.currentTarget;
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const rx = (0.5 - py) * 14;
        const ry = (px - 0.5) * 14;
        el.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px) scale(1.02)`;
        const spot = el.querySelector(".card-spotlight") as HTMLElement;
        if (spot) spot.style.background = `radial-gradient(circle 160px at ${px * 100}% ${py * 100}%, rgba(255,255,255,0.55), transparent 70%)`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.transform = "perspective(700px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)";
        const spot = el.querySelector(".card-spotlight") as HTMLElement;
        if (spot) spot.style.background = "transparent";
      }}
    >
      <div className="card-spotlight" style={{ position: "absolute", inset: 0, pointerEvents: "none", transition: "background 0.15s linear" }} />
      <div className="card-shine" />
      <div className="card-circle-1" style={{ position: "absolute", bottom: -18, right: 26, width: 46, height: 46, borderRadius: "50%", background: c1, opacity: 0.55 }} />
      <div className="card-circle-2" style={{ position: "absolute", bottom: -18, right: 4, width: 46, height: 46, borderRadius: "50%", background: c2, opacity: 0.55, mixBlendMode: "multiply" }} />
      <div className="card-watermark" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
        <img src="/brand/logobg.png" alt="" width={64} height={64} style={{ objectFit: "contain" }} />
      </div>

      <div style={{ position: "relative" }}>
        <div className="card-chip" style={{ width: 34, height: 26, borderRadius: 6, background: "rgba(255,255,255,0.7)", border: `1px solid ${accent}33`, display: "flex", alignItems: "center", justifyContent: "center", color: accent }}>
          {icon}
        </div>
      </div>

      <div style={{ position: "relative" }}>
        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 32, fontWeight: 800, color: accent, letterSpacing: 1 }}>
          <CountUpNumber value={value} />
        </div>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: "rgba(20,19,43,0.5)", marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
          {label}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard({ userName }: { userName: string }) {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => {
        if (!r.ok) throw new Error("failed");
        return r.json();
      })
      .then(setStats)
      .catch(() => setFailed(true));
  }, []);

  const pending = stats?.pendingVerifications || 0;
  const totalUsers = stats?.totalUsers || 0;
  const studentPct = totalUsers ? ((stats?.totalStudents || 0) / totalUsers) * 100 : 0;
  const organizerPct = totalUsers ? ((stats?.totalOrganizers || 0) / totalUsers) * 100 : 0;

  return (
    <div>
      <style>{`
        @keyframes adRise { from { opacity:0; transform: translateY(16px) scale(0.98); } to { opacity:1; transform: translateY(0) scale(1); } }
        @keyframes adHead { from { opacity:0; transform: translateX(-10px); } to { opacity:1; transform: translateX(0); } }
        @keyframes adBarGrow { from { width: 0%; } }
        @keyframes adPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

        .ad-head { animation: adHead 0.5s cubic-bezier(.2,.8,.2,1) both; }
        .ad-stat { animation: adRise 0.55s cubic-bezier(.2,.8,.2,1) both; }
        .ad-rise { animation: adRise 0.5s cubic-bezier(.2,.8,.2,1) both; }
        .ad-live-dot { width: 7px; height: 7px; border-radius: 50%; background: #15803D; display: inline-block; animation: adPulse 1.6s ease infinite; }

        .credit-card { transition: box-shadow 0.25s ease; box-shadow: 0 6px 18px rgba(20,19,43,0.06); }
        .credit-card:hover { box-shadow: 0 20px 40px rgba(20,19,43,0.16); }
        .card-watermark { opacity: 0.07; transition: opacity 0.3s ease, filter 0.3s ease; }
        .credit-card:hover .card-watermark { opacity: 1; filter: drop-shadow(0 0 10px rgba(109,74,255,0.35)); }
        .card-shine { position: absolute; top: 0; left: -60%; width: 40%; height: 100%; background: linear-gradient(100deg, transparent, rgba(255,255,255,0.45), transparent); transform: skewX(-20deg); transition: left 0.7s ease; pointer-events: none; }
        .credit-card:hover .card-shine { left: 130%; }
        .card-chip { transition: transform 0.3s cubic-bezier(.34,1.56,.64,1); }
        .credit-card:hover .card-chip { transform: scale(1.12) rotate(-4deg); }
        .card-circle-1, .card-circle-2 { transition: transform 0.4s cubic-bezier(.34,1.56,.64,1); }
        .credit-card:hover .card-circle-1 { transform: translate(-4px, -4px) scale(1.08); }
        .credit-card:hover .card-circle-2 { transform: translate(4px, -4px) scale(1.08); }

        .ad-quick { transition: transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease, border-color 0.2s ease; cursor: pointer; position: relative; }
        .ad-quick:hover { transform: translateY(-4px); box-shadow: 0 14px 30px rgba(109,74,255,0.14); border-color: rgba(109,74,255,0.2) !important; }
        .ad-quick:hover .ad-quick-icon { transform: scale(1.1) rotate(-4deg); background: rgba(109,74,255,0.16) !important; }
        .ad-quick:hover .ad-quick-link { gap: 8px; }
        .ad-quick-icon { transition: transform 0.3s cubic-bezier(.34,1.56,.64,1), background 0.2s ease; }
        .ad-quick-link { transition: gap 0.2s ease; }

        .ad-review-btn { transition: transform 0.15s ease, background 0.15s ease; }
        .ad-review-btn:hover { transform: translateY(-1px); background: #2A2850 !important; }

        .ad-bar { animation: adBarGrow 1s cubic-bezier(.2,.8,.2,1) 0.3s both; }

        .ad-stats-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-bottom: 24px; }
        .ad-quick-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-bottom: 24px; }
        @media (max-width: 1000px) {
          .ad-stats-grid, .ad-quick-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 560px) {
          .ad-stats-grid, .ad-quick-grid { grid-template-columns: minmax(0, 1fr); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ad-live-dot { animation: none; }
          .ad-bar, .ad-stat, .ad-rise, .ad-head { animation: none; }
        }
      `}</style>

      {/* Header */}
      <div className="ad-head" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase", background: "rgba(109,74,255,0.1)", color: "#6D4AFF", padding: "4px 10px", borderRadius: 20 }}>
            Admin
          </span>
          <span style={{ fontSize: 11.5, color: "rgba(20,19,43,0.45)", display: "flex", alignItems: "center", gap: 5 }}>
            <span className="ad-live-dot" /> Live
          </span>
        </div>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 27, fontWeight: 700, color: "#14132B", letterSpacing: -0.5, marginBottom: 6 }}>
          {greeting()},{" "}
          <span style={{ background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{userName}</span>
        </h1>
        <p style={{ color: "rgba(20,19,43,0.5)", fontSize: 14 }}>
          {failed
            ? "Couldn't load platform stats. Try refreshing."
            : pending > 0
            ? `${pending} organizer${pending !== 1 ? "s" : ""} waiting for verification`
            : "All organizers are verified."}
        </p>
      </div>

      {/* Credit-card stats */}
      <div className="ad-stats-grid">
        <CreditStat
          icon={<Icon.users width={15} height={15} />}
          label="Total Users"
          value={stats?.totalUsers}
          bg="linear-gradient(155deg,#F5F3FF,#EDE9FE)"
          accent="#6D4AFF"
          c1="#C4B5FD"
          c2="#8B5CF6"
          delay="0.04s"
        />
        <CreditStat
          icon={<Icon.clipboard width={15} height={15} />}
          label="Challenges"
          value={stats?.totalChallenges}
          bg="linear-gradient(155deg,#EFF6FF,#DBEAFE)"
          accent="#2563EB"
          c1="#93C5FD"
          c2="#3B82F6"
          delay="0.09s"
        />
        <CreditStat
          icon={<Icon.upload width={15} height={15} />}
          label="Submissions"
          value={stats?.totalSubmissions}
          bg="linear-gradient(155deg,#FFFBEB,#FEF3C7)"
          accent="#D97706"
          c1="#FCD34D"
          c2="#F59E0B"
          delay="0.14s"
        />
        <CreditStat
          icon={<Icon.trophy width={15} height={15} />}
          label="Winners Announced"
          value={stats?.totalWinners}
          bg="linear-gradient(155deg,#F0FDF4,#D1FAE5)"
          accent="#059669"
          c1="#6EE7B7"
          c2="#10B981"
          delay="0.19s"
        />
      </div>

      {/* Quick actions */}
      <div className="ad-quick-grid">
        {[
          { label: "Verify Organizers", sub: "Review pending requests", icon: <Icon.users width={22} height={22} />, path: "/dashboard/verify", badge: pending },
          { label: "Manage Users", sub: "View and manage accounts", icon: <Icon.user width={22} height={22} />, path: "/dashboard/users" },
          { label: "All Challenges", sub: "Browse every challenge", icon: <Icon.clipboard width={22} height={22} />, path: "/dashboard/all-challenges" },
          { label: "All Winners", sub: "See announced winners", icon: <Icon.trophy width={22} height={22} />, path: "/dashboard/all-winners" },
        ].map((a, idx) => (
          <div
            key={a.label}
            className="ad-quick ad-rise"
            onClick={() => router.push(a.path)}
            style={{ background: "#fff", border: "1px solid rgba(15,23,42,0.07)", borderRadius: 16, padding: "20px 22px", animationDelay: `${0.25 + idx * 0.07}s` }}
          >
            {!!a.badge && (
              <span style={{ position: "absolute", top: 14, right: 14, background: "#DC2626", color: "#fff", fontSize: 10.5, fontWeight: 800, minWidth: 20, height: 20, padding: "0 6px", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {a.badge}
              </span>
            )}
            <div className="ad-quick-icon" style={{ width: 46, height: 46, borderRadius: 12, background: "rgba(109,74,255,0.09)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6D4AFF", marginBottom: 14 }}>
              {a.icon}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#14132B", marginBottom: 3 }}>{a.label}</div>
            <div style={{ fontSize: 13, color: "rgba(20,19,43,0.45)", marginBottom: 10 }}>{a.sub}</div>
            <span className="ad-quick-link" style={{ fontSize: 12.5, fontWeight: 700, color: "#6D4AFF", display: "inline-flex", alignItems: "center", gap: 4 }}>
              Open <Icon.arrow width={12} height={12} />
            </span>
          </div>
        ))}
      </div>

      {/* Needs attention */}
      {pending > 0 && (
        <div
          className="ad-rise"
          style={{
            animationDelay: "0.5s",
            marginBottom: 20,
            background: "linear-gradient(135deg, #FFF7E8 0%, #FFEFD1 100%)",
            border: "1px solid rgba(245,158,11,0.2)",
            borderRadius: 18,
            padding: "18px 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#B45309", boxShadow: "0 6px 16px rgba(20,19,43,0.1)" }}>
              <Icon.bell width={18} height={18} />
            </div>
            <div>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: "#14132B" }}>
                {pending} organizer{pending !== 1 ? "s" : ""} need verification
              </p>
              <p style={{ fontSize: 12, color: "rgba(20,19,43,0.5)" }}>They can't publish challenges until you approve them.</p>
            </div>
          </div>
          <button
            className="ad-review-btn"
            onClick={() => router.push("/dashboard/verify")}
            style={{ background: "#14132B", color: "#fff", border: "none", borderRadius: 9, padding: "9px 16px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}
          >
            Review now
          </button>
        </div>
      )}

      {/* User composition */}
      {stats && (
        <div className="ad-rise" style={{ animationDelay: "0.55s", background: "#fff", border: "1px solid rgba(15,23,42,0.07)", borderRadius: 18, padding: "20px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "#14132B" }}>User Composition</h2>
            <span style={{ fontSize: 12, color: "rgba(20,19,43,0.45)" }}>{totalUsers} total</span>
          </div>
          <div style={{ display: "flex", height: 12, borderRadius: 20, overflow: "hidden", background: "rgba(15,23,42,0.05)" }}>
            <div className="ad-bar" style={{ width: `${studentPct}%`, background: "linear-gradient(90deg,#2563EB,#3B82F6)" }} />
            <div className="ad-bar" style={{ width: `${organizerPct}%`, background: "linear-gradient(90deg,#D97706,#F59E0B)", animationDelay: "0.1s" }} />
          </div>
          <div style={{ display: "flex", gap: 22, marginTop: 14, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "rgba(20,19,43,0.55)", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: "#2563EB", display: "inline-block" }} /> Students ({stats.totalStudents || 0})
            </span>
            <span style={{ fontSize: 12, color: "rgba(20,19,43,0.55)", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: "#D97706", display: "inline-block" }} /> Organizers ({stats.totalOrganizers || 0})
            </span>
            <span style={{ fontSize: 12, color: "rgba(20,19,43,0.55)", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: "#DC2626", display: "inline-block" }} /> Pending verification ({pending})
            </span>
          </div>
        </div>
      )}
    </div>
  );
}