"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./icons";


function useCountUp(value: number | undefined, active: boolean) {
  const [display, setDisplay] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (value === undefined || !active || started.current) return;
    started.current = true;
    const target = value;
    const duration = 900;
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [value, active]);
  return value === undefined ? "—" : display;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function AdminDashboard({ userName }: { userName: string }) {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats);
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

   const cards = [
    { label: "Total Users", value: stats?.totalUsers, tone: "#5B21B6", bg: "linear-gradient(135deg, #C4B5FD 0%, #A78BFA 100%)", blob: "rgba(91,33,182,0.22)", icon: <Icon.users width={17} height={17} /> },
    { label: "Students", value: stats?.totalStudents, tone: "#1D4ED8", bg: "linear-gradient(135deg, #93C5FD 0%, #60A5FA 100%)", blob: "rgba(29,78,216,0.2)", icon: <Icon.user width={17} height={17} /> },
    { label: "Organizers", value: stats?.totalOrganizers, tone: "#B45309", bg: "linear-gradient(135deg, #FCD34D 0%, #FBBF24 100%)", blob: "rgba(180,83,9,0.22)", icon: <Icon.flag width={17} height={17} /> },
    { label: "Pending Verification", value: stats?.pendingVerifications, tone: "#B91C1C", bg: "linear-gradient(135deg, #FCA5A5 0%, #F87171 100%)", blob: "rgba(185,28,28,0.2)", icon: <Icon.bell width={17} height={17} />, pulse: true },
    { label: "Challenges", value: stats?.totalChallenges, tone: "#047857", bg: "linear-gradient(135deg, #6EE7B7 0%, #34D399 100%)", blob: "rgba(4,120,87,0.22)", icon: <Icon.clipboard width={17} height={17} /> },
    { label: "Submissions", value: stats?.totalSubmissions, tone: "#86198F", bg: "linear-gradient(135deg, #F0ABFC 0%, #E879F9 100%)", blob: "rgba(134,25,143,0.2)", icon: <Icon.upload width={17} height={17} /> },
    { label: "Winners Announced", value: stats?.totalWinners, tone: "#BE185D", bg: "linear-gradient(135deg, #F9A8D4 0%, #F472B6 100%)", blob: "rgba(190,24,93,0.2)", icon: <Icon.trophy width={17} height={17} /> },
  ];

  const healthScore = stats ? Math.max(10, 100 - (stats.pendingVerifications || 0) * 8) : null;

  return (
    <div>
      <style>{`
        @keyframes adRise { from { opacity:0; transform: translateY(18px) scale(0.97); } to { opacity:1; transform: translateY(0) scale(1); } }
        @keyframes adHead { from { opacity:0; transform: translateX(-10px); } to { opacity:1; transform: translateX(0); } }
        @keyframes orbFloat1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-14px,10px) scale(1.08); } }
        @keyframes orbFloat2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(12px,-8px) scale(0.94); } }
        @keyframes pulseDot { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.3); } }
        @keyframes shimmerSweep { 0% { transform: translateX(-140%) rotate(12deg); } 100% { transform: translateX(240%) rotate(12deg); } }
        @keyframes ringSpin { to { transform: rotate(360deg); } }
        @keyframes barGrow { from { width: 0%; } }
        @keyframes badgeBounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        @keyframes tickerScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        .ad-anim { animation: adRise 0.55s cubic-bezier(.2,.8,.2,1) both; }
        .ad-head { animation: adHead 0.5s cubic-bezier(.2,.8,.2,1) both; }
        .orb-a { animation: orbFloat1 8s ease-in-out infinite; }
        .orb-b { animation: orbFloat2 7s ease-in-out infinite; }
        .ad-card { transition: transform 0.25s cubic-bezier(.2,.8,.2,1), box-shadow 0.25s ease; position: relative; overflow: hidden; cursor: default; }
        .ad-card:hover { transform: translateY(-6px) scale(1.03); box-shadow: 0 18px 38px rgba(15,23,42,0.14); }
        .ad-card:hover .ad-card-shine { left: 120%; }
        .ad-card-shine { position: absolute; top: -20%; left: -60%; width: 40%; height: 160%; background: linear-gradient(100deg, transparent, rgba(255,255,255,0.5), transparent); transition: left 0.6s ease; pointer-events: none; }
        .ad-action { transition: transform 0.15s ease, box-shadow 0.2s ease; cursor: pointer; }
        .ad-action:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 12px 26px rgba(15,23,42,0.12); }
        .ad-action:hover .ad-action-icon { transform: rotate(-8deg) scale(1.1); background: #14132B; color: #fff; }
        .ad-action-icon { transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), background 0.25s ease, color 0.25s ease; }
        .pulse-alert { animation: pulseDot 1.4s ease infinite; }
        .health-ring { animation: ringSpin 12s linear infinite; }
        .bar-fill { animation: barGrow 1.2s cubic-bezier(.2,.8,.2,1) 0.3s both; }
        .badge-bounce { animation: badgeBounce 2s ease-in-out infinite; }
        .live-dot { width: 7px; height: 7px; border-radius: 50%; background: #15803D; display: inline-block; animation: pulseDot 1.6s ease infinite; }
        .ticker-wrap { overflow: hidden; }
        .ticker-track { display: flex; width: max-content; animation: tickerScroll 20s linear infinite; }
      `}</style>



      {/* Header */}
      <div className="ad-head" style={{ marginBottom: 24, position: "relative", padding: "22px 26px", borderRadius: 18, background: "#fff", border: "1px solid rgba(15,23,42,0.07)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase", background: "rgba(109,74,255,0.1)", color: "#6D4AFF", padding: "4px 10px", borderRadius: 20 }}>
                Admin
              </span>
              <span style={{ fontSize: 11, color: "rgba(20,19,43,0.45)", display: "flex", alignItems: "center", gap: 5 }}>
                <span className="live-dot" /> Live
              </span>
            </div>
            <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 25, fontWeight: 700, color: "#14132B", letterSpacing: -0.5, marginBottom: 6 }}>
              {greeting()}, {userName}
            </h1>
            <p style={{ color: "rgba(20,19,43,0.5)", fontSize: 13.5 }}>
              {stats?.pendingVerifications > 0
                ? `${stats.pendingVerifications} organizer${stats.pendingVerifications !== 1 ? "s" : ""} waiting for verification`
                : "All organizers verified"}
            </p>
          </div>

          {healthScore !== null && (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ position: "relative", width: 56, height: 56 }}>
                <svg width="56" height="56" style={{ position: "absolute", transform: "rotate(-90deg)" }}>
                  <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(15,23,42,0.08)" strokeWidth="4" />
                  <circle cx="28" cy="28" r="24" fill="none" stroke="#6D4AFF" strokeWidth="4" strokeDasharray={`${healthScore * 1.5} 999`} strokeLinecap="round" />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 800, color: "#14132B" }}>
                  {healthScore}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "#14132B" }}>Platform Health</div>
                <div style={{ fontSize: 10.5, color: "rgba(20,19,43,0.4)" }}>{clock.toLocaleTimeString()}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="ad-head" style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Verify Organizers", icon: <Icon.users width={15} height={15} />, path: "/dashboard/verify", badge: stats?.pendingVerifications },
          { label: "Manage Users", icon: <Icon.user width={15} height={15} />, path: "/dashboard/users" },
          { label: "All Challenges", icon: <Icon.clipboard width={15} height={15} />, path: "/dashboard/all-challenges" },
          { label: "All Winners", icon: <Icon.trophy width={15} height={15} />, path: "/dashboard/all-winners" },
        ].map((a) => (
          <div key={a.label} className="ad-action" onClick={() => router.push(a.path)} style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "1px solid rgba(15,23,42,0.07)", borderRadius: 14, padding: "14px 16px" }}>
            <div className="ad-action-icon" style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(20,19,43,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "#14132B" }}>
              {a.icon}
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "#14132B" }}>{a.label}</span>
            {!!a.badge && (
              <span className="badge-bounce" style={{ position: "absolute", top: -6, right: -6, background: "#DC2626", color: "#fff", fontSize: 10, fontWeight: 800, width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 8px rgba(220,38,38,0.4)" }}>
                {a.badge}
              </span>
            )}
          </div>
        ))}
      </div>


      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        {cards.map((c, i) => {
          const count = useCountUp(c.value, !!stats);
          return (
            <div
              key={c.label}
              className="ad-anim ad-card"
              style={{
                animationDelay: `${i * 0.06}s`,
                background: c.bg,
                borderRadius: 18,
                padding: "18px 16px",
                border: "1px solid rgba(255,255,255,0.5)",
                boxShadow: "0 4px 16px rgba(20,19,43,0.06)",
                transformStyle: "preserve-3d",
                transition: "transform 0.15s ease-out, box-shadow 0.2s ease",
                willChange: "transform",
              }}



              onMouseMove={(e) => {
                const el = e.currentTarget;
                const rect = el.getBoundingClientRect();
                const px = (e.clientX - rect.left) / rect.width;
                const py = (e.clientY - rect.top) / rect.height;
                const rx = (0.5 - py) * 32;
                const ry = (px - 0.5) * 32;
                el.style.transform = `perspective(500px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.08) translateY(-14px)`;
                el.style.boxShadow = "0 36px 60px rgba(20,19,43,0.3)";
                el.style.zIndex = "10";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.transform = "perspective(500px) rotateX(0deg) rotateY(0deg) scale(1) translateY(0)";
                el.style.boxShadow = "0 4px 16px rgba(20,19,43,0.06)";
                el.style.zIndex = "1";
              }}
            >
              <div className="ad-card-shine" />
              <div style={{ position: "absolute", top: -22, right: -22, width: 70, height: 70, borderRadius: "50%", background: c.blob }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, position: "relative" }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: c.tone, opacity: 0.85, display: "flex", alignItems: "center", gap: 5 }}>
                  {c.label}
                  {c.pulse && !!c.value && <span className="pulse-alert" style={{ width: 6, height: 6, borderRadius: "50%", background: c.tone, display: "inline-block" }} />}
                </span>
                                <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.85)", display: "flex", alignItems: "center", justifyContent: "center", color: c.tone, boxShadow: "0 3px 10px rgba(20,19,43,0.15)" }}>
                  {c.icon}
                </div>
              </div>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 800, color: c.tone, position: "relative", fontVariantNumeric: "tabular-nums" }}>
                {count}
              </div>
            </div>
          );
        })}
      </div>

      {/* Composition bar */}
      {stats && (
        <div className="ad-anim" style={{ animationDelay: "0.5s", background: "#fff", border: "1px solid rgba(15,23,42,0.07)", borderRadius: 18, padding: "20px 22px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: "#14132B" }}>User Composition</span>
            <span style={{ fontSize: 12, color: "rgba(20,19,43,0.45)" }}>{stats.totalUsers} total</span>
          </div>
          <div style={{ display: "flex", height: 12, borderRadius: 20, overflow: "hidden", background: "rgba(15,23,42,0.05)" }}>
            <div className="bar-fill" style={{ width: `${((stats.totalStudents || 0) / (stats.totalUsers || 1)) * 100}%`, background: "linear-gradient(90deg,#2563EB,#3B82F6)" }} />
            <div className="bar-fill" style={{ width: `${((stats.totalOrganizers || 0) / (stats.totalUsers || 1)) * 100}%`, background: "linear-gradient(90deg,#D97706,#F59E0B)", animationDelay: "0.1s" }} />
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 12 }}>
            <span style={{ fontSize: 11.5, color: "rgba(20,19,43,0.5)", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: "#2563EB", display: "inline-block" }} /> Students ({stats.totalStudents || 0})
            </span>
            <span style={{ fontSize: 11.5, color: "rgba(20,19,43,0.5)", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: "#D97706", display: "inline-block" }} /> Organizers ({stats.totalOrganizers || 0})
            </span>
          </div>
        </div>
      )}

      {/* Scrolling ticker */}
      <div className="ad-anim ticker-wrap" style={{ animationDelay: "0.6s", background: "#fff", border: "1px solid rgba(15,23,42,0.07)", borderRadius: 14, padding: "12px 0" }}>
        <div className="ticker-track">
          {[...Array(2)].map((_, dup) => (
            <div key={dup} style={{ display: "flex", gap: 40 }}>
              {[
                `${stats?.totalChallenges ?? "…"} challenges live on platform`,
                `${stats?.totalSubmissions ?? "…"} total submissions received`,
                `${stats?.totalWinners ?? "…"} winners announced so far`,
                `${stats?.pendingVerifications ?? "…"} organizers pending verification`,
              ].map((t, idx) => (
                <span key={idx + dup} style={{ fontSize: 12.5, fontWeight: 600, color: "rgba(20,19,43,0.6)", whiteSpace: "nowrap", paddingRight: 40, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#6D4AFF", display: "inline-block" }} />
                  {t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}