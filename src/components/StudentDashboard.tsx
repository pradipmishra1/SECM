"use client";

import { useRouter } from "next/navigation";
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
        .side-card { animation: riseIn 0.6s cubic-bezier(.22,1.12,.4,1) both; }
        .main-card { animation: riseIn 0.6s cubic-bezier(.22,1.12,.4,1) both; }

               .row-anim { transition: background 0.2s ease, transform 0.22s cubic-bezier(.34,1.56,.64,1); position: relative; }
        .row-anim:hover { transform: translateX(6px); background: #F9F8FE; }
        .row-icon { transition: transform 0.3s cubic-bezier(.34,1.56,.64,1), background 0.3s ease; }
        .row-anim:hover .row-icon { transform: rotate(-6deg) scale(1.08); background: rgba(109,74,255,0.16) !important; }

        .view-all { position: relative; transition: gap 0.2s ease, opacity 0.15s ease; display: inline-flex; align-items: center; gap: 4px; cursor: pointer; }
        .view-all:hover { gap: 8px; opacity: 0.8; }

        .lb-row { transition: transform 0.2s ease, background 0.2s ease; border-radius: 10px; }
        .lb-row:hover { transform: translateX(3px); background: #F9F8FE; }

        .activity-dot { width: 7px; height: 7px; border-radius: 50%; background: #6D4AFF; flex-shrink: 0; margin-top: 5px; box-shadow: 0 0 0 3px rgba(109,74,255,0.12); }

                .quick-action { transition: transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease, border-color 0.2s ease; cursor: pointer; }
        .quick-action:hover { transform: translateY(-4px) scale(1.015); box-shadow: 0 14px 30px rgba(109,74,255,0.14); border-color: rgba(109,74,255,0.2) !important; }
        .quick-action:active { transform: translateY(-1px) scale(0.98); transition-duration: 0.08s; }
        .quick-action:hover .quick-action-icon { transform: scale(1.12) rotate(-4deg); background: rgba(109,74,255,0.14) !important; }
        .quick-action-icon { transition: transform 0.3s cubic-bezier(.34,1.56,.64,1), background 0.2s ease; }

        .flame-icon { animation: flameFlicker 1.4s ease-in-out infinite; display: inline-block; }
        .streak-badge { animation: streakGlow 2.4s ease-in-out infinite; }

        .deadline-row { transition: transform 0.2s ease, background 0.2s ease; border-radius: 10px; }
        .deadline-row:hover { transform: translateX(3px); background: #FBFAFF; }

        .rec-card { transition: transform 0.22s cubic-bezier(.2,.8,.2,1), box-shadow 0.2s ease; cursor: pointer; }
        .rec-card:hover { transform: translateY(-4px); }

        .section-icon-badge { display: flex; align-items: center; justify-content: center; border-radius: 11px; flex-shrink: 0; }

        .skeleton-pulse { animation: softPulse 1.5s ease-in-out infinite; background: rgba(20,19,43,0.06); border-radius: 8px; }
      `}</style>

      {/* Header */}
      <div className="head-anim" style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14 }}>
        <div>
                    <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 38, fontWeight: 800, color: "#14132B", marginBottom: 8, letterSpacing: -1.1, lineHeight: 1.1 }}>
            Welcome back, {userName}
          </h1>
          <p style={{ color: "rgba(20,19,43,0.48)", fontSize: 13.5, fontWeight: 500 }}>
            Here's a quick overview of your latest challenges and progress.
          </p>
        </div>
        {streak > 0 && (
          <div className="streak-badge" style={{ display: "flex", alignItems: "center", gap: 9, background: "linear-gradient(135deg,#FFF7E8,#FFEFD1)", border: "1px solid rgba(217,119,6,0.22)", borderRadius: 12, padding: "10px 16px" }}>
            <span className="flame-icon" style={{ fontSize: 16 }}>🔥</span>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: "#92400E" }}>{streak}-day streak</span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="head-anim" style={{ display: "flex", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Browse Challenges", sub: "Find something new", icon: <Icon.clipboard width={19} height={19} />, path: "/dashboard/my-challenges" },
          { label: "My Teams", sub: "Manage your squads", icon: <Icon.users width={19} height={19} />, path: "/dashboard/teams" },
          { label: "My Submissions", sub: "Track your entries", icon: <Icon.upload width={19} height={19} />, path: "/dashboard/submissions" },
        ].map((a) => (
          <div
            key={a.label}
            className="quick-action"
            onClick={() => router.push(a.path)}
            style={{ flex: 1, display: "flex", alignItems: "center", gap: 14, background: "#fff", border: "1px solid rgba(15,23,42,0.07)", borderRadius: 16, padding: "18px 20px" }}
          >
            <div className="quick-action-icon" style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(109,74,255,0.09)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6D4AFF", flexShrink: 0 }}>
              {a.icon}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#14132B", marginBottom: 2 }}>{a.label}</div>
              <div style={{ fontSize: 12, color: "rgba(20,19,43,0.45)" }}>{a.sub}</div>
            </div>
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
            borderRadius: 16, padding: "16px 20px", marginBottom: 28,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(109,74,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6D4AFF", flexShrink: 0 }}>
              <Icon.upload width={18} height={18} />
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#14132B" }}>Continue where you left off</div>
              <div style={{ fontSize: 12.5, color: "rgba(20,19,43,0.5)" }}>{draftSubmission.challengeTitle}</div>
            </div>
          </div>
          <span className="view-all" style={{ fontSize: 13, color: "#6D4AFF", fontWeight: 700 }}>
            Finish <Icon.arrow width={13} height={13} />
          </span>
        </div>
      )}

      {/* Stat row */}
      <div style={{ display: "flex", gap: 16, marginBottom: 26 }}>


        <div className="stat-anim" style={{ flex: 1, animationDelay: "0.04s" }}>
          <StatCard label="Active Challenges" value={stats.activeChallenges} icon={<Icon.flag width={18} height={18} />} tone="violet" />
        </div>
        <div className="stat-anim" style={{ flex: 1, animationDelay: "0.09s" }}>
          <StatCard label="Teams" value={stats.teams} icon={<Icon.users width={18} height={18} />} tone="blue" />
        </div>
        <div className="stat-anim" style={{ flex: 1, animationDelay: "0.14s" }}>
          <StatCard label="Submissions" value={stats.submissions} icon={<Icon.upload width={18} height={18} />} tone="amber" />
        </div>
        <div className="stat-anim" style={{ flex: 1, animationDelay: "0.19s" }}>
          <StatCard label="Wins" value={stats.wins} icon={<Icon.trophy width={18} height={18} />} tone="green" />
        </div>
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        <div className="main-card" style={{ flex: 2, animationDelay: "0.3s" }}>
          <TiltCard intensity={2} glow="rgba(109,74,255,0.08)" style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(15,23,42,0.07)", padding: 26 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="section-icon-badge" style={{ width: 32, height: 32, background: "rgba(109,74,255,0.1)", color: "#6D4AFF" }}>
                  <Icon.flag width={16} height={16} />
                </div>
                                <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 19, fontWeight: 800, color: "#14132B", letterSpacing: -0.3 }}>Open Challenges</h2>
              </div>
              <span className="view-all" onClick={() => router.push("/dashboard/my-challenges")} style={{ fontSize: 13, color: "#6D4AFF", fontWeight: 700 }}>
                View all <Icon.arrow width={13} height={13} />
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
                    boxShadow: "0 8px 20px rgba(109,74,255,0.25)",
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

          {weeklyActivity.length > 0 && (
            <div className="main-card" style={{ animationDelay: "0.34s", marginTop: 18 }}>
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
          )}
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
          {upcomingDeadlines.length > 0 && (
            <div className="side-card" style={{ animationDelay: "0.3s" }}>
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
                    <div key={c.id} className="deadline-row" onClick={() => router.push(`/dashboard/challenge/${c.id}`)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 8px", cursor: "pointer" }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: "#14132B", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: d <= 1 ? "#B91C1C" : "#6D4AFF", background: d <= 1 ? "rgba(220,38,38,0.08)" : "rgba(109,74,255,0.08)", padding: "4px 10px", borderRadius: 20 }}>
                        {d === 0 ? "Today" : `${d}d left`}
                      </span>
                    </div>
                  );
                })}
              </TiltCard>
            </div>
          )}

          <div className="side-card" style={{ animationDelay: "0.35s" }}>
            <TiltCard intensity={4} glow="rgba(212,160,23,0.15)" style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(15,23,42,0.07)", padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div className="section-icon-badge" style={{ width: 30, height: 30, background: "rgba(212,160,23,0.12)", color: "#B45309" }}>
                  <Icon.trophy width={15} height={15} />
                </div>
                               <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16.5, fontWeight: 800, color: "#14132B", letterSpacing: -0.2 }}>Leaderboard</h2>
              </div>
              {leaderboard.slice(0, 3).map((entry, i) => (
                <div key={i} className="lb-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: MEDALS[i], color: "#fff", fontSize: 11.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 3px 8px ${MEDALS[i]}55` }}>
                      {i + 1}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#14132B" }}>{entry.name}</span>
                  </div>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "#14132B" }}>{entry.points} pts</span>
                </div>
              ))}
              {leaderboard.length === 0 && <p style={{ fontSize: 13.5, color: "rgba(20,19,43,0.4)" }}>No scores yet.</p>}
            </TiltCard>
          </div>

          <div className="side-card" style={{ animationDelay: "0.42s" }}>
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
          </div>
        </div>
      </div>

      {/* Recommended For You */}
      {recommended.length > 0 && (
        <div className="main-card" style={{ animationDelay: "0.48s", marginTop: 22 }}>
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
      )}
    </div>
  );
}