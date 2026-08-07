"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import StatCard from "./StatCard";
import AvatarStack from "./AvatarStack";
import TiltCard from "./TiltCard";
import { Icon } from "./icons";
import AllChallengesModal from "./AllChallengesModal"; // ✅ imported

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: "Draft", color: "#6B7280", bg: "rgba(107,114,128,0.1)" },
  PUBLISHED: { label: "Live", color: "#15803D", bg: "rgba(22,163,74,0.1)" },
  CLOSED: { label: "Closed", color: "#B91C1C", bg: "rgba(220,38,38,0.1)" },
  COMPLETED: { label: "Ended", color: "#6B7280", bg: "rgba(107,114,128,0.1)" },
};

function daysLeft(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

function getEffectiveStatus(c: any): string {
  const isPastDeadline = new Date(c.deadline).getTime() < Date.now();
  if (isPastDeadline && (c.status === "PUBLISHED" || c.status === "CLOSED")) return "CLOSED";
  return c.status;
}

export default function OrganizerDashboard({
  userName,
  stats,
  challenges,
  activity,
  isVerified,
  orgName,
  pendingChallengeIds = [],
}: {
  userName: string;
  stats: { totalChallenges: number; activeEvents: number; totalSubmissions: number; pendingReviews: number };
  challenges: any[];
  activity: { text: string; time: string }[];
  isVerified?: boolean;
  orgName?: string;
  pendingChallengeIds?: string[];
}) {
  const router = useRouter();
  const [showAllChallenges, setShowAllChallenges] = useState(false);

  const needsAttention = challenges.filter((c) => pendingChallengeIds.includes(c.id));
  const firstPendingId = needsAttention.length > 0 ? needsAttention[0].id : null; // ✅ defined

  const upcomingDeadlines = challenges
    .filter((c) => c.status === "PUBLISHED" && daysLeft(c.deadline) >= 0)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 4);

  return (
    <div>
      <style>{`
        @keyframes riseIn { from { opacity:0; transform: translateY(16px) scale(0.98); } to { opacity:1; transform: translateY(0) scale(1); } }
        @keyframes headIn { from { opacity:0; transform: translateX(-8px); } to { opacity:1; transform: translateX(0); } }
        @keyframes pulseDot { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        .head-anim { animation: headIn 0.5s cubic-bezier(.2,.8,.2,1) both; }
        .stat-anim { animation: riseIn 0.55s cubic-bezier(.2,.8,.2,1) both; }
        .main-card { animation: riseIn 0.55s cubic-bezier(.2,.8,.2,1) both; }
        .side-card { animation: riseIn 0.55s cubic-bezier(.2,.8,.2,1) both; }
        .attn-banner { animation: riseIn 0.5s cubic-bezier(.2,.8,.2,1) both; }
        .row-anim { transition: background 0.2s ease, transform 0.2s cubic-bezier(.2,.8,.2,1); position: relative; }
        .row-anim:hover { transform: translateX(4px); background: #F9F8FE; }
        .row-icon { transition: transform 0.3s cubic-bezier(.34,1.56,.64,1), background 0.3s ease; }
        .row-anim:hover .row-icon { transform: rotate(-6deg) scale(1.08); background: rgba(109,74,255,0.16) !important; }
        .view-all { position: relative; transition: gap 0.2s ease; display: inline-flex; align-items: center; gap: 4px; }
        .view-all:hover { gap: 8px; }
        .review-btn { transition: transform 0.15s ease, background 0.15s ease; }
        .review-btn:hover { transform: translateY(-1px); background: #2A2850 !important; }
        .attn-pulse { animation: pulseDot 1.4s ease infinite; }
        .deadline-row { transition: transform 0.2s ease; }
        .deadline-row:hover { transform: translateX(3px); }
        .activity-dot { width: 6px; height: 6px; border-radius: 50%; background: #6D4AFF; flex-shrink: 0; margin-top: 5px; }
        .quick-action { transition: transform 0.15s ease, box-shadow 0.2s ease; cursor: pointer; }
        .quick-action:hover { transform: translateY(-2px); box-shadow: 0 8px 18px rgba(15,23,42,0.08); }
      `}</style>

      <div className="head-anim" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 27, fontWeight: 700, color: "#14132B", letterSpacing: -0.5 }}>
            Organizer Hub, <span style={{ background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{userName}</span>
          </h1>
          {isVerified ? (
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 700, color: "#15803D", background: "rgba(22,163,74,0.1)", padding: "4px 10px", borderRadius: 20 }}>
              <Icon.check width={12} height={12} /> Verified
            </span>
          ) : (
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 700, color: "#B45309", background: "rgba(217,119,6,0.1)", padding: "4px 10px", borderRadius: 20 }}>
              Pending Verification
            </span>
          )}
        </div>
        {orgName && (
          <p style={{ color: "rgba(20,19,43,0.4)", fontSize: 12.5, marginBottom: 4, fontWeight: 600 }}>{orgName}</p>
        )}
        <p style={{ color: "rgba(20,19,43,0.5)", fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
          {stats.pendingReviews > 0 && (
            <span className="attn-pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "#F59E0B", display: "inline-block" }} />
          )}
          {stats.pendingReviews} submission{stats.pendingReviews !== 1 ? "s" : ""} pending review · {stats.activeEvents} event{stats.activeEvents !== 1 ? "s" : ""} live
        </p>
      </div>

      {/* Quick Actions */}
      <div className="head-anim" style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Create Challenge", icon: <Icon.rocket width={15} height={15} />, path: "/dashboard/create" },
          { label: "Review Submissions", icon: <Icon.inbox width={15} height={15} />, path: "/dashboard/review" },
          { label: "Post Announcement", icon: <Icon.flag width={15} height={15} />, path: "/dashboard/announcements" },
        ].map((a) => (
          <div
            key={a.label}
            className="quick-action"
            onClick={() => router.push(a.path)}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#fff",
              border: "1px solid rgba(15,23,42,0.07)",
              borderRadius: 14,
              padding: "14px 16px",
            }}
          >
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(109,74,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6D4AFF" }}>
              {a.icon}
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#14132B" }}>{a.label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <div
          className="stat-anim"
          style={{ flex: 1, animationDelay: "0.05s", cursor: "pointer" }}
          onClick={() => setShowAllChallenges(true)}
        >
          <StatCard label="Total Challenges" value={stats.totalChallenges} icon={<Icon.flag width={17} height={17} />} tone="violet" />
        </div>
        <div className="stat-anim" style={{ flex: 1, animationDelay: "0.12s" }}>
          <StatCard label="Active Events" value={stats.activeEvents} icon={<Icon.clock width={17} height={17} />} tone="blue" />
        </div>
        <div className="stat-anim" style={{ flex: 1, animationDelay: "0.19s" }}>
          <StatCard label="Submissions" value={stats.totalSubmissions} icon={<Icon.upload width={17} height={17} />} tone="amber" />
        </div>
        <div className="stat-anim" style={{ flex: 1, animationDelay: "0.26s" }}>
          <StatCard
            label="Pending Reviews"
            value={stats.pendingReviews}
            icon={<Icon.inbox width={17} height={17} />}
            tone={stats.pendingReviews > 0 ? "amber" : "green"}
          />
        </div>
      </div>

      {needsAttention.length > 0 && (
        <div
          className="attn-banner"
          style={{
            marginBottom: 20,
            background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.02))",
            border: "1px solid rgba(245,158,11,0.2)",
            borderRadius: 16,
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B45309" }}>
              <Icon.inbox width={16} height={16} />
            </div>
            <div>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: "#14132B" }}>
                {needsAttention.length} challenge{needsAttention.length !== 1 ? "s" : ""} may need your attention
              </p>
              <p style={{ fontSize: 12, color: "rgba(20,19,43,0.5)" }}>Live or closed events with activity to review</p>
            </div>
          </div>
          <button
            onClick={() => router.push(firstPendingId ? `/dashboard/review?challenge=${firstPendingId}` : "/dashboard/review")}
            className="review-btn"
            style={{ background: "#14132B", color: "#fff", border: "none", borderRadius: 9, padding: "9px 16px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}
          >
            Review now
          </button>
        </div>
      )}

      <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
        <div className="main-card" style={{ flex: 2, animationDelay: "0.3s" }}>
          <TiltCard intensity={2} glow="rgba(109,74,255,0.08)" style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.07)", padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15.5, fontWeight: 700, color: "#14132B" }}>Your Challenges</h2>
              <span className="view-all" onClick={() => router.push("/dashboard/my-challenges")} style={{ fontSize: 12.5, color: "#6D4AFF", fontWeight: 600, cursor: "pointer" }}>
                View all <Icon.arrow width={13} height={13} />
              </span>
            </div>

            {challenges.length === 0 ? (
              <div style={{ textAlign: "center", padding: "36px 0" }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(109,74,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: "#6D4AFF" }}>
                  <Icon.flag width={20} height={20} />
                </div>
                <p style={{ color: "rgba(20,19,43,0.5)", fontSize: 14, marginBottom: 14 }}>You haven't created any challenges yet.</p>
                <button
                  onClick={() => router.push("/dashboard/create")}
                  style={{ background: "#6D4AFF", color: "#fff", border: "none", borderRadius: 9, padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                >
                  Create your first challenge
                </button>
              </div>
            ) : (
              challenges.slice(0, 5).map((c, i) => {
                const s = STATUS_STYLES[getEffectiveStatus(c)] || STATUS_STYLES.DRAFT;
                return (
                  <div
                    key={c.id}
                    className="row-anim"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "14px 10px", borderTop: i > 0 ? "1px solid rgba(15,23,42,0.05)" : "none", borderRadius: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div className="row-icon" style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(109,74,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6D4AFF" }}>
                        <Icon.flag width={16} height={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#14132B" }}>{c.title}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                          <span style={{ fontSize: 12, color: "rgba(20,19,43,0.4)" }}>{new Date(c.deadline).toLocaleDateString()}</span>
                          <AvatarStack count={c.participations?.length || 0} />
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 20, color: s.color, background: s.bg }}>
                        {s.label}
                      </span>
                      <button
                        onClick={() => router.push(`/dashboard/review?challenge=${c.id}`)}
                        className="review-btn"
                        style={{ background: "#14132B", color: "#fff", border: "none", borderRadius: 8, padding: "7px 13px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                      >
                        Reviews
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </TiltCard>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="side-card" style={{ animationDelay: "0.35s" }}>
            <TiltCard intensity={4} glow="rgba(109,74,255,0.12)" style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.07)", padding: 20 }}>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "#14132B", marginBottom: 14 }}>Upcoming Deadlines</h2>
              {upcomingDeadlines.length === 0 ? (
                <p style={{ fontSize: 13, color: "rgba(20,19,43,0.4)" }}>No upcoming deadlines.</p>
              ) : (
                upcomingDeadlines.map((c) => {
                  const d = daysLeft(c.deadline);
                  return (
                    <div key={c.id} className="deadline-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 4px" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#14132B", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.title}
                      </span>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: d <= 1 ? "#B91C1C" : "#6D4AFF", background: d <= 1 ? "rgba(220,38,38,0.08)" : "rgba(109,74,255,0.08)", padding: "3px 9px", borderRadius: 20 }}>
                        {d === 0 ? "Today" : `${d}d left`}
                      </span>
                    </div>
                  );
                })
              )}
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

      {showAllChallenges && (
        <AllChallengesModal challenges={challenges} onClose={() => setShowAllChallenges(false)} />
      )}
    </div>
  );
}