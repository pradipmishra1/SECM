"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./icons";

export default function AdminDashboard({ userName }: { userName: string }) {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  const cards = [
    { label: "Total Users", value: stats?.totalUsers, tone: "#6D4AFF", bg: "linear-gradient(155deg,#EDE9FE,#F5F3FF)", icon: <Icon.users width={17} height={17} /> },
    { label: "Students", value: stats?.totalStudents, tone: "#2563EB", bg: "linear-gradient(155deg,#DBEAFE,#EFF6FF)", icon: <Icon.user width={17} height={17} /> },
    { label: "Organizers", value: stats?.totalOrganizers, tone: "#D97706", bg: "linear-gradient(155deg,#FEF3C7,#FFFBEB)", icon: <Icon.flag width={17} height={17} /> },
    { label: "Pending Verification", value: stats?.pendingVerifications, tone: "#B91C1C", bg: "linear-gradient(155deg,#FEE2E2,#FEF2F2)", icon: <Icon.bell width={17} height={17} /> },
    { label: "Challenges", value: stats?.totalChallenges, tone: "#059669", bg: "linear-gradient(155deg,#D1FAE5,#F0FDF4)", icon: <Icon.clipboard width={17} height={17} /> },
    { label: "Submissions", value: stats?.totalSubmissions, tone: "#7C3AED", bg: "linear-gradient(155deg,#EDE9FE,#F5F3FF)", icon: <Icon.upload width={17} height={17} /> },
    { label: "Winners Announced", value: stats?.totalWinners, tone: "#DB2777", bg: "linear-gradient(155deg,#FCE7F3,#FDF2F8)", icon: <Icon.trophy width={17} height={17} /> },
  ];

  return (
    <div>
      <style>{`
        @keyframes adRise { from { opacity:0; transform: translateY(14px); } to { opacity:1; transform: translateY(0); } }
        @keyframes adHead { from { opacity:0; transform: translateX(-8px); } to { opacity:1; transform: translateX(0); } }
        .ad-anim { animation: adRise 0.5s cubic-bezier(.2,.8,.2,1) both; }
        .ad-head { animation: adHead 0.5s cubic-bezier(.2,.8,.2,1) both; }
        .ad-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .ad-card:hover { transform: translateY(-3px); box-shadow: 0 12px 26px rgba(15,23,42,0.08); }
        .ad-action { transition: transform 0.15s ease, box-shadow 0.2s ease; cursor: pointer; }
        .ad-action:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(15,23,42,0.1); }
      `}</style>

      <div className="ad-head" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase", background: "#14132B", color: "#fff", padding: "4px 10px", borderRadius: 20 }}>
            Admin
          </span>
        </div>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 27, fontWeight: 700, color: "#14132B", letterSpacing: -0.5 }}>
          Platform Overview, <span style={{ background: "linear-gradient(135deg,#14132B,#4C2FCC)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{userName}</span>
        </h1>
        <p style={{ color: "rgba(20,19,43,0.5)", fontSize: 14, marginTop: 6 }}>
          {stats?.pendingVerifications > 0
            ? `${stats.pendingVerifications} organizer${stats.pendingVerifications !== 1 ? "s" : ""} waiting for verification`
            : "All organizers verified"}
        </p>
      </div>

      <div className="ad-head" style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Verify Organizers", icon: <Icon.users width={15} height={15} />, path: "/dashboard/verify" },
          { label: "Manage Users", icon: <Icon.user width={15} height={15} />, path: "/dashboard/users" },
          { label: "All Challenges", icon: <Icon.clipboard width={15} height={15} />, path: "/dashboard/all-challenges" },
          { label: "All Winners", icon: <Icon.trophy width={15} height={15} />, path: "/dashboard/all-winners" },
        ].map((a) => (
          <div key={a.label} className="ad-action" onClick={() => router.push(a.path)} style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "1px solid rgba(15,23,42,0.07)", borderRadius: 14, padding: "14px 16px" }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(20,19,43,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "#14132B" }}>
              {a.icon}
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "#14132B" }}>{a.label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {cards.map((c, i) => (
          <div key={c.label} className="ad-anim ad-card" style={{ animationDelay: `${i * 0.05}s`, background: c.bg, borderRadius: 18, padding: "18px 16px", border: "1px solid rgba(255,255,255,0.4)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: c.tone, opacity: 0.8 }}>{c.label}</span>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", color: c.tone }}>
                {c.icon}
              </div>
            </div>
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 800, color: c.tone }}>
              {stats ? c.value ?? 0 : "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}