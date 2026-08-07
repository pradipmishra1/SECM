"use client";

import { useRouter } from "next/navigation";
import StatCard from "./StatCard";
import AvatarStack from "./AvatarStack";
import TiltCard from "./TiltCard";
import { StatusPill, TypeBadge } from "./Badges";
import { Icon } from "./icons";

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

export default function StudentDashboard({
  userName,
  stats,
  challenges,
  leaderboard,
  activity,
  upcomingDeadlines = [],
  recommended = [],
  streak = 0,
}: {
  userName: string;
  stats: { activeChallenges: number; teams: number; submissions: number; wins: number };
  challenges: any[];
  leaderboard: { name: string; points: number }[];
  activity: { text: string; time: string }[];
  upcomingDeadlines?: any[];
  recommended?: any[];
  streak?: number;
}) {
  const router = useRouter();
  const MEDALS = ["#D4A017", "#9CA3AF", "#B45309"];

  return (
    <div>
      <style>{`
        @keyframes riseIn { from { opacity:0; transform: translateY(16px) scale(0.98); } to { opacity:1; transform: translateY(0) scale(1); } }
        @keyframes headIn { from { opacity:0; transform: translateX(-8px); } to { opacity:1; transform: translateX(0); } }
        @keyframes flameFlicker { 0%,100% { transform: scale(1) rotate(0deg); } 50% { transform: scale(1.1) rotate(-4deg); } }
        .head-anim { animation: headIn 0.5s cubic-bezier(.2,.8,.2,1) both; }
        .stat-anim { animation: riseIn 0.55s cubic-bezier(.2,.8,.2,1) both; }
        .side-card { animation: riseIn 0.55s cubic-bezier(.2,.8,.2,1) both; }
        .main-card { animation: riseIn 0.55s cubic-bezier(.2,.8,.2,1) both; }
        .row-anim { transition: background 0.2s ease, transform 0.2s cubic-bezier(.2,.8,.2,1); position: relative; }
        .row-anim:hover { transform: translateX(4px); }
        .row-icon { transition: transform 0.3s cubic-bezier(.34,1.56,.64,1), background 0.3s ease; }
        .row-anim:hover .row-icon { transform: rotate(-6deg) scale(1.08); background: rgba(109,74,255,0.16) !important; }
        .view-all { position: relative; transition: gap 0.2s ease; display: inline-flex; align-items: center; gap: 4px; }
        .view-all:hover { gap: 8px; }
        .lb-row { transition: transform 0.2s ease; }
        .lb-row:hover { transform: translateX(3px); }
        .activity-dot { width: 6px; height: 6px; border-radius: 50%; background: #6D4AFF; flex-shrink: 0; margin-top: 5px; }
        .quick-action { transition: transform 0.15s ease, box-shadow 0.2s ease; cursor: pointer; }
        .quick-action:hover { transform: translateY(-2px); box-shadow: 0 8px 18px rgba(15,23,42,0.08); }
        .flame-icon { animation: flameFlicker 1.4s ease-in-out infinite; display: inline-block; }
        .deadline-row { transition: transform 0.2s ease; }
        .deadline-row:hover { transform: translateX(3px); }
        .rec-card { transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; }
        .rec-card:hover { transform: translateY(-3px); }
      `}</style>

      <div className="head-anim" style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 27, fontWeight: 700, color: "#14132B", marginBottom: 6, letterSpacing: -0.5 }}>
            Welcome back, <span style={{ background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{userName}</span>
          </h1>
          <p style={{ color: "rgba(20,19,43,0.5)", fontSize: 14 }}>
            Here's a quick overview of your latest challenges and progress.
          </p>
        </div>
        {streak > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,#FEF3C7,#FFFBEB)", border: "1px solid rgba(217,119,6,0.15)", borderRadius: 20, padding: "8px 16px" }}>
            <span className="flame-icon" style={{ fontSize: 18 }}>🔥</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#92400E" }}>{streak} day{streak !== 1 ? "s" : ""} streak</span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="head-anim" style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Browse Challenges", icon: <Icon.clipboard width={15} height={15} />, path: "/dashboard/my-challenges" },
          { label: "My Teams", icon: <Icon.users width={15} height={15} />, path: "/dashboard/teams" },
          { label: "My Submissions", icon: <Icon.upload width={15} height={15} />, path: "/dashboard/submissions" },
        ].map((a) => (
          <div
            key={a.label}
            className="quick-action"
            onClick={() => router.push(a.path)}
            style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "1px solid rgba(15,23,42,0.07)", borderRadius: 14, padding: "14px 16px" }}
          >
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(109,74,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6D4AFF" }}>
              {a.icon}
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#14132B" }}>{a.label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <div className="stat-anim" style={{ flex: 1, animationDelay: "0.05s" }}>
          <StatCard label="Active Challenges" value={stats.activeChallenges} icon={<Icon.flag width={17} height={17} />} tone="violet" />
        </div>
        <div className="stat-anim" style={{ flex: 1, animationDelay: "0.12s" }}>
          <StatCard label="Teams" value={stats.teams} icon={<Icon.users width={17} height={17} />} tone="blue" />
        </div>
        <div className="stat-anim" style={{ flex: 1, animationDelay: "0.19s" }}>
          <StatCard label="Submissions" value={stats.submissions} icon={<Icon.upload width={17} height={17} />} tone="amber" />
        </div>
        <div className="stat-anim" style={{ flex: 1, animationDelay: "0.26s" }}>
          <StatCard label="Wins" value={stats.wins} icon={<Icon.trophy width={17} height={17} />} tone="green" />
        </div>
      </div>

      <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
        <div className="main-card" style={{ flex: 2, animationDelay: "0.3s" }}>
          <TiltCard intensity={2} glow="rgba(109,74,255,0.08)" style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.07)", padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15.5, fontWeight: 700, color: "#14132B" }}>Open Challenges</h2>
              <span className="view-all" onClick={() => router.push("/dashboard/my-challenges")} style={{ fontSize: 12.5, color: "#6D4AFF", fontWeight: 600, cursor: "pointer" }}>
                View all <Icon.arrow width={12} height={12} />
              </span>
            </div>

            {challenges.length === 0 ? (
              <p style={{ color: "rgba(20,19,43,0.4)", fontSize: 14, padding: "24px 0", textAlign: "center" }}>No published challenges yet.</p>
            ) : (
              challenges.map((c, i) => {
                const status = challengeStatus(c.deadline);
                return (
                  <div
                    key={c.id}
                    className="row-anim"
                    onClick={() => router.push(`/dashboard/challenge/${c.id}`)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "14px 10px", cursor: "pointer", borderTop: i > 0 ? "1px solid rgba(15,23,42,0.05)" : "none",
                      borderRadius: 12,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#F9F8FE")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div className="row-icon" style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(109,74,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6D4AFF" }}>
                        <Icon.flag width={16} height={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#14132B" }}>{c.title}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                          <span style={{ fontSize: 12, color: "rgba(20,19,43,0.4)" }}>Ends: {new Date(c.deadline).toLocaleDateString()}</span>
                          <AvatarStack count={c.teams?.length || 0} />
                        </div>
                      </div>
                    </div>
                    <StatusPill status={status} />
                  </div>
                );
              })
            )}
          </TiltCard>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          {upcomingDeadlines.length > 0 && (
            <div className="side-card" style={{ animationDelay: "0.3s" }}>
              <TiltCard intensity={4} glow="rgba(220,38,38,0.1)" style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.07)", padding: 20 }}>
                <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "#14132B", marginBottom: 14 }}>⏰ Upcoming Deadlines</h2>
                {upcomingDeadlines.map((c: any) => {
                  const d = daysLeft(c.deadline);
                  return (
                    <div key={c.id} className="deadline-row" onClick={() => router.push(`/dashboard/challenge/${c.id}`)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 4px", cursor: "pointer" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#14132B", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</span>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: d <= 1 ? "#B91C1C" : "#6D4AFF", background: d <= 1 ? "rgba(220,38,38,0.08)" : "rgba(109,74,255,0.08)", padding: "3px 9px", borderRadius: 20 }}>
                        {d === 0 ? "Today" : `${d}d left`}
                      </span>
                    </div>
                  );
                })}
              </TiltCard>
            </div>
          )}

          <div className="side-card" style={{ animationDelay: "0.35s" }}>
            <TiltCard intensity={4} glow="rgba(212,160,23,0.15)" style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.07)", padding: 20 }}>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "#14132B", marginBottom: 14 }}>Leaderboard</h2>
              {leaderboard.slice(0, 3).map((entry, i) => (
                <div key={i} className="lb-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 4px", borderRadius: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: MEDALS[i], color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {i + 1}
                    </div>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "#14132B" }}>{entry.name}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#14132B" }}>{entry.points} pts</span>
                </div>
              ))}
              {leaderboard.length === 0 && <p style={{ fontSize: 13, color: "rgba(20,19,43,0.4)" }}>No scores yet.</p>}
            </TiltCard>
          </div>

          <div className="side-card" style={{ animationDelay: "0.42s" }}>
            <TiltCard intensity={4} glow="rgba(37,99,235,0.12)" style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.07)", padding: 20 }}>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "#14132B", marginBottom: 14 }}>Recent Activity</h2>
              {activity.length === 0 ? (
                <p style={{ fontSize: 13, color: "rgba(20,19,43,0.4)" }}>No recent activity.</p>
              ) : (
                activity.map((a, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, padding: "8px 0", borderTop: i > 0 ? "1px solid rgba(15,23,42,0.05)" : "none" }}>
                    <div className="activity-dot" />
                    <p style={{ fontSize: 12.5, color: "rgba(20,19,43,0.6)", lineHeight: 1.5 }}>
                      <span style={{ color: "rgba(20,19,43,0.35)" }}>{a.time} — </span>
                      {a.text}
                    </p>
                  </div>
                ))
              )}
            </TiltCard>
          </div>
        </div>
      </div>

      {/* Recommended For You */}
      {recommended.length > 0 && (
        <div className="main-card" style={{ animationDelay: "0.48s", marginTop: 18 }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15.5, fontWeight: 700, color: "#14132B", marginBottom: 14 }}>✨ Recommended For You</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 14 }}>
            {recommended.map((c: any) => (
              <div key={c.id} className="rec-card" onClick={() => router.push(`/dashboard/challenge/${c.id}`)}>
                <TiltCard intensity={3} glow="rgba(109,74,255,0.1)" style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(15,23,42,0.07)", padding: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <TypeBadge type={c.type} />
                    {c.matchCount > 0 && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#15803D", background: "rgba(22,163,74,0.1)", padding: "3px 8px", borderRadius: 20 }}>Match</span>
                    )}
                  </div>
                  <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "#14132B", marginBottom: 8, lineHeight: 1.3 }}>{c.title}</h3>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11.5, color: "rgba(20,19,43,0.45)" }}>
                    <span>{c.organizer?.orgName}</span>
                    <span>{new Date(c.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  </div>
                </TiltCard>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}