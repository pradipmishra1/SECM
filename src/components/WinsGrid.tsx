"use client";

import { useState } from "react";
import TiltCard from "./TiltCard";
import MedalIcon from "./MedalIcon";

const MEDAL: Record<number, { color: string; label: string; grad: string }> = {
  1: { color: "#D4A017", label: "1st Place", grad: "linear-gradient(155deg,#4A3A0D 0%,#6B5316 50%,#4A3A0D 100%)" },
  2: { color: "#9CA3AF", label: "2nd Place", grad: "linear-gradient(160deg,#2A2E33,#3F454D)" },
  3: { color: "#B45309", label: "3rd Place", grad: "linear-gradient(160deg,#3A2410,#5C3A1B)" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function WinDetailModal({ wins, initialPosition, onClose }: { wins: any[]; initialPosition: 1 | 2 | 3; onClose: () => void }) {
  const [filter, setFilter] = useState<1 | 2 | 3>(initialPosition);
  const [copied, setCopied] = useState(false);
  const filtered = wins.filter((w) => w.position === filter).sort((a, b) => new Date(b.announcedAt).getTime() - new Date(a.announcedAt).getTime());
  const counts = { 1: 0, 2: 0, 3: 0 };
  wins.forEach((w) => { if (w.position === 1) counts[1]++; else if (w.position === 2) counts[2]++; else counts[3]++; });
  const m = MEDAL[filter];

  function shareText() {
    const text = `I've won ${wins.length} challenge${wins.length !== 1 ? "s" : ""} on SECM — ${counts[1]} gold, ${counts[2]} silver, ${counts[3]} bronze!`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(20,19,43,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 20 }}>
      <style>{`
        @keyframes wdmPop { from { opacity:0; transform: scale(0.94) translateY(10px); } to { opacity:1; transform: scale(1) translateY(0); } }
        @keyframes wdmRise { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
        .wdm-anim { animation: wdmRise 0.3s cubic-bezier(.2,.8,.2,1) both; }
        .wdm-filter { transition: transform 0.15s ease; }
        .wdm-filter:hover { transform: translateY(-1px); }
        .wdm-row { transition: transform 0.15s ease, box-shadow 0.2s ease; }
        .wdm-row:hover { transform: translateX(4px); }
        .wdm-close { transition: transform 0.15s ease, background 0.15s ease; }
        .wdm-close:hover { transform: rotate(90deg); background: rgba(255,255,255,0.25) !important; }
        .wdm-scroll::-webkit-scrollbar { width: 6px; }
        .wdm-scroll::-webkit-scrollbar-thumb { background: rgba(15,23,42,0.12); border-radius: 10px; }
        .wdm-share { transition: transform 0.15s ease, box-shadow 0.2s ease; }
        .wdm-share:hover { transform: translateY(-1px); box-shadow: 0 6px 14px rgba(20,19,43,0.15); }
      `}</style>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 24, width: 520, maxWidth: "94vw", maxHeight: "85vh", overflow: "hidden", animation: "wdmPop 0.3s cubic-bezier(.2,.8,.2,1)", boxShadow: "0 30px 60px rgba(20,19,43,0.3)", display: "flex", flexDirection: "column" }}>
        <div style={{ background: m.grad, padding: "24px 26px", position: "relative", flexShrink: 0 }}>
          <button className="wdm-close" onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, width: 28, height: 28, cursor: "pointer", color: "#fff", fontSize: 14 }}>✕</button>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <MedalIcon position={filter} size={44} />
            <div>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800, color: "#F5D98C" }}>{m.label} Wins</h2>
              <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>{counts[filter]} win{counts[filter] !== 1 ? "s" : ""} at this rank</p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, padding: "16px 26px 0", flexShrink: 0 }}>
          {([1, 2, 3] as const).map((f) => (
            <button key={f} className="wdm-filter" onClick={() => setFilter(f)} style={{ padding: "7px 14px", borderRadius: 20, border: "none", fontSize: 12.5, fontWeight: 700, cursor: "pointer", background: filter === f ? "linear-gradient(135deg,#6D4AFF,#8B5CF6)" : "rgba(20,19,43,0.05)", color: filter === f ? "#fff" : "rgba(20,19,43,0.6)", display: "flex", alignItems: "center", gap: 6 }}>
              <MedalIcon position={f} size={16} /> {counts[f]}
            </button>
          ))}
          <button className="wdm-filter wdm-share" onClick={shareText} style={{ marginLeft: "auto", padding: "7px 14px", borderRadius: 20, border: "1px solid rgba(109,74,255,0.25)", fontSize: 12, fontWeight: 700, cursor: "pointer", background: "#fff", color: "#6D4AFF" }}>
            {copied ? "✓ Copied!" : "Share stats"}
          </button>
        </div>

        <div className="wdm-scroll" style={{ flex: 1, overflowY: "auto", padding: "16px 26px 26px" }}>
          {filtered.length === 0 ? (
            <p style={{ textAlign: "center", fontSize: 13, color: "rgba(20,19,43,0.4)", padding: "30px 0" }}>No wins at this rank yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map((w, i) => (
                <div key={w.id} className="wdm-row wdm-anim" style={{ animationDelay: `${Math.min(i * 0.04, 0.3)}s`, display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 14, background: m.grad, position: "relative", overflow: "hidden" }}>
                  <div style={{ flexShrink: 0 }}><MedalIcon position={filter} size={30} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#F5D98C", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.challenge.title}</div>
                    <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>{new Date(w.announcedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {timeAgo(w.announcedAt)}</div>
                  </div>
                  {w.challenge.prize && (
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: m.color, background: "rgba(255,255,255,0.12)", padding: "5px 12px", borderRadius: 20, flexShrink: 0, whiteSpace: "nowrap" }}>{w.challenge.prize}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WinsGrid({ wins }: { wins: any[] }) {
  const [detailPos, setDetailPos] = useState<1 | 2 | 3 | null>(null);

  const counts = { 1: 0, 2: 0, 3: 0 };
  wins.forEach((w) => { if (w.position === 1) counts[1]++; else if (w.position === 2) counts[2]++; else counts[3]++; });

  const bestStreak = (() => {
    const sorted = [...wins].sort((a, b) => new Date(a.announcedAt).getTime() - new Date(b.announcedAt).getTime());
    let streak = 0, best = 0;
    for (const w of sorted) {
      if (w.position === 1) { streak++; best = Math.max(best, streak); }
      else streak = 0;
    }
    return best;
  })();

  const prizeWinsCount = wins.filter((w) => w.challenge.prize).length;
  const mostRecent = [...wins].sort((a, b) => new Date(b.announcedAt).getTime() - new Date(a.announcedAt).getTime())[0];
  const firstWin = [...wins].sort((a, b) => new Date(a.announcedAt).getTime() - new Date(b.announcedAt).getTime())[0];
  const winScore = counts[1] * 3 + counts[2] * 2 + counts[3] * 1;
  const hasFullPodium = counts[1] > 0 && counts[2] > 0 && counts[3] > 0;
  const dominantRank = counts[1] >= counts[2] && counts[1] >= counts[3] ? 1 : counts[2] >= counts[3] ? 2 : 3;

  const thisMonthCount = wins.filter((w) => {
    const d = new Date(w.announcedAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const milestones = [5, 10, 25, 50, 100];
  const nextMilestone = milestones.find((m) => m > wins.length) || null;

  const RANK_CARDS = [
    { pos: 1 as const, ...MEDAL[1], count: counts[1] },
    { pos: 2 as const, ...MEDAL[2], count: counts[2] },
    { pos: 3 as const, ...MEDAL[3], count: counts[3] },
  ];

  return (
    <div>
      <style>{`
        @keyframes winsHeroIn { from { opacity:0; transform: translateY(-10px); } to { opacity:1; transform: translateY(0); } }
        @keyframes winCardIn { from { opacity:0; transform: translateY(14px) scale(0.96); } to { opacity:1; transform: translateY(0) scale(1); } }
        @keyframes orbFloatA { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-14px,10px) scale(1.06); } }
        @keyframes orbFloatB { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(12px,-8px) scale(0.94); } }
        @keyframes trophyBounce { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-4px) rotate(-6deg); } }
        @keyframes goldShine { 0% { transform: translateX(-120%) rotate(20deg); } 100% { transform: translateX(220%) rotate(20deg); } }
        @keyframes medalGlow { 0%,100% { filter: drop-shadow(0 0 4px var(--gc)); } 50% { filter: drop-shadow(0 0 12px var(--gc)); } }
        @keyframes pbFill { from { width: 0%; } }
        .wins-hero { animation: winsHeroIn 0.5s cubic-bezier(.2,.8,.2,1) both; }
        .rank-card { animation: winCardIn 0.45s cubic-bezier(.2,.8,.2,1) both; cursor: pointer; transition: transform 0.25s cubic-bezier(.2,.8,.2,1); }
        .rank-card:hover { transform: translateY(-6px) scale(1.02); }
        .orb-a { animation: orbFloatA 7s ease-in-out infinite; }
        .orb-b { animation: orbFloatB 6s ease-in-out infinite; }
        .trophy-icon { animation: trophyBounce 2.4s ease-in-out infinite; display: inline-block; }
        .gold-shine { position: absolute; top: -20%; left: 0; width: 40px; height: 160%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent); animation: goldShine 3.5s ease-in-out infinite; pointer-events: none; }
        .gold-medal-emoji { animation: medalGlow 2s ease-in-out infinite; }
        .streak-badge, .stat-chip { transition: transform 0.15s ease; }
        .streak-badge:hover, .stat-chip:hover { transform: scale(1.05); }
        .stats-row { animation: winCardIn 0.5s cubic-bezier(.2,.8,.2,1) 0.15s both; }
        .progress-bar-fill { animation: pbFill 1s cubic-bezier(.2,.8,.2,1) 0.3s both; }
      `}</style>

      {/* Hero banner */}
      <div className="wins-hero" style={{ background: "linear-gradient(120deg,#D4A017 0%,#F5C453 50%,#FDE68A 100%)", borderRadius: 20, padding: "26px 28px", marginBottom: 18, display: "flex", alignItems: "center", gap: 20, position: "relative", overflow: "hidden" }}>
        <div className="orb-a" style={{ position: "absolute", top: -30, right: 40, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,0.18)" }} />
        <div className="orb-b" style={{ position: "absolute", bottom: -20, right: 160, width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.12)" }} />

        <div className="trophy-icon" style={{ position: "relative" }}>
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id="hero-trophy" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFE9A8" />
                <stop offset="60%" stopColor="#F5C453" />
                <stop offset="100%" stopColor="#B8860B" />
              </linearGradient>
            </defs>
            <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4Z" fill="url(#hero-trophy)" stroke="#8B6914" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 5H4a1 1 0 0 0-1 1c0 2.5 1.8 4.5 4 4.9M17 5h3a1 1 0 0 1 1 1c0 2.5-1.8 4.5-4 4.9" stroke="#B8860B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>
        <div style={{ position: "relative" }}>
          <p style={{ fontSize: 13, color: "rgba(60,40,0,0.7)", fontWeight: 700 }}>Total Victories</p>
          <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 30, fontWeight: 800, color: "#3A2A00" }}>{wins.length} Total Wins</p>
          <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
            {bestStreak >= 2 && (
              <span className="streak-badge" style={{ fontSize: 11.5, fontWeight: 700, color: "#3A2A00", background: "rgba(255,255,255,0.35)", padding: "3px 10px", borderRadius: 20 }}>
                {bestStreak}x streak
              </span>
            )}
            {hasFullPodium && (
              <span className="streak-badge" style={{ fontSize: 11.5, fontWeight: 700, color: "#3A2A00", background: "rgba(255,255,255,0.35)", padding: "3px 10px", borderRadius: 20 }}>
                Full podium
              </span>
            )}
            {thisMonthCount > 0 && (
              <span className="streak-badge" style={{ fontSize: 11.5, fontWeight: 700, color: "#3A2A00", background: "rgba(255,255,255,0.35)", padding: "3px 10px", borderRadius: 20 }}>
                {thisMonthCount} this month
              </span>
            )}
          </div>
        </div>

        <div style={{ marginLeft: "auto", textAlign: "right", position: "relative" }}>
          <p style={{ fontSize: 11.5, color: "rgba(60,40,0,0.6)", fontWeight: 700 }}>Win Score</p>
          <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 800, color: "#3A2A00" }}>{winScore}</p>
        </div>
      </div>

      {wins.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.07)", padding: 50, textAlign: "center" }}>
          <div style={{ marginBottom: 10, opacity: 0.25, display: "flex", justifyContent: "center" }}>
            <MedalIcon position={1} size={40} />
          </div>
          <p style={{ color: "rgba(20,19,43,0.4)", fontSize: 14 }}>No wins yet — keep participating!</p>
        </div>
      ) : (
        <>
          {/* 3 rank summary cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18, marginBottom: 20 }}>
            {RANK_CARDS.map((r, i) => (
              <div key={r.pos} className="rank-card" style={{ animationDelay: `${i * 0.08}s` }} onClick={() => setDetailPos(r.pos)}>
                <TiltCard
                  style={{
                    background: r.grad,
                    borderRadius: 20,
                    border: `1.5px solid ${r.color}44`,
                    padding: 26,
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: `0 12px 32px ${r.color}33`,
                    minHeight: 180,
                  }}
                >
                  {r.pos === 1 && <div className="gold-shine" />}
                  <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 15% 0%, ${r.color}33, transparent 65%)`, pointerEvents: "none" }} />
                  {dominantRank === r.pos && r.count > 0 && (
                    <span style={{ position: "absolute", top: 14, right: 14, fontSize: 9.5, fontWeight: 800, color: r.color, background: "rgba(255,255,255,0.1)", padding: "3px 9px", borderRadius: 20, letterSpacing: 0.5 }}>
                      MOST EARNED
                    </span>
                  )}
                  <div className={r.pos === 1 ? "gold-medal-emoji" : ""} style={{ position: "relative", marginBottom: 14, ["--gc" as any]: r.color }}>
                    <MedalIcon position={r.pos} size={54} />
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 800, color: r.color, letterSpacing: 1, textTransform: "uppercase", position: "relative", marginBottom: 6 }}>{r.label}</p>
                  <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 34, fontWeight: 800, color: "#F5D98C", position: "relative" }}>{r.count}</p>
                  <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.45)", position: "relative", marginTop: 4 }}>Click to view all →</p>
                </TiltCard>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="stats-row" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
            <StatCard label="Prize Wins" value={String(prizeWinsCount)} />
            <StatCard label="Latest Win" value={mostRecent ? timeAgo(mostRecent.announcedAt) : "—"} />
            <StatCard label="First Win" value={firstWin ? new Date(firstWin.announcedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—"} />
            <StatCard label="Win Score" value={String(winScore)} sub="3/2/1 pts by rank" />
          </div>

          {/* Progress to next milestone */}
          {nextMilestone && (
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(15,23,42,0.07)", padding: "18px 22px", marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#14132B" }}>Next milestone: {nextMilestone} wins</span>
                <span style={{ fontSize: 12, color: "rgba(20,19,43,0.45)", fontWeight: 600 }}>{wins.length}/{nextMilestone}</span>
              </div>
              <div style={{ height: 8, borderRadius: 20, background: "rgba(20,19,43,0.06)", overflow: "hidden" }}>
                <div className="progress-bar-fill" style={{ height: "100%", width: `${Math.min((wins.length / nextMilestone) * 100, 100)}%`, borderRadius: 20, background: "linear-gradient(90deg,#D4A017,#F5C453)" }} />
              </div>
            </div>
          )}
        </>
      )}

      {detailPos && <WinDetailModal wins={wins} initialPosition={detailPos} onClose={() => setDetailPos(null)} />}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="stat-chip" style={{ background: "#fff", borderRadius: 14, border: "1px solid rgba(15,23,42,0.07)", padding: "16px 18px" }}>
      <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 800, color: "#14132B" }}>{value}</div>
      <div style={{ fontSize: 11, color: "rgba(20,19,43,0.45)", marginTop: 2, fontWeight: 600 }}>{label}</div>
      {sub && <div style={{ fontSize: 9.5, color: "rgba(20,19,43,0.3)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}