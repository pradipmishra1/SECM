"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import TiltCard from "./TiltCard";
import AvatarStack from "./AvatarStack";

const ACHIEVEMENTS = [
  { icon: "/badges/first-submission.png", title: "First Submission", color: "#6D4AFF", type: "submission", threshold: 1 },
  { icon: "/badges/winner.png", title: "1st Place Wins", color: "#D4A017", type: "position", position: 1, threshold: 1 },
  { icon: "/badges/second.png", title: "2nd Place Wins", color: "#9CA3AF", type: "position", position: 2, threshold: 1 },
  { icon: "/badges/third.png", title: "3rd Place Wins", color: "#B45309", type: "position", position: 3, threshold: 1 },
  { icon: "/badges/5complete.png", title: "5 Completed", color: "#DC6803", type: "submission", threshold: 5 },
  { icon: "/badges/10complete.png", title: "10 Completed", color: "#9333EA", type: "submission", threshold: 10 },
  { icon: "/badges/50complete.png", title: "50 Completed", color: "#2563EB", type: "submission", threshold: 50 },
  { icon: "/badges/100complete.png", title: "100 Completed", color: "#059669", type: "submission", threshold: 100 },
  { icon: "/badges/500complete.png", title: "500 Completed", color: "#DB2777", type: "submission", threshold: 500 },
];

const ORG_MILESTONES = [
  { title: "First Challenge", type: "count", threshold: 1, grad: ["#6D4AFF", "#8B5CF6"], svg: "rocket" },
  { title: "5 Challenges Hosted", type: "count", threshold: 5, grad: ["#F59E0B", "#EA580C"], svg: "flame" },
  { title: "10 Challenges Hosted", type: "count", threshold: 10, grad: ["#2563EB", "#0EA5E9"], svg: "gem" },
  { title: "First Submission Received", type: "submissions", threshold: 1, grad: ["#059669", "#10B981"], svg: "inbox" },
  { title: "50 Submissions Received", type: "submissions", threshold: 50, grad: ["#DB2777", "#EC4899"], svg: "wave" },
  { title: "100 Participants Reached", type: "participants", threshold: 100, grad: ["#7C3AED", "#A855F7"], svg: "crowd" },
];

function MilestoneBadgeIcon({ type }: { type: string }) {
  const common = { width: 26, height: 26, viewBox: "0 0 24 24", fill: "none", stroke: "#fff", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (type === "rocket") return <svg {...common}><path d="M12 2c3 1.5 5 5 5 9 0 2-1 4-2 5l-3 3-3-3c-1-1-2-3-2-5 0-4 2-7.5 5-9Z" /><circle cx="12" cy="10" r="1.6" fill="#fff" stroke="none" /><path d="M8.5 16 6 21l3-1.5M15.5 16 18 21l-3-1.5" /></svg>;
  if (type === "flame") return <svg {...common}><path d="M12 2c1 3-2 4-2 7a4 4 0 0 0 8 0c0-1-.5-2-1-3 1 0 3 2 3 6a6 6 0 0 1-12 0c0-4 2-6 4-10Z" /></svg>;
  if (type === "gem") return <svg {...common}><path d="M6 3h12l3 5-9 13L3 8Z" /><path d="M3 8h18M9 3l-2 5 5 13 5-13-2-5" /></svg>;
  if (type === "inbox") return <svg {...common}><path d="M3 12h4.5l1.5 3h6l1.5-3H21" /><path d="M5 5h14l2 7v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-7l2-7Z" /></svg>;
  if (type === "wave") return <svg {...common}><path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" /><path d="M2 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0" /></svg>;
  return <svg {...common}><circle cx="8" cy="9" r="2.5" /><circle cx="16" cy="9" r="2.5" /><path d="M2.5 19c.6-3 2.5-5 5.5-5s4.9 2 5.5 5M12.5 19c.6-3 2.5-5 5.5-5s4.9 2 5.5 5" /></svg>;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const size = 96;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d")!;
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.5));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ProfileEditor({
  user,
  role,
  studentProfile,
  organizerProfile,
  stats,
  teams = [],
  recentActivity = [],
  recentChallenges = [],
  currentUserId,
}: {
  user: { name: string; email: string; username?: string; image?: string | null };
  role: string;
  studentProfile: any;
  organizerProfile: any;
  stats?: any;
  teams?: any[];
  recentActivity?: { type: string; text: string; time: string }[];
  recentChallenges?: any[];
  currentUserId?: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [education, setEducation] = useState(studentProfile?.education || "");
  const [bio, setBio] = useState(studentProfile?.bio || organizerProfile?.description || "");
  const [skills, setSkills] = useState<string[]>(studentProfile?.skills || []);
  const [skillInput, setSkillInput] = useState("");
  const [orgName, setOrgName] = useState(organizerProfile?.orgName || "");
  const [portfolioUrl, setPortfolioUrl] = useState(studentProfile?.portfolioUrl || "");
  const [bannerText, setBannerText] = useState(studentProfile?.bannerText || "");
  const [avatar, setAvatar] = useState<string | null>(user.image || null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [showWinsModal, setShowWinsModal] = useState(false);
  const [wins, setWins] = useState<any[]>([]);
  const [winsLoading, setWinsLoading] = useState(false);

  const [showSubsModal, setShowSubsModal] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [activeAchievement, setActiveAchievement] = useState<any>(null);

  const fileRef = useRef<HTMLInputElement>(null);
 



const heroRef = useRef<HTMLDivElement>(null);

  function getPositionCount(position: number) {
  if (position === 1) return stats?.firstPlaceCount || 0;
  if (position === 2) return stats?.secondPlaceCount || 0;
  return stats?.thirdPlaceCount || 0;
}

const earnedSet = new Set(
  ACHIEVEMENTS.filter((a) => {
    if (a.type === "position") return getPositionCount(a.position!) >= a.threshold;
    return (stats?.submissions || 0) >= a.threshold;
  }).map((a) => a.title)
);

const orgEarnedSet = new Set(
  ORG_MILESTONES.filter((m) => {
    if (m.type === "count") return (stats?.totalChallenges || 0) >= m.threshold;
    if (m.type === "submissions") return (stats?.totalSubmissions || 0) >= m.threshold;
    return (stats?.totalParticipations || 0) >= m.threshold;
  }).map((m) => m.title)
);

const profileFields = [
  { label: "Organization name", done: !!orgName },
  { label: "Bio / description", done: !!bio },
  { label: "Profile photo", done: !!avatar },
  { label: "Verified status", done: !!organizerProfile?.isVerified },
  { label: "First challenge created", done: (stats?.totalChallenges || 0) > 0 },
];
const profileStrength = Math.round((profileFields.filter((f) => f.done).length / profileFields.length) * 100);

  function addSkill() {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setAvatar(compressed);
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    setError("");
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        education,
        bio,
        skills,
        interests: studentProfile?.interests || [],
        orgName,
        portfolioUrl,
        bannerText,
        avatar,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Failed to save. Please try again.");
      return;
    }
    setSaved(true);
    setEditing(false);
    router.refresh();
    setTimeout(() => setSaved(false), 2500);
  }

  async function openWins() {
    setWinsLoading(true);
    const res = await fetch(`/api/users/${user.username}/wins`);
    const data = await res.json();
    setWins(data.wins || []);
    setWinsLoading(false);
  }

  async function openSubmissions() {
    setSubsLoading(true);
    const res = await fetch(`/api/users/${user.username}/submissions`);
    const data = await res.json();
    setSubmissions(data.submissions || []);
    setSubsLoading(false);
  }

  async function handleWinsCardClick() {
  setActiveAchievement(null);
  await openWins();
  setShowWinsModal(true);
}

async function openWinsByPosition(position: number) {
  setWinsLoading(true);
  const res = await fetch(`/api/users/${user.username}/wins-by-position?position=${position}`);
  const data = await res.json();
  setWins(data.wins || []);
  setWinsLoading(false);
}

async function handleBadgeClick(a: any, earned: boolean) {
  if (!earned) return;
  setActiveAchievement(a);
  if (a.type === "position") {
    await openWinsByPosition(a.position);
    setShowWinsModal(true);
  } else {
    await openSubmissions();
    setShowSubsModal(true);
  }
}

  const SKILL_COLORS = [
    { bg: "#EDE9FE", text: "#5B21B6" },
    { bg: "#DBEAFE", text: "#1E40AF" },
    { bg: "#FCE7F3", text: "#9D174D" },
    { bg: "#D1FAE5", text: "#065F46" },
    { bg: "#FEF3C7", text: "#92400E" },
  ];

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1.5px solid rgba(15,23,42,0.09)",
    background: "#fff",
    fontSize: 13.5,
    outline: "none",
    color: "#14132B",
    boxSizing: "border-box",
    transition: "all 0.2s ease",
  };
  const cardBase: React.CSSProperties = { background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.07)", padding: 22 };
  const cardTitle: React.CSSProperties = { fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "#14132B", display: "flex", alignItems: "center", gap: 8, marginBottom: 16 };

  return (
    <div style={{ maxWidth: 1200 }}>
      <style>{`
        @keyframes profRise { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform: translateY(0); } }
@keyframes floatOrb1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-16px,14px) scale(1.08); } }
@keyframes floatOrb2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(12px,-10px) scale(0.92); } }
@keyframes floatOrb3 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(20px,10px); } }
.orb-float-1 { animation: floatOrb1 7s ease-in-out infinite; }
.orb-float-2 { animation: floatOrb2 6s ease-in-out infinite; }
.orb-float-3 { animation: floatOrb3 8s ease-in-out infinite; }
        @keyframes flipIn { from { opacity:0; transform: scale(0.97) translateY(6px); } to { opacity:1; transform: scale(1) translateY(0); } }
        @keyframes badgePop { from { opacity:0; transform: scale(0.8) translateY(10px); } to { opacity:1; transform: scale(1) translateY(0); } }
        @keyframes shimmer { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes popModalT { from { opacity:0; transform: scale(0.94) translateY(10px); } to { opacity:1; transform: scale(1) translateY(0); } }
        @keyframes heroHueMove { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes sheenSweep { 0% { transform: translateX(-160%) rotate(10deg); } 100% { transform: translateX(260%) rotate(10deg); } }
        @keyframes heroRingSpin { to { transform: rotate(360deg); } }
        @keyframes glowPulse { 0%,100% { opacity: 0.55; } 50% { opacity: 1; } }
        .prof-anim { animation: profRise 0.5s cubic-bezier(.2,.8,.2,1) both; }
        .flip-card { animation: flipIn 0.35s cubic-bezier(.2,.8,.2,1) both; }
        .prof-input:focus { border-color: #6D4AFF !important; box-shadow: 0 0 0 4px rgba(109,74,255,0.1); }
        .skill-chip { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .skill-chip:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(15,23,42,0.1); }
        .chip-x { transition: transform 0.15s ease; cursor: pointer; opacity: 0.6; }
        .chip-x:hover { transform: scale(1.25); opacity: 1; }
        .btn-anim { transition: transform 0.15s ease, box-shadow 0.2s ease; }
        .btn-anim:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(109,74,255,0.35); }
        .btn-anim:active:not(:disabled) { transform: scale(0.97); }
        .badge-anim { animation: badgePop 0.45s cubic-bezier(.34,1.56,.64,1) both; }
        .ach-card { transition: transform 0.2s cubic-bezier(.34,1.56,.64,1); }
        .ach-card:hover { transform: translateY(-4px); }
        .ach-badge-img { transition: transform 0.25s cubic-bezier(.34,1.56,.64,1); }
        .ach-card:hover .ach-badge-img { transform: scale(1.08) rotate(-3deg); }
        .stat-card { transition: transform 0.2s ease; }
        .stat-card:hover { transform: translateY(-3px); }
        .locked-shimmer { animation: shimmer 2.2s ease-in-out infinite; }
        .activity-row { transition: background 0.15s ease; }
        .team-tile { transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; }
        .team-tile:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(109,74,255,0.15); }
        .avatar-upload { transition: transform 0.2s ease; cursor: pointer; }
        .avatar-upload:hover { transform: scale(1.05); }
       .hero-card { position: relative; }
        .hero-gradient-bg {
          position: absolute; inset: 0;
          background: linear-gradient(120deg,#6D4AFF 0%,#8B5CF6 45%,#A78BFA 100%);
        }
        .sheen-sweep {
          position: absolute; top: -60%; left: 0; width: 35%; height: 220%;
          background: linear-gradient(100deg, transparent, rgba(255,255,255,0.18), transparent);
          animation: sheenSweep 7s ease-in-out infinite;
          pointer-events: none;
        }
        .hero-glass { background: transparent; border: none; }
        .hero-ring { animation: heroRingSpin 9s linear infinite; }
        .hero-glow { animation: glowPulse 2.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .hero-gradient-bg, .sheen-sweep, .hero-ring, .hero-glow, .orb-float-1, .orb-float-2, .orb-float-3, .locked-shimmer {
            animation: none !important;
          }
        }
      `}</style>

      {/* Hero banner */}
     <div
        ref={heroRef}
        className="prof-anim hero-card"
        style={{ animationDelay: "0s", borderRadius: 24, overflow: "hidden", marginBottom: 20, boxShadow: "0 20px 50px rgba(109,74,255,0.28)" }}
      >
        <div style={{ padding: "30px", position: "relative", overflow: "hidden" }}>
          <div className="hero-gradient-bg" />
         <div className="orb-float-1" style={{ position: "absolute", top: -40, right: -20, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
          <div className="orb-float-2" style={{ position: "absolute", top: 40, right: 120, width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
          <div className="orb-float-3" style={{ position: "absolute", bottom: -30, left: "30%", width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
          <div className="sheen-sweep" />

          <div className="hero-glass" style={{ position: "relative", borderRadius: 18, padding: "22px 26px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ position: "relative" }}>
                <svg className="hero-ring" width="104" height="104" style={{ position: "absolute", top: -4, left: -4 }}>
                  <circle cx="52" cy="52" r="50" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeDasharray="6 9" />
                </svg>
                <div
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: "50%",
                    background: avatar ? "transparent" : "rgba(255,255,255,0.15)",
                    border: "3px solid rgba(255,255,255,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 36,
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 700,
                    flexShrink: 0,
                    overflow: "hidden",
                  }}
                >
                  {avatar ? <img src={avatar} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : user.name[0]?.toUpperCase()}
                </div>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 700, color: "#fff" }}>{user.name}</h1>
                  {role === "ORGANIZER" && organizerProfile?.isVerified && (
                    <span title="Verified" className="hero-glow" style={{ color: "#fff", display: "inline-flex" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,255,255,0.9)">
                        <path d="M12 2l2.4 2.2 3.2-.6.8 3.2 3 1.5-1.2 3.1 1.2 3.1-3 1.5-.8 3.2-3.2-.6L12 22l-2.4-2.2-3.2.6-.8-3.2-3-1.5 1.2-3.1L2.6 9.5l3-1.5.8-3.2 3.2.6L12 2z" />
                        <path d="M9 12l2 2 4-4" stroke="#6D4AFF" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}
                </div>
                {user.username && <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 13.5, marginBottom: 6 }}>@{user.username}</p>}
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.5, background: "rgba(255,255,255,0.2)", color: "#fff", padding: "5px 14px", borderRadius: 20 }}>
                  {role}
                </span>
                {bannerText && <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, marginTop: 10, maxWidth: 400, fontStyle: "italic" }}>"{bannerText}"</p>}
              </div>
            </div>

            <button
              className="btn-anim"
              onClick={() => setEditing(true)}
              style={{
                background: "#fff",
                color: "#6D4AFF",
                border: "none",
                borderRadius: 10,
                padding: "10px 20px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                flexShrink: 0,
              }}
            >
              ✏️ Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Stat row */}
      {role === "STUDENT" && stats && (
        <div className="prof-anim" style={{ animationDelay: "0.05s", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 20 }}>
          <div onClick={handleWinsCardClick} style={{ cursor: "pointer" }}>
  <StatCard icon="🏆" label="Wins" value={stats.wins} tone="#D4A017" grad="linear-gradient(155deg,#FEF3C7,#FFFBEB)" />
</div>
<StatCard icon="🚀" label="Challenges Joined" value={stats.challengesJoined} tone="#6D4AFF" grad="linear-gradient(155deg,#EDE9FE,#F5F3FF)" />
<StatCard icon="📤" label="Submissions" value={stats.submissions} tone="#2563EB" grad="linear-gradient(155deg,#DBEAFE,#EFF6FF)" />
<StatCard icon="👥" label="Teams" value={stats.teamsCount} tone="#059669" grad="linear-gradient(155deg,#D1FAE5,#F0FDF4)" />
<StatCard icon="🎖️" label="Badges Earned" value={earnedSet.size} tone="#DB2777" grad="linear-gradient(155deg,#FCE7F3,#FDF2F8)" />
        </div>
      )}

      {role === "ORGANIZER" && stats && (
        <div className="prof-anim" style={{ animationDelay: "0.05s", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
          <StatCard icon="🚩" label="Total Challenges" value={stats.totalChallenges || 0} tone="#6D4AFF" grad="linear-gradient(155deg,#EDE9FE,#F5F3FF)" />
          <StatCard icon="⏱️" label="Active Now" value={stats.activeChallenges || 0} tone="#2563EB" grad="linear-gradient(155deg,#DBEAFE,#EFF6FF)" />
          <StatCard icon="📤" label="Total Submissions" value={stats.totalSubmissions || 0} tone="#D97706" grad="linear-gradient(155deg,#FEF3C7,#FFFBEB)" />
          <StatCard icon="👥" label="Total Participants" value={stats.totalParticipations || 0} tone="#059669" grad="linear-gradient(155deg,#D1FAE5,#F0FDF4)" />
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: role === "STUDENT" ? "1fr 1fr" : "1fr", gap: 16 }}>
        {/* About */}
        <div className="prof-anim" style={{ animationDelay: "0.1s", ...cardBase }}>
          <h3 style={cardTitle}>👤 About Me</h3>

          {role === "ORGANIZER" && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11.5, fontWeight: 700, color: "rgba(20,19,43,0.4)", textTransform: "uppercase", marginBottom: 4 }}>Organization</p>
              <p style={{ fontSize: 14, color: "#14132B", fontWeight: 600 }}>{orgName || "Not set"}</p>
            </div>
          )}

          {role === "STUDENT" && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11.5, fontWeight: 700, color: "rgba(20,19,43,0.4)", textTransform: "uppercase", marginBottom: 4 }}>🎓 Education</p>
              <p style={{ fontSize: 14, color: education ? "#14132B" : "rgba(20,19,43,0.35)", fontWeight: education ? 600 : 400 }}>{education || "Not set yet"}</p>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11.5, fontWeight: 700, color: "rgba(20,19,43,0.4)", textTransform: "uppercase", marginBottom: 8 }}>Bio</p>
            <p style={{ fontSize: 13.5, color: bio ? "rgba(20,19,43,0.7)" : "rgba(20,19,43,0.35)", lineHeight: 1.6 }}>
              {bio || "No bio added yet."}
            </p>
          </div>

          {role === "STUDENT" && portfolioUrl && (
            <div style={{ marginBottom: skills.length > 0 ? 16 : 0 }}>
              <p style={{ fontSize: 11.5, fontWeight: 700, color: "rgba(20,19,43,0.4)", textTransform: "uppercase", marginBottom: 6 }}>Portfolio</p>
              <a href={portfolioUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "#6D4AFF", fontWeight: 600, wordBreak: "break-all" }}>
                🔗 {portfolioUrl}
              </a>
            </div>
          )}

          {role === "STUDENT" && skills.length > 0 && (
            <div>
              <p style={{ fontSize: 11.5, fontWeight: 700, color: "rgba(20,19,43,0.4)", textTransform: "uppercase", marginBottom: 8 }}>Skills</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {skills.map((s, i) => {
                  const c = SKILL_COLORS[i % SKILL_COLORS.length];
                  return (
                    <span key={i} style={{ fontSize: 12, fontWeight: 700, padding: "6px 13px", borderRadius: 20, background: c.bg, color: c.text }}>
                      {s}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {role === "STUDENT" && (
          <div className="prof-anim" style={{ animationDelay: "0.15s", ...cardBase }}>
            <h3 style={cardTitle}>⚡ Recent Activity</h3>
            {recentActivity.length === 0 ? (
              <p style={{ fontSize: 13, color: "rgba(20,19,43,0.4)" }}>No activity yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {recentActivity.map((a, i) => (
                  <div key={i} className="activity-row" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 6px", borderTop: i > 0 ? "1px solid rgba(15,23,42,0.05)" : "none", borderRadius: 8 }}>
                    <span style={{ fontSize: 15 }}>{a.type === "win" ? "🏆" : "📤"}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, color: "#14132B", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.text}</p>
                    </div>
                    <span style={{ fontSize: 11, color: "rgba(20,19,43,0.35)", flexShrink: 0 }}>{timeAgo(a.time)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {role === "ORGANIZER" && (
        <div
          className="prof-anim"
          style={{
            animationDelay: "0.12s",
            marginTop: 16,
            ...cardBase,
            background: "linear-gradient(155deg,#EDE9FE 0%,#F5F3FF 100%)",
            border: "1px solid rgba(109,74,255,0.12)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div className="orb-float-2" style={{ position: "absolute", top: -30, right: -20, width: 140, height: 140, borderRadius: "50%", background: "rgba(109,74,255,0.08)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, position: "relative" }}>
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "#14132B", display: "flex", alignItems: "center", gap: 8 }}>
              ✨ Profile Strength
            </h3>
            <span className="hero-glow" style={{ fontSize: 20, fontWeight: 800, color: "#4C2FCC", fontFamily: "'Sora', sans-serif" }}>{profileStrength}%</span>
          </div>
          <div style={{ width: "100%", height: 8, borderRadius: 20, background: "rgba(76,47,204,0.1)", overflow: "hidden", marginBottom: 16, position: "relative" }}>
            <div style={{ width: `${profileStrength}%`, height: "100%", borderRadius: 20, background: "linear-gradient(90deg,#6D4AFF,#8B5CF6)", transition: "width 0.6s cubic-bezier(.2,.8,.2,1)", position: "relative", overflow: "hidden" }}>
              <div className="sheen-sweep" style={{ top: "-100%", height: "300%", width: "60%" }} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8, position: "relative" }}>
            {profileFields.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: f.done ? "#14132B" : "rgba(20,19,43,0.35)" }}>
                <span style={{ width: 16, height: 16, borderRadius: "50%", background: f.done ? "rgba(109,74,255,0.18)" : "rgba(15,23,42,0.05)", color: "#6D4AFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, flexShrink: 0 }}>
                  {f.done ? "✓" : ""}
                </span>
                {f.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {role === "ORGANIZER" && (
        <div className="prof-anim" style={{ animationDelay: "0.16s", marginTop: 16 }}>
          <h3 style={{ ...cardTitle, marginBottom: 14 }}>
            🏅 Organizer Milestones
            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(20,19,43,0.4)" }}>({orgEarnedSet.size}/{ORG_MILESTONES.length})</span>
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 14 }}>
            {ORG_MILESTONES.map((m, i) => {
              const earned = orgEarnedSet.has(m.title);
              return (
                <div key={i} className="badge-anim" style={{ animationDelay: `${i * 0.04}s` }}>
                  <TiltCard
                    intensity={earned ? 5 : 0}
                    glow={earned ? `${m.grad[0]}55` : "transparent"}
                    style={{
                      background: "#fff",
                      borderRadius: 16,
                      border: earned ? `1px solid ${m.grad[0]}33` : "1px solid rgba(15,23,42,0.06)",
                      padding: "18px 10px",
                      textAlign: "center",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        margin: "0 auto 10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: earned ? `linear-gradient(135deg, ${m.grad[0]}, ${m.grad[1]})` : "#F0EEF7",
                        boxShadow: earned ? `0 8px 20px ${m.grad[0]}44` : "none",
                        filter: earned ? "none" : "grayscale(1)",
                        opacity: earned ? 1 : 0.4,
                        position: "relative",
                      }}
                    >
                      <MilestoneBadgeIcon type={m.svg} />
                    </div>
                    {!earned && <div className="locked-shimmer" style={{ position: "absolute", top: 14, right: "50%", transform: "translateX(26px)", fontSize: 11 }}>🔒</div>}
                    <p style={{ fontSize: 11.5, fontWeight: 700, color: earned ? "#14132B" : "rgba(20,19,43,0.4)", lineHeight: 1.3, position: "relative" }}>{m.title}</p>
                  </TiltCard>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {role === "ORGANIZER" && recentChallenges.length > 0 && (
        <div className="prof-anim" style={{ animationDelay: "0.2s", marginTop: 16 }}>
          <h3 style={{ ...cardTitle, marginBottom: 14 }}>🚩 Recent Challenges</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16 }}>
            {recentChallenges.map((c: any) => {
              const STATUS_META: Record<string, { color: string; bg: string; label: string }> = {
                DRAFT: { color: "#6B7280", bg: "rgba(107,114,128,0.1)", label: "Draft" },
                PUBLISHED: { color: "#15803D", bg: "rgba(22,163,74,0.1)", label: "Live" },
                CLOSED: { color: "#B91C1C", bg: "rgba(220,38,38,0.1)", label: "Closed" },
                COMPLETED: { color: "#6B7280", bg: "rgba(107,114,128,0.1)", label: "Ended" },
              };
              const sm = STATUS_META[c.status] || STATUS_META.DRAFT;
              const completionRate = (c._count?.participations || 0) > 0
                ? Math.round(((c._count?.submissions || 0) / (c._count?.participations || 1)) * 100)
                : 0;
              return (
                <div key={c.id} onClick={() => router.push(`/dashboard/review?challenge=${c.id}`)} style={{ cursor: "pointer" }}>
                  <TiltCard
                    intensity={3}
                    glow="rgba(109,74,255,0.1)"
                    style={{
                      background: "linear-gradient(160deg, #FBFAFF 0%, #F6F5FB 100%)",
                      border: "1px solid rgba(109,74,255,0.1)",
                      borderRadius: 18,
                      padding: 18,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <span style={{ fontSize: 14.5, fontWeight: 700, color: "#14132B", lineHeight: 1.3 }}>{c.title}</span>
                      <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: sm.bg, color: sm.color, flexShrink: 0, marginLeft: 8, whiteSpace: "nowrap" }}>
                        {sm.label}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                      <div>
                        <p style={{ fontSize: 18, fontWeight: 800, color: "#6D4AFF", fontFamily: "'Sora', sans-serif" }}>{c._count?.submissions || 0}</p>
                        <p style={{ fontSize: 10.5, color: "rgba(20,19,43,0.45)", fontWeight: 600 }}>Submissions</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 18, fontWeight: 800, color: "#2563EB", fontFamily: "'Sora', sans-serif" }}>{c._count?.participations || 0}</p>
                        <p style={{ fontSize: 10.5, color: "rgba(20,19,43,0.45)", fontWeight: 600 }}>Participants</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "rgba(20,19,43,0.4)", fontWeight: 600, marginBottom: 4 }}>
                      <span>Completion</span>
                      <span style={{ color: "#6D4AFF" }}>{completionRate}%</span>
                    </div>
                    <div style={{ width: "100%", height: 6, borderRadius: 20, background: "rgba(15,23,42,0.06)", overflow: "hidden" }}>
                      <div style={{ width: `${completionRate}%`, height: "100%", borderRadius: 20, background: "linear-gradient(90deg,#6D4AFF,#8B5CF6)", transition: "width 0.6s ease" }} />
                    </div>
                  </TiltCard>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Achievements */}
      {role === "STUDENT" && (
        <div className="prof-anim" style={{ animationDelay: "0.2s", marginTop: 16 }}>
          <h3 style={{ ...cardTitle, marginBottom: 14 }}>
            🏅 Achievements
            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(20,19,43,0.4)" }}>({earnedSet.size}/{ACHIEVEMENTS.length})</span>
          </h3>
         



 <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 16 }}>
            {ACHIEVEMENTS.map((a, i) => {
              const earned = earnedSet.has(a.title);
              return (
                <div
                  key={i}
                  className="badge-anim ach-card"
                  style={{ animationDelay: `${i * 0.04}s`, cursor: earned ? "pointer" : "default" }}
                  onClick={() => handleBadgeClick(a, earned)}
                >
                  <TiltCard
                    intensity={earned ? 6 : 1}
                    glow={earned ? `${a.color}66` : "rgba(15,23,42,0.06)"}
                    style={{
                      background: earned ? "linear-gradient(160deg,#1A1626,#2A2340)" : "#F6F5FB",
                      borderRadius: 18,
                      border: earned ? `1px solid ${a.color}44` : "1px solid rgba(15,23,42,0.06)",
                      padding: "20px 12px",
                      textAlign: "center",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {earned && <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 0%, ${a.color}28, transparent 65%)`, pointerEvents: "none" }} />}
                    <div
                      className="ach-badge-img"
                      style={{
                        width: 68,
                        height: 68,
                        borderRadius: "50%",
                        margin: "0 auto 12px",
                        overflow: "hidden",
                        border: earned ? `2px solid ${a.color}66` : "1px solid rgba(15,23,42,0.08)",
                        boxShadow: earned ? `0 10px 24px ${a.color}55` : "none",
                        position: "relative",
                        filter: earned ? "none" : "grayscale(1)",
                        opacity: earned ? 1 : 0.35,
                      }}
                    >
                      <img src={a.icon} alt={a.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    {!earned && <div className="locked-shimmer" style={{ position: "absolute", top: 12, right: "50%", transform: "translateX(34px)", fontSize: 12 }}>🔒</div>}
                    <p style={{ fontSize: 12, fontWeight: 700, color: earned ? "#F5D98C" : "rgba(20,19,43,0.4)", lineHeight: 1.35, position: "relative" }}>{a.title}</p>
                    {earned && (
                      <span style={{ display: "inline-block", marginTop: 6, fontSize: 9.5, fontWeight: 800, color: a.color, letterSpacing: 0.5, textTransform: "uppercase", background: `${a.color}22`, padding: "2px 8px", borderRadius: 20, position: "relative" }}>
                        Unlocked
                      </span>
                    )}
                  </TiltCard>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Your Teams */}
      {role === "STUDENT" && teams.length > 0 && (
        <div className="prof-anim" style={{ animationDelay: "0.25s", marginTop: 16, ...cardBase }}>
          <h3 style={cardTitle}>👥 Your Teams</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {teams.map((t: any) => {
              const isLeader = t.leaderId === currentUserId;
              return (
                <div key={t.id} className="team-tile" onClick={() => router.push(`/dashboard/challenge/${t.challengeId}`)} style={{ background: "#F6F5FB", borderRadius: 14, padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: "#14132B" }}>{t.name}</span>
                    {isLeader && <span style={{ fontSize: 10, fontWeight: 700, background: "#FEF3C7", color: "#92400E", padding: "3px 8px", borderRadius: 20 }}>👑 Leader</span>}
                  </div>
                  <AvatarStack count={t.members.length} max={4} />
                  <p style={{ fontSize: 11.5, color: "rgba(20,19,43,0.4)", marginTop: 8 }}>{t.challenge.title} — click to open</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Wins modal */}
      {showWinsModal && (
        <div onClick={() => setShowWinsModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(20,19,43,0.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 22, padding: 26, width: 460, maxHeight: "80vh", overflowY: "auto", animation: "popModalT 0.3s cubic-bezier(.2,.8,.2,1)", boxShadow: "0 30px 60px rgba(20,19,43,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, color: "#14132B" }}>
  {activeAchievement?.type === "position" ? `${activeAchievement.title} (${wins.length})` : `🏆 Wins (${wins.length})`}
</h2>
              <button onClick={() => setShowWinsModal(false)} style={{ background: "rgba(20,19,43,0.05)", border: "none", borderRadius: 8, width: 28, height: 28, cursor: "pointer" }}>✕</button>
            </div>
            {winsLoading ? (
              <p style={{ textAlign: "center", padding: 30, color: "rgba(20,19,43,0.4)", fontSize: 13 }}>Loading...</p>
            ) : wins.length === 0 ? (
              <p style={{ textAlign: "center", padding: 30, color: "rgba(20,19,43,0.4)", fontSize: 13 }}>No wins yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {wins.map((w) => {
                  const medal = w.position === 1 ? "🥇" : w.position === 2 ? "🥈" : "🥉";
                  return (
                    <div key={w.id} style={{ background: "#F6F5FB", borderRadius: 14, padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 26 }}>{medal}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13.5, fontWeight: 700, color: "#14132B" }}>{w.challenge.title}</p>
                        <p style={{ fontSize: 12, color: "rgba(20,19,43,0.5)" }}>
                          {w.position === 1 ? "1st" : w.position === 2 ? "2nd" : "3rd"} place · {new Date(w.announcedAt).toLocaleDateString()}
                        </p>
                      </div>
                      {w.challenge.prize && <span style={{ fontSize: 12.5, fontWeight: 700, color: "#D97706" }}>{w.challenge.prize}</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submissions modal (for completion-count badges) */}
      {showSubsModal && (
        <div onClick={() => setShowSubsModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(20,19,43,0.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 22, padding: 26, width: 460, maxHeight: "80vh", overflowY: "auto", animation: "popModalT 0.3s cubic-bezier(.2,.8,.2,1)", boxShadow: "0 30px 60px rgba(20,19,43,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, color: "#14132B" }}>
                {activeAchievement?.icon && (
                  <img src={activeAchievement.icon} alt="" style={{ width: 24, height: 24, borderRadius: "50%", display: "inline-block", marginRight: 8, verticalAlign: "middle" }} />
                )}
                {activeAchievement?.title} ({submissions.length})
              </h2>
              <button onClick={() => setShowSubsModal(false)} style={{ background: "rgba(20,19,43,0.05)", border: "none", borderRadius: 8, width: 28, height: 28, cursor: "pointer" }}>✕</button>
            </div>
            {subsLoading ? (
              <p style={{ textAlign: "center", padding: 30, color: "rgba(20,19,43,0.4)", fontSize: 13 }}>Loading...</p>
            ) : submissions.length === 0 ? (
              <p style={{ textAlign: "center", padding: 30, color: "rgba(20,19,43,0.4)", fontSize: 13 }}>No submissions yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {submissions.map((s) => (
                  <div key={s.id} style={{ background: "#F6F5FB", borderRadius: 14, padding: 14 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: "#14132B" }}>{s.challenge.title}</p>
                    <p style={{ fontSize: 12, color: "rgba(20,19,43,0.5)" }}>Submitted {new Date(s.submittedAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div onClick={() => setEditing(false)} style={{ position: "fixed", inset: 0, background: "rgba(20,19,43,0.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} className="flip-card" style={{ background: "#fff", borderRadius: 22, padding: 28, width: 480, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 30px 60px rgba(20,19,43,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 19, fontWeight: 700, color: "#14132B" }}>Edit Profile</h2>
              <button onClick={() => setEditing(false)} style={{ background: "rgba(20,19,43,0.05)", border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>

            <div style={{ marginBottom: 18, textAlign: "center" }}>
              <div
                className="avatar-upload"
                onClick={() => fileRef.current?.click()}
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: "50%",
                  background: avatar ? "transparent" : "linear-gradient(135deg,#6D4AFF,#8B5CF6)",
                  margin: "0 auto 8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 28,
                  fontWeight: 700,
                  overflow: "hidden",
                  border: "3px solid #F6F5FB",
                }}
              >
                {avatar ? <img src={avatar} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : user.name[0]?.toUpperCase()}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
              <span onClick={() => fileRef.current?.click()} style={{ fontSize: 12, color: "#6D4AFF", fontWeight: 600, cursor: "pointer" }}>
                Change Photo
              </span>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(20,19,43,0.5)", marginBottom: 8, display: "block" }}>Banner Tagline</label>
              <input className="prof-input" style={inputStyle} value={bannerText} onChange={(e) => setBannerText(e.target.value)} placeholder="A short line about yourself" />
            </div>

            {role === "ORGANIZER" && (
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(20,19,43,0.5)", marginBottom: 8, display: "block" }}>Organization Name</label>
                <input className="prof-input" style={inputStyle} value={orgName} onChange={(e) => setOrgName(e.target.value)} />
              </div>
            )}

            {role === "STUDENT" && (
              <>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(20,19,43,0.5)", marginBottom: 8, display: "block" }}>Education</label>
                  <input className="prof-input" style={inputStyle} value={education} onChange={(e) => setEducation(e.target.value)} placeholder="e.g. BCA, 4th Semester" />
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(20,19,43,0.5)", marginBottom: 8, display: "block" }}>Portfolio Link</label>
                  <input className="prof-input" style={inputStyle} value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://yourportfolio.com" />
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(20,19,43,0.5)", marginBottom: 8, display: "block" }}>Skills</label>
                  {skills.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                      {skills.map((s, i) => {
                        const c = SKILL_COLORS[i % SKILL_COLORS.length];
                        return (
                          <span key={i} className="skill-chip" style={{ fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: 20, background: c.bg, color: c.text, display: "inline-flex", alignItems: "center", gap: 6 }}>
                            {s}
                            <span className="chip-x" onClick={() => setSkills(skills.filter((_, idx) => idx !== i))}>×</span>
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8 }}>
                    <input className="prof-input" style={inputStyle} value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())} placeholder="Add a skill" />
                    <button onClick={addSkill} style={{ background: "#6D4AFF", color: "#fff", border: "none", borderRadius: 12, width: 44, fontSize: 18, cursor: "pointer" }}>+</button>
                  </div>
                </div>
              </>
            )}

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(20,19,43,0.5)", marginBottom: 8, display: "block" }}>Bio</label>
              <textarea className="prof-input" style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>

            {error && <div style={{ background: "rgba(255,70,70,0.06)", color: "#d32f2f", fontSize: 12.5, padding: "8px 12px", borderRadius: 10, marginBottom: 14 }}>⚠ {error}</div>}

            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12 }}>
              {saved && <span style={{ fontSize: 13, color: "#15803D", fontWeight: 700 }}>✓ Saved</span>}
              <button
                className="btn-anim"
                onClick={save}
                disabled={saving}
                style={{ background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)", color: "#fff", border: "none", borderRadius: 12, padding: "12px 26px", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: saving ? 0.6 : 1 }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, tone, grad }: { icon: string; label: string; value: number; tone: string; grad: string }) {
  const [displayVal, setDisplayVal] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const duration = 700;
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayVal(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [value]);

  return (
    <TiltCard intensity={5} glow={`${tone}44`} style={{ background: grad, borderRadius: 18, padding: "18px 16px", border: "1px solid rgba(255,255,255,0.4)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -20, right: -20, width: 70, height: 70, borderRadius: "50%", background: `${tone}22`, filter: "blur(2px)" }} />
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: "rgba(255,255,255,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          marginBottom: 12,
          position: "relative",
          boxShadow: `0 4px 12px ${tone}33`,
        }}
      >
        {icon}
      </div>
      <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 800, color: tone, position: "relative", fontVariantNumeric: "tabular-nums" }}>
        {displayVal}
      </div>
      <div style={{ fontSize: 11.5, color: "rgba(20,19,43,0.55)", fontWeight: 700, marginTop: 3, position: "relative" }}>{label}</div>
    </TiltCard>
  );
}