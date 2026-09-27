"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LogoMark } from "./Logo";
import StatCard from "./StatCard";
import AvatarStack from "./AvatarStack";
import TiltCard from "./TiltCard";
import { StatusPill, TypeBadge } from "./Badges";
import { Icon } from "./icons";
import ActivityChart from "./ActivityChart";

function challengeStatus(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now();
  const days = Math.ceil(diff / 86400000);
  if (days < 0) return "Closed";
  if (days <= 1) return "Closing soon";
  return "Open";
}

function daysLeft(deadline: string) {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
}

function ScrollReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.6s cubic-bezier(.22,1.12,.4,1) ${delay}s, transform 0.6s cubic-bezier(.22,1.12,.4,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function CountUpNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const duration = 800;
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [value]);
  return (
    <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 34, fontWeight: 800, position: "relative", fontVariantNumeric: "tabular-nums" }}>
      {display}
    </div>
  );
}

export default function StudentDashboard({
  userName,
  stats,
  challenges,
  leaderboard,
  activity,
  upcomingDeadlines = [],
  recommended = [],
  streak = 0,
  weeklyActivity = [],
  joinedIds = [],
  draftSubmission = null,
}: {
  userName: string;
  stats: { activeChallenges: number; teams: number; submissions: number; wins: number };
  challenges: any[];
  leaderboard: { name: string; points: number }[];
  activity: { text: string; time: string }[];
  upcomingDeadlines?: any[];
  recommended?: any[];
  streak?: number;
  weeklyActivity?: { label: string; count: number }[];
  joinedIds?: string[];
  draftSubmission?: { id: string; challengeId: string; challengeTitle: string } | null;
}) {
  const router = useRouter();
  const MEDALS = ["#D4A017", "#9CA3AF", "#B45309"];

  return (
    <div>
      <style>{`
        :root {
          --sp-1: 4px; --sp-2: 8px; --sp-3: 16px; --sp-4: 24px; --sp-5: 32px; --sp-6: 48px;
        }
        @keyframes riseIn { 0% { opacity:0; transform: translateY(22px) scale(0.96); } 60% { opacity:1; transform: translateY(-3px) scale(1.005); } 100% { opacity:1; transform: translateY(0) scale(1); } }
        @keyframes headIn { 0% { opacity:0; transform: translateX(-14px); } 65% { transform: translateX(2px); } 100% { opacity:1; transform: translateX(0); } }
        @keyframes flameFlicker { 0%,100% { transform: scale(1) rotate(0deg); } 50% { transform: scale(1.1) rotate(-4deg); } }
        @keyframes streakGlow { 0%,100% { box-shadow: 0 4px 14px rgba(217,119,6,0.18); } 50% { box-shadow: 0 4px 22px rgba(217,119,6,0.32); } }
        @keyframes softPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.55; } }
        @keyframes popIn { 0% { opacity:0; transform: scale(0.8); } 55% { opacity:1; transform: scale(1.06); } 100% { transform: scale(1); } }

        .head-anim { animation: headIn 0.6s cubic-bezier(.34,1.56,.64,1) both; }
        .stat-anim { animation: riseIn 0.6s cubic-bezier(.22,1.12,.4,1) both; }

        .row-anim { transition: background 0.2s ease, transform 0.22s cubic-bezier(.34,1.56,.64,1); position: relative; }
        .row-anim:hover { transform: translateX(6px); background: #F9F8FE; }
        .row-icon { transition: transform 0.3s cubic-bezier(.34,1.56,.64,1), background 0.3s ease; }
        .row-anim:hover .row-icon { transform: rotate(-6deg) scale(1.08); background: rgba(109,74,255,0.16) !important; }

        .view-all { position: relative; transition: gap 0.2s ease, opacity 0.15s ease; display: inline-flex; align-items: center; gap: 4px; cursor: pointer; }
        .view-all:hover { gap: 8px; opacity: 0.8; }

        .lb-row { transition: transform 0.2s ease, background 0.2s ease; border-radius: 10px; }
        .lb-row:hover { transform: translateX(3px); background: #F9F8FE; }

        .activity-dot { width: 7px; height: 7px; border-radius: 50%; background: #6D4AFF; flex-shrink: 0; margin-top: 5px; box-shadow: 0 0 0 3px rgba(109,74,255,0.12); }

        .quick-action-icon { transition: transform 0.3s cubic-bezier(.34,1.56,.64,1), background 0.2s ease; }

        .flame-icon { animation: flameFlicker 1.4s ease-in-out infinite; display: inline-block; }
        .streak-badge { animation: streakGlow 2.4s ease-in-out infinite; }

        .deadline-row { transition: transform 0.2s ease, background 0.2s ease; border-radius: 10px; }
        .deadline-row:hover { transform: translateX(3px); background: #FBFAFF; }

        .rec-card { transition: transform 0.22s cubic-bezier(.2,.8,.2,1), box-shadow 0.2s ease; cursor: pointer; }
        .rec-card:hover { transform: translateY(-4px); }

        .section-icon-badge { display: flex; align-items: center; justify-content: center; border-radius: 11px; flex-shrink: 0; }

        .skeleton-pulse { animation: softPulse 1.5s ease-in-out infinite; background: rgba(20,19,43,0.06); border-radius: 8px; }

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

        .quick-action { transition: transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease, border-color 0.2s ease; cursor: pointer; }
        .quick-action:hover { transform: translateY(-4px); box-shadow: 0 14px 30px rgba(109,74,255,0.14); border-color: rgba(109,74,255,0.2) !important; }
        .quick-action:hover .quick-action-icon { transform: scale(1.1) rotate(-4deg); background: rgba(109,74,255,0.16) !important; }
        .quick-action:hover .quick-action-link { gap: 8px; }
        .quick-action-link { transition: gap 0.2s ease; }
      `}</style>

      {/* Header */}
      <div className="head-anim" style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14 }}>
        <div>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 38, fontWeight: 800, color: "#14132B", marginBottom: 8, letterSpacing: -1.1, lineHeight: 1.1 }}>
            Welcome back, {userName}
          </h1>
          <p style={{ color: "rgba(20,19,43,0.48)", fontSize: 13.5, fontWeight: 500 }}></p>
        </div>
        {streak > 0 && (
          <div className="streak-badge" style={{ display: "flex", alignItems: "center", gap: 9, background: "linear-gradient(135deg,#FFF7E8,#FFEFD1)", border: "1px solid rgba(217,119,6,0.22)", borderRadius: 12, padding: "10px 16px" }}>
            <span className="flame-icon" style={{ fontSize: 16 }}>🔥</span>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: "#92400E" }}>{streak}-day streak</span>
          </div>
        )}
      </div>

      {/* Credit-card style stat cards */}
      <div style={{ display: "flex", gap: 16, marginBottom: 26 }}>
        {[
          { label: "Active Challenges", value: stats.activeChallenges, icon: <Icon.flag width={15} height={15} />, bg: "linear-gradient(155deg,#F5F3FF,#EDE9FE)", accent: "#6D4AFF", c1: "#C4B5FD", c2: "#8B5CF6" },
          { label: "Teams", value: stats.teams, icon: <Icon.users width={15} height={15} />, bg: "linear-gradient(155deg,#EFF6FF,#DBEAFE)", accent: "#2563EB", c1: "#93C5FD", c2: "#3B82F6" },
          { label: "Submissions", value: stats.submissions, icon: <Icon.upload width={15} height={15} />, bg: "linear-gradient(155deg,#FFFBEB,#FEF3C7)", accent: "#D97706", c1: "#FCD34D", c2: "#F59E0B" },
          { label: "Wins", value: stats.wins, icon: <Icon.trophy width={15} height={15} />, bg: "linear-gradient(155deg,#F0FDF4,#D1FAE5)", accent: "#059669", c1: "#6EE7B7", c2: "#10B981" },
        ].map((s, i) => (
          <div
            key={s.label}
            className="stat-anim credit-card"
            style={{
              flex: 1,
              animationDelay: `${0.04 + i * 0.05}s`,
              background: s.bg,
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
            <div className="card-spotlight" style={{ position: "absolute", inset: 0, pointerEvents: "none", transition: "background 0.08s linear" }} />
            <div className="card-shine" />
            <div className="card-circle-1" style={{ position: "absolute", bottom: -18, right: 26, width: 46, height: 46, borderRadius: "50%", background: s.c1, opacity: 0.55 }} />
            <div className="card-circle-2" style={{ position: "absolute", bottom: -18, right: 4, width: 46, height: 46, borderRadius: "50%", background: s.c2, opacity: 0.55, mixBlendMode: "multiply" }} />
            <div className="card-watermark" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
              <img src="/brand/logobg.png" alt="" width={64} height={64} style={{ objectFit: "contain" }} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
              <div className="card-chip" style={{ width: 34, height: 26, borderRadius: 6, background: "rgba(255,255,255,0.7)", border: `1px solid ${s.accent}33`, display: "flex", alignItems: "center", justifyContent: "center", color: s.accent }}>
                {s.icon}
              </div>
            </div>

            <div style={{ position: "relative" }}>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 32, fontWeight: 800, color: s.accent, letterSpacing: 1, fontVariantNumeric: "tabular-nums" }}>
                <CountUpNumber value={s.value} />
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "rgba(20,19,43,0.5)", marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="head-anim" style={{ display: "flex", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Browse Challenges", sub: "Find something new", icon: <Icon.clipboard width={22} height={22} />, path: "/dashboard/my-challenges" },
          { label: "My Teams", sub: "Manage your squads", icon: <Icon.users width={22} height={22} />, path: "/dashboard/teams" },
          { label: "My Submissions", sub: "Track your entries", icon: <Icon.upload width={22} height={22} />, path: "/dashboard/submissions" },
        ].map((a) => (
          <div
            key={a.label}
            className="quick-action"
            onClick={() => router.push(a.path)}
            style={{ flex: 1, background: "#fff", border: "1px solid rgba(15,23,42,0.07)", borderRadius: 16, padding: "20px 22px" }}
          >
            <div className="quick-action-icon" style={{ width: 46, height: 46, borderRadius: 12, background: "rgba(109,74,255,0.09)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6D4AFF", marginBottom: 14 }}>
              {a.icon}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#14132B", marginBottom: 3 }}>{a.label}</div>
            <div style={{ fontSize: 13, color: "rgba(20,19,43,0.45)", marginBottom: 10 }}>{a.sub}</div>
            <span className="quick-action-link" style={{ fontSize: 12.5, fontWeight: 700, color: "#6D4AFF", display: "inline-flex", alignItems: "center", gap: 4 }}>
              Get Started <Icon.arrow width={12} height={12} />
            </span>
          </div>
        ))}
      </div>

      {draftSubmission && (
        <div
          className="head-anim quick-action"
          onClick={() => router.push(`/dashboard/challenge/${draftSubmission.challengeId}`)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "linear-gradient(135deg,#EEF2FF,#F5F3FF)", border: "1px solid rgba(109,74,255,0.15)",
            borderRadius: 20, padding: "20px 25px", marginBottom: 35,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 50, height: 50, borderRadius: 12, background: "rgba(109,74,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6D4AFF", flexShrink: 0 }}>
              <Icon.upload width={25} height={25} />
            </div>
            <div>
              <div style={{ fontSize: 16.5, fontWeight: 700, color: "#14132B" }}>Continue where you left off</div>
              <div style={{ fontSize: 18.5, color: "rgba(20,19,43,0.5)" }}>{draftSubmission.challengeTitle}</div>
            </div>
          </div>
          <span className="view-all" style={{ fontSize: 13, color: "#6D4AFF", fontWeight: 700 }}>
            Finish <Icon.arrow width={18} height={18} />
          </span>
        </div>
      )}

      {/* Main two-column area */}
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
          {upcomingDeadlines.length > 0 && (
            <ScrollReveal>
              <TiltCard intensity={4} glow="rgba(220,38,38,0.1)" style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(15,23,42,0.07)", padding: 22 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div className="section-icon-badge" style={{ width: 30, height: 30, background: "rgba(220,38,38,0.08)", color: "#B91C1C" }}>
                    <Icon.flag width={15} height={15} />
                  </div>
                  <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16.5, fontWeight: 800, color: "#14132B", letterSpacing: -0.2 }}>
                    Upcoming Deadlines
                  </h2>
                </div>
                {upcomingDeadlines.map((c: any) => {
                  const d = daysLeft(c.deadline);
                  return (
                    <div key={c.id} className="deadline-row" onClick={() => router.push(`/dashboard/challenge/${c.id}`)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 9px", cursor: "pointer" }}>
                      <span style={{ fontSize: 14.5, fontWeight: 700, color: "#14132B", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: d <= 1 ? "#B91C1C" : "#6D4AFF", background: d <= 1 ? "rgba(220,38,38,0.08)" : "rgba(109,74,255,0.08)", padding: "4px 10px", borderRadius: 20 }}>
                        {d === 0 ? "Today" : `${d}d left`}
                      </span>
                    </div>
                  );
                })}
              </TiltCard>
            </ScrollReveal>
          )}

          <ScrollReveal delay={0.08}>
            <TiltCard intensity={4} glow="rgba(212,160,23,0.15)" style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(15,23,42,0.07)", padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div className="section-icon-badge" style={{ width: 30, height: 30, background: "rgba(212,160,23,0.12)", color: "#B45309" }}>
                  <Icon.trophy width={15} height={15} />
                </div>
                <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16.5, fontWeight: 800, color: "#14132B", letterSpacing: -0.2 }}>Leaderboard</h2>
              </div>
              {leaderboard.slice(0, 3).map((entry, i) => (
                <div key={i} className="lb-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 9px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                    <div style={{ width: 26, height: 26, borderRadius: "60%", background: MEDALS[i], color: "#fff", fontSize: 11.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 3px 8px ${MEDALS[i]}55` }}>
                      {i + 1}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#14132B" }}>{entry.name}</span>
                  </div>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "#14132B" }}>{entry.points} pts</span>
                </div>
              ))}
              {leaderboard.length === 0 && <p style={{ fontSize: 14.5, color: "rgba(20,19,43,0.4)" }}>No scores yet.</p>}
            </TiltCard>
          </ScrollReveal>

          <ScrollReveal delay={0.14}>
            <TiltCard intensity={4} glow="rgba(37,99,235,0.12)" style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(15,23,42,0.07)", padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div className="section-icon-badge" style={{ width: 30, height: 30, background: "rgba(37,99,235,0.1)", color: "#2563EB" }}>
                  <Icon.inbox width={15} height={15} />
                </div>
                <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16.5, fontWeight: 800, color: "#14132B", letterSpacing: -0.2 }}>Recent Activity</h2>
              </div>
              {activity.length === 0 ? (
                <p style={{ fontSize: 13.5, color: "rgba(20,19,43,0.4)" }}>No recent activity.</p>
              ) : (
                activity.map((a, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderTop: i > 0 ? "1px solid rgba(15,23,42,0.05)" : "none" }}>
                    <div className="activity-dot" />
                    <p style={{ fontSize: 13, color: "rgba(20,19,43,0.65)", lineHeight: 1.55 }}>
                      <span style={{ color: "rgba(20,19,43,0.35)" }}>{a.time} — </span>
                      {a.text}
                    </p>
                  </div>
                ))
              )}
            </TiltCard>
          </ScrollReveal>
        </div>

        <div style={{ flex: 2 }}>
          <ScrollReveal delay={0.05}>
            <TiltCard intensity={2} glow="rgba(109,74,255,0.08)" style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(15,23,42,0.07)", padding: 26 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="section-icon-badge" style={{ width: 32, height: 32, background: "rgba(109,74,255,0.1)", color: "#6D4AFF" }}>
                    <Icon.flag width={16} height={16} />
                  </div>
                  <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 19, fontWeight: 800, color: "#14132B", letterSpacing: -0.3 }}>Open Challenges</h2>
                </div>
                <span className="view-all" onClick={() => router.push("/dashboard/my-challenges")} style={{ fontSize: 14, color: "#6D4AFF", fontWeight: 700 }}>
                  View all <Icon.arrow width={14} height={14} />
                </span>
              </div>

              {challenges.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(109,74,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#6D4AFF" }}>
                    <Icon.flag width={22} height={22} />
                  </div>
                  <p style={{ color: "rgba(20,19,43,0.45)", fontSize: 14.5, marginBottom: 16 }}>No published challenges yet.</p>
                  <button
                    onClick={() => router.push("/dashboard/my-challenges")}
                    style={{
                      background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)", color: "#fff", border: "none",
                      borderRadius: 11, padding: "11px 22px", fontSize: 13.5, fontWeight: 700, cursor: "pointer",
                      boxShadow: "0 9px 20px rgba(109,74,255,0.25)",
                    }}
                  >
                    Browse Challenges
                  </button>
                </div>
              ) : (
                challenges.map((c, i) => {
                  const status = challengeStatus(c.deadline);
                  const isJoined = joinedIds.includes(c.id);
                  return (
                    <div
                      key={c.id}
                      className="row-anim"
                      onClick={() => router.push(`/dashboard/challenge/${c.id}`)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "16px 12px", cursor: "pointer", borderTop: i > 0 ? "1px solid rgba(15,23,42,0.05)" : "none",
                        borderRadius: 14,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div className="row-icon" style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(109,74,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6D4AFF", flexShrink: 0 }}>
                          <Icon.flag width={18} height={18} />
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 14.5, fontWeight: 700, color: "#14132B" }}>{c.title}</span>
                            {isJoined && (
                              <span style={{ fontSize: 10.5, fontWeight: 700, color: "#15803D", background: "rgba(22,163,74,0.1)", padding: "3px 8px", borderRadius: 20 }}>
                                ✓ Joined
                              </span>
                            )}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 5 }}>
                            <span style={{ fontSize: 12.5, color: "rgba(20,19,43,0.45)" }}>Ends: {new Date(c.deadline).toLocaleDateString()}</span>
                            <AvatarStack members={c.participations?.map((p: any) => ({ name: p.user.name, image: p.user.image })) || []} />
                          </div>
                        </div>
                      </div>
                      <StatusPill status={status} />
                    </div>
                  );
                })
              )}
            </TiltCard>
          </ScrollReveal>

          {weeklyActivity.length > 0 && (
            <ScrollReveal delay={0.1}>
              <div style={{ marginTop: 18 }}>
                <TiltCard intensity={2} glow="rgba(109,74,255,0.08)" style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(15,23,42,0.07)", padding: 26 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                    <div className="section-icon-badge" style={{ width: 32, height: 32, background: "rgba(37,99,235,0.1)", color: "#2563EB" }}>
                      <Icon.upload width={16} height={16} />
                    </div>
                    <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 19, fontWeight: 800, color: "#14132B", letterSpacing: -0.3 }}>
                      Your Activity
                    </h2>
                  </div>
                  <ActivityChart data={weeklyActivity} />
                </TiltCard>
              </div>
            </ScrollReveal>
          )}
        </div>
      </div>

      {/* Recommended For You */}
      {recommended.length > 0 && (
        <ScrollReveal>
          <div style={{ marginTop: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div className="section-icon-badge" style={{ width: 32, height: 32, background: "rgba(219,39,119,0.1)", color: "#DB2777" }}>
                <Icon.trophy width={16} height={16} />
              </div>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 19, fontWeight: 800, color: "#14132B", letterSpacing: -0.3 }}>Recommended For You</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
              {recommended.map((c: any) => (
                <div key={c.id} className="rec-card" onClick={() => router.push(`/dashboard/challenge/${c.id}`)}>
                  <TiltCard intensity={3} glow="rgba(109,74,255,0.1)" style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.07)", padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <TypeBadge type={c.type} />
                      {c.matchCount > 0 && (
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: "#15803D", background: "rgba(22,163,74,0.1)", padding: "3px 9px", borderRadius: 20 }}>Match</span>
                      )}
                    </div>
                    <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 14.5, fontWeight: 700, color: "#14132B", marginBottom: 10, lineHeight: 1.35 }}>{c.title}</h3>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "rgba(20,19,43,0.45)" }}>
                      <span>{c.organizer?.orgName}</span>
                      <span>{new Date(c.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    </div>
                  </TiltCard>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      )}
    </div>
  );
}