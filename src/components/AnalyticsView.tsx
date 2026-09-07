"use client";

import { useMemo } from "react";
import TiltCard from "./TiltCard";
import { Icon } from "./icons";

const TYPE_COLORS: Record<string, string> = {
  HACKATHON: "#6D4AFF",
  CODING_CONTEST: "#2563EB",
  DESIGN_CHALLENGE: "#D97706",
  IDEA_PITCHING: "#15803D",
};

function monthLabel(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short" });
}

export default function AnalyticsView({
  challenges,
  submissions,
  totalWinners,
}: {
  challenges: any[];
  submissions: any[];
  totalWinners: number;
}) {
  const totalChallenges = challenges.length;
  const totalSubmissions = submissions.length;
  const totalParticipants = challenges.reduce((sum, c) => sum + c._count.participations, 0);
  const avgScore = useMemo(() => {
    const scored = submissions.filter((s) => s.review?.score != null);
    if (scored.length === 0) return null;
    return (scored.reduce((sum, s) => sum + s.review.score, 0) / scored.length).toFixed(1);
  }, [submissions]);

  const reviewRate = totalSubmissions > 0
    ? Math.round((submissions.filter((s) => s.review?.score != null).length / totalSubmissions) * 100)
    : 0;

  // Submissions per month (last 6 months)
  const monthlyData = useMemo(() => {
    const now = new Date();
    const months: { label: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const count = submissions.filter((s) => {
        const sd = new Date(s.submittedAt);
        return sd.getFullYear() === d.getFullYear() && sd.getMonth() === d.getMonth();
      }).length;
      months.push({ label: monthLabel(d), count });
    }
    return months;
  }, [submissions]);
  const maxMonthly = Math.max(1, ...monthlyData.map((m) => m.count));

  // Challenge type breakdown
  const typeBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    challenges.forEach((c) => { map[c.type] = (map[c.type] || 0) + 1; });
    return Object.entries(map).map(([type, count]) => ({ type, count }));
  }, [challenges]);

  // Top challenges by submissions
  const topChallenges = [...challenges].sort((a, b) => b._count.submissions - a._count.submissions).slice(0, 5);

  // Score distribution
  const scoreDistribution = useMemo(() => {
    const buckets = [0, 0, 0, 0, 0]; // 0-2, 2-4, 4-6, 6-8, 8-10
    submissions.forEach((s) => {
      if (s.review?.score == null) return;
      const idx = Math.min(4, Math.floor(s.review.score / 2));
      buckets[idx]++;
    });
    return buckets;
  }, [submissions]);
  const maxBucket = Math.max(1, ...scoreDistribution);

  return (
    <div>
      <style>{`
        @keyframes riseIn { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform: translateY(0); } }
        @keyframes headIn { from { opacity:0; transform: translateX(-8px); } to { opacity:1; transform: translateX(0); } }
        @keyframes barGrow { from { height: 0%; } }
        @keyframes barGrowH { from { width: 0%; } }
        .head-anim { animation: headIn 0.5s cubic-bezier(.2,.8,.2,1) both; }
        .stat-anim { animation: riseIn 0.55s cubic-bezier(.2,.8,.2,1) both; transition: transform 0.2s ease; }
        .stat-anim:hover { transform: translateY(-3px); }
        .chart-card { animation: riseIn 0.55s cubic-bezier(.2,.8,.2,1) both; }
        .bar-v { animation: barGrow 0.8s cubic-bezier(.2,.8,.2,1) both; transition: opacity 0.15s ease; }
        .bar-v:hover { opacity: 0.8; }
        .bar-h { animation: barGrowH 0.8s cubic-bezier(.2,.8,.2,1) both; }
        .top-row { transition: background 0.15s ease, transform 0.15s ease; }
        .top-row:hover { background: #F9F8FE; transform: translateX(3px); }
      `}</style>

      <div className="head-anim" style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 27, fontWeight: 700, color: "#14132B", letterSpacing: -0.5, marginBottom: 6 }}>
          Analytics
        </h1>
        <p style={{ color: "rgba(20,19,43,0.5)", fontSize: 14 }}>Performance across all your challenges.</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total Challenges", value: totalChallenges, tone: "#6D4AFF", bg: "linear-gradient(135deg, #F0EDFF, #E6E0FF)", icon: <Icon.flag width={16} height={16} /> },
          { label: "Total Submissions", value: totalSubmissions, tone: "#2563EB", bg: "linear-gradient(135deg, #E9F3FF, #D6E9FF)", icon: <Icon.upload width={16} height={16} /> },
          { label: "Total Participants", value: totalParticipants, tone: "#D97706", bg: "linear-gradient(135deg, #FFF7E8, #FFEFD1)", icon: <Icon.users width={16} height={16} /> },
          { label: "Avg. Score", value: avgScore ?? "—", tone: "#15803D", bg: "linear-gradient(135deg, #E8F9F1, #D3F3E3)", icon: <Icon.trophy width={16} height={16} /> },
          { label: "Review Rate", value: `${reviewRate}%`, tone: "#A21CAF", bg: "linear-gradient(135deg, #FDF0FF, #F7DFFF)", icon: <Icon.inbox width={16} height={16} /> },
        ].map((s, i) => (
          <div key={s.label} className="stat-anim" style={{ animationDelay: `${i * 0.05}s` }}>
            <TiltCard intensity={4} glow={`${s.tone}33`} style={{ background: s.bg, borderRadius: 16, padding: "16px 14px", border: "1px solid rgba(255,255,255,0.5)" }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: s.tone, marginBottom: 10, boxShadow: "0 3px 8px rgba(20,19,43,0.08)" }}>
                {s.icon}
              </div>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: s.tone }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "rgba(20,19,43,0.5)", fontWeight: 600, marginTop: 2 }}>{s.label}</div>
            </TiltCard>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18, marginBottom: 18 }}>
        {/* Submissions over time - bar chart */}
        <div className="chart-card">
          <TiltCard intensity={2} glow="rgba(109,74,255,0.08)" style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.07)", padding: 22 }}>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "#14132B", marginBottom: 20 }}>Submissions (Last 6 Months)</h2>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 140 }}>
              {monthlyData.map((m, i) => (
                <div key={m.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#14132B", marginBottom: 4 }}>{m.count}</span>
                  <div
                    className="bar-v"
                    style={{
                      width: "100%",
                      height: `${(m.count / maxMonthly) * 100}%`,
                      minHeight: m.count > 0 ? 4 : 2,
                      borderRadius: "8px 8px 3px 3px",
                      background: "linear-gradient(180deg,#8B5CF6,#6D4AFF)",
                      animationDelay: `${i * 0.08}s`,
                    }}
                  />
                  <span style={{ fontSize: 10.5, color: "rgba(20,19,43,0.45)", fontWeight: 600, marginTop: 8 }}>{m.label}</span>
                </div>
              ))}
            </div>
          </TiltCard>
        </div>

        {/* Challenge type breakdown */}
        <div className="chart-card">
          <TiltCard intensity={2} glow="rgba(37,99,235,0.08)" style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.07)", padding: 22 }}>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "#14132B", marginBottom: 18 }}>Challenge Types</h2>
            {typeBreakdown.length === 0 ? (
              <p style={{ fontSize: 13, color: "rgba(20,19,43,0.4)" }}>No challenges yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {typeBreakdown.map((t) => (
                  <div key={t.type}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: "#14132B" }}>{t.type.replace(/_/g, " ")}</span>
                      <span style={{ fontSize: 12, color: "rgba(20,19,43,0.5)" }}>{t.count}</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 20, background: "rgba(15,23,42,0.05)", overflow: "hidden" }}>
                      <div className="bar-h" style={{ height: "100%", width: `${(t.count / totalChallenges) * 100}%`, borderRadius: 20, background: TYPE_COLORS[t.type] || "#6D4AFF" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TiltCard>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {/* Top challenges by submissions */}
        <div className="chart-card">
          <TiltCard intensity={2} glow="rgba(217,119,6,0.08)" style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.07)", padding: 22 }}>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "#14132B", marginBottom: 16 }}>Top Challenges by Submissions</h2>
            {topChallenges.length === 0 ? (
              <p style={{ fontSize: 13, color: "rgba(20,19,43,0.4)" }}>No challenges yet.</p>
            ) : (
              topChallenges.map((c, i) => (
                <div key={c.id} className="top-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 8px", borderRadius: 10, borderTop: i > 0 ? "1px solid rgba(15,23,42,0.05)" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <span style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(109,74,255,0.08)", color: "#6D4AFF", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {i + 1}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#14132B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</span>
                  </div>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "#6D4AFF", flexShrink: 0 }}>{c._count.submissions}</span>
                </div>
              ))
            )}
          </TiltCard>
        </div>

        {/* Score distribution */}
        <div className="chart-card">
          <TiltCard intensity={2} glow="rgba(22,163,74,0.08)" style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.07)", padding: 22 }}>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "#14132B", marginBottom: 20 }}>Score Distribution</h2>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 120 }}>
              {["0-2", "2-4", "4-6", "6-8", "8-10"].map((label, i) => (
                <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#14132B", marginBottom: 4 }}>{scoreDistribution[i]}</span>
                  <div
                    className="bar-v"
                    style={{
                      width: "100%",
                      height: `${(scoreDistribution[i] / maxBucket) * 100}%`,
                      minHeight: scoreDistribution[i] > 0 ? 4 : 2,
                      borderRadius: "6px 6px 2px 2px",
                      background: "linear-gradient(180deg,#4ADE80,#15803D)",
                      animationDelay: `${i * 0.08}s`,
                    }}
                  />
                  <span style={{ fontSize: 10.5, color: "rgba(20,19,43,0.45)", fontWeight: 600, marginTop: 8 }}>{label}</span>
                </div>
              ))}
            </div>
          </TiltCard>
        </div>
      </div>
    </div>
  );
}