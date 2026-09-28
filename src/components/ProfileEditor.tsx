"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import TiltCard from "./TiltCard";
import AvatarStack from "./AvatarStack";
import ProfileModal from "./ProfileModal";

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

type Tab = "overview" | "achievements" | "activity" | "teams";

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
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("overview");
   const [githubSyncing, setGithubSyncing] = useState(false);
  const [linkedinConnected, setLinkedinConnected] = useState(false);
  const [linkedinSyncing, setLinkedinSyncing] = useState(false);

  useEffect(() => {
    fetch("/api/profile/sync-linkedin")
      .then((r) => r.json())
      .then((d) => setLinkedinConnected(!!d.connected))
      .catch(() => {});
  }, []);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name || "");
  const [username, setUsername] = useState(user.username || "");
  const [education, setEducation] = useState(studentProfile?.education || "");
  const [bio, setBio] = useState(studentProfile?.bio || organizerProfile?.description || "");
  const [skills, setSkills] = useState<string[]>(studentProfile?.skills || []);
  const [skillInput, setSkillInput] = useState("");
  const [orgName, setOrgName] = useState(organizerProfile?.orgName || "");
   const [portfolioUrl, setPortfolioUrl] = useState(studentProfile?.portfolioUrl || "");
  const [githubUrl, setGithubUrl] = useState(studentProfile?.githubUrl || organizerProfile?.githubUrl || "");
  const [linkedinUrl, setLinkedinUrl] = useState(studentProfile?.linkedinUrl || organizerProfile?.linkedinUrl || "");
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

  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followTab, setFollowTab] = useState<"followers" | "following">("followers");
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [followLoading, setFollowLoading] = useState(false);
  const [viewingUsername, setViewingUsername] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
   const [copied, setCopied] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectSaving, setConnectSaving] = useState(false);
  const [connectSaved, setConnectSaved] = useState(false);

  async function saveConnections() {
    setConnectSaving(true);
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ githubUrl, linkedinUrl }),
    });
    setConnectSaving(false);
    if (res.ok) {
      setConnectSaved(true);
      router.refresh();
      setTimeout(() => setConnectSaved(false), 2000);
    }
  }
  const [rank, setRank] = useState<number | null>(null);

   useEffect(() => {
       if (searchParams.get("linked") === "github") {
      setGithubSyncing(true);
      fetch("/api/profile/sync-github", { method: "POST" })
        .then((r) => r.json())
        .then((d) => {
          if (d.githubUrl) setGithubUrl(d.githubUrl);
          setGithubSyncing(false);
          router.replace(window.location.pathname);
        })
        .catch(() => setGithubSyncing(false));
    }
    if (searchParams.get("linked") === "linkedin") {
      setLinkedinSyncing(true);
      fetch("/api/profile/sync-linkedin", { method: "POST" })
        .then((r) => r.json())
        .then((d) => {
          if (d.connected) setLinkedinConnected(true);
          setLinkedinSyncing(false);
          router.replace(window.location.pathname);
        })
        .catch(() => setLinkedinSyncing(false));
    }
  }, []);

  useEffect(() => {
    if (role === "STUDENT" && user.username) {
      fetch("/api/leaderboard")
        .then((r) => r.json())
        .then((d) => {
          const board = d.leaderboard || d.board || [];
          const idx = board.findIndex((entry: any) => entry.username === user.username || entry.name === user.name);
          if (idx !== -1) setRank(idx + 1);
        })
        .catch(() => {});
    }
  }, [role, user.username]);

  async function openFollowModal(t: "followers" | "following") {
    setFollowTab(t);
    setShowFollowModal(true);
    setFollowLoading(true);
    const res = await fetch("/api/follow/list");
    const data = await res.json();
    setFollowers(data.followers || []);
    setFollowing(data.following || []);
    setFollowLoading(false);
  }

  function copyProfileLink() {
    const url = `${window.location.origin}/u/${user.username}`;
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

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
        name,
        username,
        education,
        bio,
        skills,
        interests: studentProfile?.interests || [],
        orgName,
        portfolioUrl,
        githubUrl,
        linkedinUrl,
        bannerText,
        avatar,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to save. Please try again.");
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

  const TABS: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    ...(role === "STUDENT" ? [{ key: "achievements" as Tab, label: `Achievements (${earnedSet.size})` }] : [{ key: "achievements" as Tab, label: `Milestones (${orgEarnedSet.size})` }]),
    { key: "activity", label: role === "STUDENT" ? "Activity" : "Challenges" },
    ...(role === "STUDENT" ? [{ key: "teams" as Tab, label: "Teams" }] : []),
  ];

  return (
        <div className="profile-page">
      <style>{`
        @keyframes profRise { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform: translateY(0); } }
        @keyframes flipIn { from { opacity:0; transform: scale(0.97) translateY(6px); } to { opacity:1; transform: scale(1) translateY(0); } }
        @keyframes badgePop { from { opacity:0; transform: scale(0.8) translateY(10px); } to { opacity:1; transform: scale(1) translateY(0); } }
        @keyframes shimmer { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes popModalT { from { opacity:0; transform: scale(0.94) translateY(10px); } to { opacity:1; transform: scale(1) translateY(0); } }
               @keyframes bannerDrift { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-3%,2%) scale(1.05); } }
        @keyframes bannerDrift2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(3%,-2%) scale(1.04); } }
        @keyframes bannerDrift3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-2%,-3%) scale(1.06); } }
        @keyframes tabUnderline { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes glowPulse { 0%,100% { opacity: 0.55; } 50% { opacity: 1; } }
        @keyframes avatarRingSpin { to { transform: rotate(360deg); } }
        @keyframes avatarGlow { 0%,100% { box-shadow: 0 10px 28px rgba(109,74,255,0.25); } 50% { box-shadow: 0 10px 40px rgba(109,74,255,0.45); } }
        @keyframes sheenPass { 0% { transform: translateX(-120%) skewX(-15deg); } 100% { transform: translateX(220%) skewX(-15deg); } }
        @keyframes numberPop { from { transform: scale(0.7); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes badgeFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }

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
        .profile-stat-card { position: relative; overflow: hidden; cursor: default; transition: transform 0.15s ease-out, box-shadow 0.2s ease; will-change: transform; }
        .profile-stat-card:hover .profile-stat-shine { left: 120%; }
        .profile-stat-shine { position: absolute; top: -20%; left: -60%; width: 40%; height: 160%; background: linear-gradient(100deg, transparent, rgba(255,255,255,0.5), transparent); transition: left 0.6s ease; pointer-events: none; }
        .locked-shimmer { animation: shimmer 2.2s ease-in-out infinite; }
        .activity-row { transition: background 0.15s ease; }
        .team-tile { transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; }
        .team-tile:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(109,74,255,0.15); }
        .avatar-upload { transition: transform 0.2s ease; cursor: pointer; }
        .avatar-upload:hover { transform: scale(1.05); }
        .follow-stat-hover { transition: opacity 0.15s ease; cursor: pointer; }
        .follow-stat-hover:hover { opacity: 0.65; }
        .glow-pulse { animation: glowPulse 2.6s ease-in-out infinite; }

                .banner-blur-1 { position: absolute; border-radius: 50%; filter: blur(50px); animation: bannerDrift 10s ease-in-out infinite; }
        .banner-blur-2 { position: absolute; border-radius: 50%; filter: blur(60px); animation: bannerDrift2 12s ease-in-out infinite; }
        .banner-blur-3 { position: absolute; border-radius: 50%; filter: blur(55px); animation: bannerDrift3 13s ease-in-out infinite; }

        .avatar-frame { position: relative; }
        .avatar-ring-anim { animation: avatarRingSpin 12s linear infinite; }
        .avatar-glow-anim { animation: avatarGlow 3s ease-in-out infinite; transition: transform 0.25s cubic-bezier(.34,1.56,.64,1); }
        .avatar-glow-anim:hover { transform: scale(1.04) rotate(-2deg); }

        .tab-btn { position: relative; background: none; border: none; padding: 10px 4px; font-size: 14px; font-weight: 700; cursor: pointer; transition: color 0.15s ease, transform 0.15s ease; }
        .tab-btn:hover { transform: translateY(-1px); }
        .tab-underline { position: absolute; bottom: -1px; left: 0; right: 0; height: 2px; background: linear-gradient(90deg,#6D4AFF,#8B5CF6); transform-origin: left; animation: tabUnderline 0.25s ease; }

        .name-badge-hover { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .name-badge-hover:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(109,74,255,0.3); }

        .stat-number-anim { animation: numberPop 0.4s cubic-bezier(.34,1.56,.64,1) both; }

        .banner-sheen { position: absolute; top: 0; left: 0; width: 40%; height: 100%; background: linear-gradient(100deg, transparent, rgba(255,255,255,0.25), transparent); animation: sheenPass 5s ease-in-out infinite; pointer-events: none; }

        .badge-float { animation: badgeFloat 2.4s ease-in-out infinite; }

        .profile-page { max-width: 1400px; width: 100%; min-width: 0; margin: 0 auto; }
        .profile-stats { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
        .profile-overview-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        .profile-tabs { overflow-x: auto; scrollbar-width: none; white-space: nowrap; }
        .profile-tabs::-webkit-scrollbar { display: none; }
        .profile-banner { height: 180px !important; }
        .profile-identity-row { display: grid !important; grid-template-columns: minmax(0, 1fr) auto auto auto auto auto; align-items: center; gap: 16px; }
        .profile-identity-main { min-width: 0; }
        .profile-share, .profile-edit { white-space: nowrap; }
        .profile-page .profile-card { min-width: 0; }
        .profile-stat-card { background: linear-gradient(155deg,#EDE9FE,#F5F3FF) !important; }
        .profile-stat-card > div:nth-child(4) { color: #6D4AFF !important; }
        .banner-blur-2 { background: rgba(139,92,246,0.2) !important; }
        @media (max-width: 900px) {
          .profile-stats { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
          .profile-overview-grid { grid-template-columns: minmax(0, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .profile-banner { height: 132px !important; border-radius: 18px !important; }
          .profile-identity-row { margin-top: -86px !important; padding: 0 14px !important; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px !important; }
          .profile-identity-main { grid-column: 1 / -1; align-items: center !important; gap: 12px !important; }
          .profile-identity-main > div:first-child { width: 76px !important; height: 76px !important; }
          .profile-identity-main > div:first-child > div { width: 80px !important; height: 80px !important; border-radius: 22px !important; }
          .profile-identity-main h1 { font-size: 20px !important; }
          .profile-follow-stat { padding: 8px 0; }
          .profile-follow-stat > div:first-child { font-size: 22px !important; }
          .profile-follow-stat > div:last-child { font-size: 12px !important; }
          .profile-share, .profile-edit { padding: 9px 12px !important; font-size: 13px !important; }
          .profile-social { gap: 6px !important; }
          .profile-social > a, .profile-social > button { width: 36px !important; height: 36px !important; }
          .profile-stats { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 10px !important; }
          .profile-tabs { gap: 20px !important; padding: 0 2px !important; }
          .profile-page .profile-card { padding: 18px !important; }
          .profile-page .profile-achievements { grid-template-columns: repeat(3, minmax(0,1fr)) !important; }
        }
        .locked-shimmer, .glow-pulse, .banner-blur-1, .banner-blur-2, .banner-blur-3, .avatar-ring-anim, .avatar-glow-anim, .banner-sheen, .badge-float { animation: none !important; }
        @media (prefers-reduced-motion: reduce) {
          .banner-blur-1, .banner-blur-2, .banner-blur-3, .glow-pulse, .locked-shimmer, .avatar-ring-anim, .avatar-glow-anim, .banner-sheen, .badge-float { animation: none !important; }
        }
      `}</style>

      {/* Outer wrapper: NOT clipped, holds both the banner and the overlapping identity row */}
      <div className="prof-anim" style={{ position: "relative", marginBottom: 22 }}>
                {/* Soft blurred banner */}
                <div className="profile-banner" style={{ position: "relative", height: 210, borderRadius: 24, overflow: "hidden", background: "linear-gradient(135deg,#F5F3FF,#EDE9FE)" }}>
          <div className="banner-blur-1" style={{ top: -40, left: "10%", width: 220, height: 220, background: "rgba(109,74,255,0.35)" }} />
          <div className="banner-blur-2" style={{ top: -20, right: "15%", width: 180, height: 180, background: "rgba(236,72,153,0.25)" }} />
          <div className="banner-blur-1" style={{ bottom: -60, left: "40%", width: 200, height: 200, background: "rgba(139,92,246,0.3)", animationDelay: "2s" }} />
          <div className="banner-blur-3" style={{ bottom: -30, right: "5%", width: 150, height: 150, background: "rgba(109,74,255,0.2)", animationDelay: "1s" }} />
          <div className="banner-sheen" />
        </div>

               {/* Identity row sits BELOW the banner div in the DOM, but pulled up visually to overlap it */}
        <div className="profile-identity-row" style={{ position: "relative", marginTop: -142, padding: "0 22px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div className="profile-identity-main" style={{ display: "flex", alignItems: "flex-end", gap: 18 }}>


                    <div className="avatar-glow-anim" style={{ width: 112, height: 112, flexShrink: 0 }}>
            <div
              className="avatar-upload"
              style={{
                width: 116,
                height: 116,
                borderRadius: 30,
                background: avatar ? "transparent" : "linear-gradient(135deg,#6D4AFF,#8B5CF6)",
                border: "4px solid #fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 40,
                fontFamily: "'Sora', sans-serif",
                fontWeight: 700,
                overflow: "hidden",
                position: "relative",
              }}
            >
              {avatar ? <img src={avatar} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : user.name[0]?.toUpperCase()}
            </div>
          </div>

          <div style={{ paddingBottom: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
              <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 700, color: "#14132B" }}>{user.name}</h1>
                            <span className="name-badge-hover" style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.4, background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)", color: "#fff", padding: "4px 11px", borderRadius: 20, cursor: "default" }}>
                {role}
              </span>
              {rank && (
                <span className="name-badge-hover badge-float" style={{ fontSize: 10.5, fontWeight: 700, background: "rgba(217,119,6,0.1)", color: "#B45309", padding: "4px 11px", borderRadius: 20, cursor: "default" }}>🏅 Rank #{rank}</span>
              )}
              {role === "ORGANIZER" && organizerProfile?.isVerified && (
                <span title="Verified" className="glow-pulse" style={{ color: "#2563EB", display: "inline-flex" }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 2.2 3.2-.6.8 3.2 3 1.5-1.2 3.1 1.2 3.1-3 1.5-.8 3.2-3.2-.6L12 22l-2.4-2.2-3.2.6-.8-3.2-3-1.5 1.2-3.1L2.6 9.5l3-1.5.8-3.2 3.2.6L12 2z" /><path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
              )}
            </div>
            {user.username && <p style={{ color: "rgba(20,19,43,0.45)", fontSize: 13.5, marginBottom: 6 }}>@{user.username}</p>}
            {bio && <p style={{ color: "rgba(20,19,43,0.6)", fontSize: 13, maxWidth: 420 }}>{bio}</p>}
          </div>
        </div>

          <div className="follow-stat-hover profile-follow-stat" onClick={() => openFollowModal("followers")} style={{ textAlign: "center" }}>
            <div className="stat-number-anim" style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 800, color: "#14132B" }}>{stats?.followerCount ?? 0}</div>
            <div style={{ fontSize: 18, color: "rgba(20,19,43,0.45)", fontWeight: 600 }}>Followers</div>
          </div>
          <div className="follow-stat-hover profile-follow-stat" onClick={() => openFollowModal("following")} style={{ textAlign: "center" }}>
            <div className="stat-number-anim" style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 800, color: "#14132B", animationDelay: "0.08s" }}>{stats?.followingCount ?? 0}</div>
            <div style={{ fontSize: 18, color: "rgba(20,19,43,0.45)", fontWeight: 600 }}>Following</div>
          </div>
          <button
            className="btn-anim profile-share"
            onClick={copyProfileLink}
            style={{ background: "#fff", color: "#6D4AFF", border: "1.5px solid rgba(109,74,255,0.25)", borderRadius: 10, padding: "9px 16px", fontSize: 18, fontWeight: 700, cursor: "pointer" }}
          >
            {copied ? "✓ Copied!" : "🔗 Share"}
          </button>
                   <div className="profile-social" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {githubUrl ? (
              
               <a href={githubUrl}
                target="_blank"
                rel="noreferrer"
                title="GitHub"
                className="btn-anim"
                style={{ width: 50, height: 50, borderRadius: 10, background: "#14132B", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", textDecoration: "none" }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.7 5.38-5.27 5.67.42.36.78 1.07.78 2.16 0 1.56-.01 2.82-.01 3.2 0 .3.2.66.79.55A10.52 10.52 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5Z"/></svg>
              </a>
            ) : (
              <button
                onClick={() => setShowConnectModal(true)}
                title="Connect GitHub"
                className="btn-anim"
                style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(20,19,43,0.06)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(20,19,43,0.35)", cursor: "pointer", fontSize: 18 }}
              >
                +
              </button>
            )}

            {linkedinUrl ? (
              
               <a href={linkedinUrl}
                target="_blank"
                rel="noreferrer"
                title="LinkedIn"
                className="btn-anim"
                style={{ width: 50, height: 50, borderRadius: 10, background: "#0A66C2", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", textDecoration: "none" }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z"/></svg>
              </a>
            ) : (
              <button
                onClick={() => setShowConnectModal(true)}
                title="Connect LinkedIn"
                className="btn-anim"
                style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(20,19,43,0.06)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(20,19,43,0.35)", cursor: "pointer", fontSize: 18 }}
              >
                +
              </button>
            )}
          </div>
                                        <button
            className="btn-anim profile-edit"
            onClick={() => setEditing(true)}
            style={{ background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)", color: "#fff", border: "none", borderRadius: 10, padding: "9px 20px", fontSize: 20, fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 16px rgba(109,74,255,0.3)" }}
          >
            ✏️ Edit Profile
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="prof-anim profile-tabs" style={{ animationDelay: "0.08s", display: "flex", gap: 26, borderBottom: "1px solid rgba(15,23,42,0.08)", marginBottom: 22, padding: "0 8px" }}>
        {TABS.map((t) => (
          <button key={t.key} className="tab-btn" onClick={() => setTab(t.key)} style={{ color: tab === t.key ? "#14132B" : "rgba(20,19,43,0.4)" }}>
            {t.label}
            {tab === t.key && <div className="tab-underline" />}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {tab === "overview" && (
        <>



          {role === "STUDENT" && stats && (
            <div className="prof-anim profile-stats" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 14, marginBottom: 20 }}>
              <div onClick={handleWinsCardClick} style={{ cursor: "pointer" }}>
                <StatCard icon="🏆" label="Wins" value={stats.wins} tone="#D4A017" grad="linear-gradient(155deg,#FEF3C7,#FFFBEB)" />
              </div>
              <MoneyStatCard icon="💰" label="Total Winnings" value={stats.totalWinnings || 0} tone="#15803D" grad="linear-gradient(155deg,#D1FAE5,#ECFDF5)" />
              <StatCard icon="🚀" label="Challenges Joined" value={stats.challengesJoined} tone="#6D4AFF" grad="linear-gradient(155deg,#EDE9FE,#F5F3FF)" />
              <StatCard icon="📤" label="Submissions" value={stats.submissions} tone="#2563EB" grad="linear-gradient(155deg,#DBEAFE,#EFF6FF)" />
              <StatCard icon="👥" label="Teams" value={stats.teamsCount} tone="#059669" grad="linear-gradient(155deg,#D1FAE5,#F0FDF4)" />
              <StatCard icon="🎖️" label="Badges Earned" value={earnedSet.size} tone="#DB2777" grad="linear-gradient(155deg,#FCE7F3,#FDF2F8)" />
            </div>
          )}

          {role === "ORGANIZER" && stats && (
            <div className="prof-anim profile-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
              <StatCard icon="🚩" label="Total Challenges" value={stats.totalChallenges || 0} tone="#6D4AFF" grad="linear-gradient(155deg,#EDE9FE,#F5F3FF)" />
              <StatCard icon="⏱️" label="Active Now" value={stats.activeChallenges || 0} tone="#2563EB" grad="linear-gradient(155deg,#DBEAFE,#EFF6FF)" />
              <StatCard icon="📤" label="Total Submissions" value={stats.totalSubmissions || 0} tone="#D97706" grad="linear-gradient(155deg,#FEF3C7,#FFFBEB)" />
              <StatCard icon="👥" label="Total Participants" value={stats.totalParticipations || 0} tone="#059669" grad="linear-gradient(155deg,#D1FAE5,#F0FDF4)" />
            </div>
          )}

          <div className="profile-overview-grid" style={{ display: "grid", gridTemplateColumns: role === "STUDENT" ? "1fr 1fr" : "1fr", gap: 16 }}>
            <div className="prof-anim profile-card" style={{ animationDelay: "0.1s", ...cardBase }}>
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
              <div className="prof-anim profile-card" style={{ animationDelay: "0.15s", ...cardBase }}>
                <h3 style={cardTitle}>⚡ Recent Activity</h3>
                {recentActivity.length === 0 ? (
                  <p style={{ fontSize: 13, color: "rgba(20,19,43,0.4)" }}>No activity yet.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {recentActivity.slice(0, 5).map((a, i) => (
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, position: "relative" }}>
                <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "#14132B", display: "flex", alignItems: "center", gap: 8 }}>
                  ✨ Profile Strength
                </h3>
                <span className="glow-pulse" style={{ fontSize: 20, fontWeight: 800, color: "#4C2FCC", fontFamily: "'Sora', sans-serif" }}>{profileStrength}%</span>
              </div>
              <div style={{ width: "100%", height: 8, borderRadius: 20, background: "rgba(76,47,204,0.1)", overflow: "hidden", marginBottom: 16, position: "relative" }}>
                <div style={{ width: `${profileStrength}%`, height: "100%", borderRadius: 20, background: "linear-gradient(90deg,#6D4AFF,#8B5CF6)", transition: "width 0.6s cubic-bezier(.2,.8,.2,1)" }} />
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
        </>
      )}

      {/* ACHIEVEMENTS / MILESTONES TAB */}
      {tab === "achievements" && role === "STUDENT" && (
        <div className="prof-anim" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 16 }}>
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
                      width: 68, height: 68, borderRadius: "50%", margin: "0 auto 12px", overflow: "hidden",
                      border: earned ? `2px solid ${a.color}66` : "1px solid rgba(15,23,42,0.08)",
                      boxShadow: earned ? `0 10px 24px ${a.color}55` : "none",
                      filter: earned ? "none" : "grayscale(1)", opacity: earned ? 1 : 0.35,
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
      )}

      {tab === "achievements" && role === "ORGANIZER" && (
        <div className="prof-anim" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 14 }}>
          {ORG_MILESTONES.map((m, i) => {
            const earned = orgEarnedSet.has(m.title);
            return (
              <div key={i} className="badge-anim" style={{ animationDelay: `${i * 0.04}s` }}>
                <TiltCard
                  intensity={earned ? 5 : 0}
                  glow={earned ? `${m.grad[0]}55` : "transparent"}
                  style={{ background: "#fff", borderRadius: 16, border: earned ? `1px solid ${m.grad[0]}33` : "1px solid rgba(15,23,42,0.06)", padding: "18px 10px", textAlign: "center", position: "relative", overflow: "hidden" }}
                >
                  <div
                    style={{
                      width: 60, height: 60, borderRadius: "50%", margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center",
                      background: earned ? `linear-gradient(135deg, ${m.grad[0]}, ${m.grad[1]})` : "#F0EEF7",
                      boxShadow: earned ? `0 8px 20px ${m.grad[0]}44` : "none", filter: earned ? "none" : "grayscale(1)", opacity: earned ? 1 : 0.4,
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
      )}

      {/* ACTIVITY / CHALLENGES TAB */}
      {tab === "activity" && role === "STUDENT" && (
        <div className="prof-anim" style={cardBase}>
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

      {tab === "activity" && role === "ORGANIZER" && (
        <div className="prof-anim" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16 }}>
          {recentChallenges.length === 0 ? (
            <p style={{ fontSize: 13, color: "rgba(20,19,43,0.4)" }}>No challenges created yet.</p>
          ) : (
            recentChallenges.map((c: any) => {
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
                  <TiltCard intensity={3} glow="rgba(109,74,255,0.1)" style={{ background: "linear-gradient(160deg, #FBFAFF 0%, #F6F5FB 100%)", border: "1px solid rgba(109,74,255,0.1)", borderRadius: 18, padding: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <span style={{ fontSize: 14.5, fontWeight: 700, color: "#14132B", lineHeight: 1.3 }}>{c.title}</span>
                      <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: sm.bg, color: sm.color, flexShrink: 0, marginLeft: 8, whiteSpace: "nowrap" }}>{sm.label}</span>
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
            })
          )}
        </div>
      )}

      {/* TEAMS TAB */}
      {tab === "teams" && role === "STUDENT" && (
        <div className="prof-anim" style={cardBase}>
          <h3 style={cardTitle}>👥 Your Teams</h3>
          {teams.length === 0 ? (
            <p style={{ fontSize: 13, color: "rgba(20,19,43,0.4)" }}>You're not part of any team yet.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
              {teams.map((t: any) => {
                const isLeader = t.leaderId === currentUserId;
                return (
                  <div key={t.id} className="team-tile" onClick={() => router.push(`/dashboard/challenge/${t.challengeId}`)} style={{ background: "#F6F5FB", borderRadius: 14, padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: "#14132B" }}>{t.name}</span>
                      {isLeader && <span style={{ fontSize: 10, fontWeight: 700, background: "#FEF3C7", color: "#92400E", padding: "3px 8px", borderRadius: 20 }}>👑 Leader</span>}
                    </div>
                    <AvatarStack members={t.members.map((m: any) => ({ name: m.user?.name || m.name || "?", image: m.user?.image }))} max={4} />
                    <p style={{ fontSize: 11.5, color: "rgba(20,19,43,0.4)", marginTop: 8 }}>{t.challenge.title} — click to open</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Followers / Following modal */}
      {showFollowModal && (
        <div onClick={() => setShowFollowModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(20,19,43,0.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 22, padding: 24, width: 400, maxHeight: "78vh", overflowY: "auto", animation: "popModalT 0.3s cubic-bezier(.2,.8,.2,1)", boxShadow: "0 30px 60px rgba(20,19,43,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setFollowTab("followers")} style={{ padding: "7px 16px", borderRadius: 20, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", background: followTab === "followers" ? "linear-gradient(135deg,#6D4AFF,#8B5CF6)" : "rgba(20,19,43,0.05)", color: followTab === "followers" ? "#fff" : "rgba(20,19,43,0.6)" }}>
                  Followers ({followers.length})
                </button>
                <button onClick={() => setFollowTab("following")} style={{ padding: "7px 16px", borderRadius: 20, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", background: followTab === "following" ? "linear-gradient(135deg,#6D4AFF,#8B5CF6)" : "rgba(20,19,43,0.05)", color: followTab === "following" ? "#fff" : "rgba(20,19,43,0.6)" }}>
                  Following ({following.length})
                </button>
              </div>
              <button onClick={() => setShowFollowModal(false)} style={{ background: "rgba(20,19,43,0.05)", border: "none", borderRadius: 8, width: 28, height: 28, cursor: "pointer", flexShrink: 0 }}>✕</button>
            </div>

            {followLoading ? (
              <p style={{ textAlign: "center", padding: 30, color: "rgba(20,19,43,0.4)", fontSize: 13 }}>Loading...</p>
            ) : (followTab === "followers" ? followers : following).length === 0 ? (
              <p style={{ textAlign: "center", padding: 30, color: "rgba(20,19,43,0.4)", fontSize: 13 }}>{followTab === "followers" ? "No followers yet." : "Not following anyone yet."}</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(followTab === "followers" ? followers : following).map((u: any) => (
                  <div key={u.id} onClick={() => setViewingUsername(u.username)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, background: "#F6F5FB", cursor: "pointer" }}>
                    {u.image ? (
                      <img src={u.image} alt={u.name} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                        {u.name[0]?.toUpperCase()}
                      </div>
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: "#14132B" }}>{u.name}</div>
                      <div style={{ fontSize: 12, color: "rgba(20,19,43,0.45)" }}>@{u.username}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {viewingUsername && <ProfileModal username={viewingUsername} onClose={() => setViewingUsername(null)} />}

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
                        <p style={{ fontSize: 12, color: "rgba(20,19,43,0.5)" }}>{w.position === 1 ? "1st" : w.position === 2 ? "2nd" : "3rd"} place · {new Date(w.announcedAt).toLocaleDateString()}</p>
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

      {/* Submissions modal */}
      {showSubsModal && (
        <div onClick={() => setShowSubsModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(20,19,43,0.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 22, padding: 26, width: 460, maxHeight: "80vh", overflowY: "auto", animation: "popModalT 0.3s cubic-bezier(.2,.8,.2,1)", boxShadow: "0 30px 60px rgba(20,19,43,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, color: "#14132B" }}>
                {activeAchievement?.icon && <img src={activeAchievement.icon} alt="" style={{ width: 24, height: 24, borderRadius: "50%", display: "inline-block", marginRight: 8, verticalAlign: "middle" }} />}
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

            {/* Connect modal */}
      {showConnectModal && (
        <div onClick={() => setShowConnectModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(20,19,43,0.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 22, padding: 28, width: 420, boxShadow: "0 30px 60px rgba(20,19,43,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, color: "#14132B" }}>🔌 Connect Socials</h2>
              <button onClick={() => setShowConnectModal(false)} style={{ background: "rgba(20,19,43,0.05)", border: "none", borderRadius: 8, width: 28, height: 28, cursor: "pointer" }}>✕</button>
            </div>

















            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(20,19,43,0.5)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.7 5.38-5.27 5.67.42.36.78 1.07.78 2.16 0 1.56-.01 2.82-.01 3.2 0 .3.2.66.79.55A10.52 10.52 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5Z"/></svg>
                GitHub
              </label>
              {githubUrl ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F6F5FB", borderRadius: 10, padding: "10px 14px" }}>
                  <a href={githubUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "#14132B", fontWeight: 600, textDecoration: "none" }}>
                    {githubUrl.replace("https://github.com/", "@")}
                  </a>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#15803D", background: "rgba(22,163,74,0.1)", padding: "3px 9px", borderRadius: 20 }}>Connected</span>
                    <button
                      type="button"
                      onClick={async () => {
                        setGithubSyncing(true);
                        await fetch("/api/profile/disconnect-github", { method: "POST" });
                        setGithubUrl("");
                        setGithubSyncing(false);
                        router.refresh();
                      }}
                      disabled={githubSyncing}
                      style={{ fontSize: 11, fontWeight: 700, color: "#DC2626", background: "rgba(220,38,38,0.08)", border: "none", padding: "3px 9px", borderRadius: 20, cursor: "pointer" }}
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => authClient.linkSocial({ provider: "github", callbackURL: `${window.location.pathname}?linked=github` })}
                  disabled={githubSyncing}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    background: "#14132B", color: "#fff", border: "none", borderRadius: 10, padding: "11px 14px",
                    fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: githubSyncing ? 0.6 : 1,
                  }}
                >
                  {githubSyncing ? "Connecting..." : "Connect GitHub"}
                </button>
              )}
            </div>

                       <div style={{ marginBottom: 22 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(20,19,43,0.5)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z"/></svg>
                LinkedIn
              </label>

              {!linkedinConnected ? (
                <button
                  type="button"
                  onClick={() => authClient.linkSocial({ provider: "linkedin", callbackURL: `${window.location.pathname}?linked=linkedin` })}
                  disabled={linkedinSyncing}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    background: "#0A66C2", color: "#fff", border: "none", borderRadius: 10, padding: "11px 14px",
                    fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: linkedinSyncing ? 0.6 : 1,
                  }}
                >
                  {linkedinSyncing ? "Connecting..." : "Connect LinkedIn"}
                </button>
              ) : (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F6F5FB", borderRadius: 10, padding: "10px 14px", marginBottom: 10 }}>
                    <span style={{ fontSize: 13, color: "#14132B", fontWeight: 600 }}>LinkedIn account linked</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#15803D", background: "rgba(22,163,74,0.1)", padding: "3px 9px", borderRadius: 20 }}>Connected</span>
                      <button
                        type="button"
                        onClick={async () => {
                          setLinkedinSyncing(true);
                          await fetch("/api/profile/disconnect-linkedin", { method: "POST" });
                          setLinkedinConnected(false);
                          setLinkedinUrl("");
                          setLinkedinSyncing(false);
                          router.refresh();
                        }}
                        disabled={linkedinSyncing}
                        style={{ fontSize: 11, fontWeight: 700, color: "#DC2626", background: "rgba(220,38,38,0.08)", border: "none", padding: "3px 9px", borderRadius: 20, cursor: "pointer" }}
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(20,19,43,0.45)", marginBottom: 6, display: "block" }}>
                    Paste your public profile URL (LinkedIn doesn't share this automatically)
                  </label>
                  <input className="prof-input" style={inputStyle} value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/yourusername" />
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12 }}>
              {connectSaved && <span style={{ fontSize: 13, color: "#15803D", fontWeight: 700 }}>✓ Saved</span>}
              <button className="btn-anim" onClick={saveConnections} disabled={connectSaving} style={{ background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)", color: "#fff", border: "none", borderRadius: 12, padding: "11px 24px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", opacity: connectSaving ? 0.6 : 1 }}>
                {connectSaving ? "Saving..." : "Save"}
              </button>
            </div>
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
                  width: 76, height: 76, borderRadius: "50%",
                  background: avatar ? "transparent" : "linear-gradient(135deg,#6D4AFF,#8B5CF6)",
                  margin: "0 auto 8px", display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 28, fontWeight: 700, overflow: "hidden", border: "3px solid #F6F5FB",
                }}
              >
                {avatar ? <img src={avatar} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : user.name[0]?.toUpperCase()}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
              <span onClick={() => fileRef.current?.click()} style={{ fontSize: 12, color: "#6D4AFF", fontWeight: 600, cursor: "pointer" }}>Change Photo</span>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(20,19,43,0.5)", marginBottom: 8, display: "block" }}>Name</label>
              <input className="prof-input" style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(20,19,43,0.5)", marginBottom: 8, display: "block" }}>Username</label>
              <input className="prof-input" style={inputStyle} value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} placeholder="username" />
              <p style={{ fontSize: 11, color: "rgba(20,19,43,0.4)", marginTop: 5 }}>Letters, numbers, underscore only. Must be unique.</p>
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

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(20,19,43,0.5)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.7 5.38-5.27 5.67.42.36.78 1.07.78 2.16 0 1.56-.01 2.82-.01 3.2 0 .3.2.66.79.55A10.52 10.52 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5Z"/></svg>
                GitHub
              </label>
              {githubUrl ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F6F5FB", borderRadius: 10, padding: "10px 14px" }}>
                  <a href={githubUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "#14132B", fontWeight: 600, textDecoration: "none" }}>
                    {githubUrl.replace("https://github.com/", "@")}
                  </a>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#15803D", background: "rgba(22,163,74,0.1)", padding: "3px 9px", borderRadius: 20 }}>Connected</span>
                    <button
                      type="button"
                      onClick={async () => {
                        setGithubSyncing(true);
                        await fetch("/api/profile/disconnect-github", { method: "POST" });
                        setGithubUrl("");
                        setGithubSyncing(false);
                        router.refresh();
                      }}
                      disabled={githubSyncing}
                      style={{ fontSize: 11, fontWeight: 700, color: "#DC2626", background: "rgba(220,38,38,0.08)", border: "none", padding: "3px 9px", borderRadius: 20, cursor: "pointer" }}
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => authClient.linkSocial({ provider: "github", callbackURL: `${window.location.pathname}?linked=github` })}
                  disabled={githubSyncing}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    background: "#14132B", color: "#fff", border: "none", borderRadius: 10, padding: "11px 14px",
                    fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: githubSyncing ? 0.6 : 1,
                  }}
                >
                  {githubSyncing ? "Connecting..." : "Connect GitHub"}
                </button>
              )}
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(20,19,43,0.5)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z"/></svg>
                LinkedIn
              </label>
              {!linkedinConnected ? (
                <button
                  type="button"
                  onClick={() => authClient.linkSocial({ provider: "linkedin", callbackURL: `${window.location.pathname}?linked=linkedin` })}
                  disabled={linkedinSyncing}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    background: "#0A66C2", color: "#fff", border: "none", borderRadius: 10, padding: "11px 14px",
                    fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: linkedinSyncing ? 0.6 : 1,
                  }}
                >
                  {linkedinSyncing ? "Connecting..." : "Connect LinkedIn"}
                </button>
              ) : (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F6F5FB", borderRadius: 10, padding: "10px 14px", marginBottom: 10 }}>
                    <span style={{ fontSize: 13, color: "#14132B", fontWeight: 600 }}>LinkedIn account linked</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#15803D", background: "rgba(22,163,74,0.1)", padding: "3px 9px", borderRadius: 20 }}>Connected</span>
                      <button
                        type="button"
                        onClick={async () => {
                          setLinkedinSyncing(true);
                          await fetch("/api/profile/disconnect-linkedin", { method: "POST" });
                          setLinkedinConnected(false);
                          setLinkedinUrl("");
                          setLinkedinSyncing(false);
                          router.refresh();
                        }}
                        disabled={linkedinSyncing}
                        style={{ fontSize: 11, fontWeight: 700, color: "#DC2626", background: "rgba(220,38,38,0.08)", border: "none", padding: "3px 9px", borderRadius: 20, cursor: "pointer" }}
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(20,19,43,0.45)", marginBottom: 6, display: "block" }}>
                    Paste your public profile URL (LinkedIn doesn't share this automatically)
                  </label>
                  <input className="prof-input" style={inputStyle} value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/yourusername" />
                </div>
              )}
            </div>

            {role === "STUDENT" && (
              <>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(20,19,43,0.5)", marginBottom: 8, display: "block" }}>Education</label>
                                   <input className="prof-input" style={inputStyle} value={education} onChange={(e) => setEducation(e.target.value)} placeholder="e.g. BCA, BSc.CSIT, BIT, BE Computer, 4th Semester" />
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
              <button className="btn-anim" onClick={save} disabled={saving} style={{ background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)", color: "#fff", border: "none", borderRadius: 12, padding: "12px 26px", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MoneyStatCard({ icon, label, value, tone, grad }: { icon: string; label: string; value: number; tone: string; grad: string }) {
  const [displayVal, setDisplayVal] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const duration = 900;
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
    <div
      className="profile-stat-card"
      style={{
        background: grad,
        borderRadius: 18,
        padding: "18px 16px",
        border: "1px solid rgba(255,255,255,0.5)",
        boxShadow: "0 4px 16px rgba(20,19,43,0.06)",
        transformStyle: "preserve-3d",
      }}
      onMouseMove={(e) => {
        const el = e.currentTarget;
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const rx = (0.5 - py) * 32;
        const ry = (px - 0.5) * 32;
        el.style.transform = `perspective(500px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.08) translateY(-14px)`;
        el.style.boxShadow = `0 36px 60px ${tone}44`;
        el.style.zIndex = "10";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.transform = "perspective(500px) rotateX(0deg) rotateY(0deg) scale(1) translateY(0)";
        el.style.boxShadow = "0 4px 16px rgba(20,19,43,0.06)";
        el.style.zIndex = "1";
      }}
    >
      <div className="profile-stat-shine" />
      <div style={{ position: "absolute", top: -20, right: -20, width: 70, height: 70, borderRadius: "50%", background: `${tone}22`, filter: "blur(2px)" }} />
      <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.85)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, marginBottom: 12, position: "relative", boxShadow: `0 3px 10px ${tone}33` }}>
        {icon}
      </div>
      <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: tone, position: "relative", fontVariantNumeric: "tabular-nums" }}>
        Rs. {displayVal.toLocaleString()}
      </div>
      <div style={{ fontSize: 11.5, color: "rgba(20,19,43,0.55)", fontWeight: 700, marginTop: 3, position: "relative" }}>{label}</div>
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
    <div
      className="profile-stat-card"
      style={{
        background: grad,
        borderRadius: 18,
        padding: "18px 16px",
        border: "1px solid rgba(255,255,255,0.5)",
        boxShadow: "0 4px 16px rgba(20,19,43,0.06)",
        transformStyle: "preserve-3d",
      }}
      onMouseMove={(e) => {
        const el = e.currentTarget;
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const rx = (0.5 - py) * 32;
        const ry = (px - 0.5) * 32;
        el.style.transform = `perspective(500px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.08) translateY(-14px)`;
        el.style.boxShadow = `0 36px 60px ${tone}44`;
        el.style.zIndex = "10";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.transform = "perspective(500px) rotateX(0deg) rotateY(0deg) scale(1) translateY(0)";
        el.style.boxShadow = "0 4px 16px rgba(20,19,43,0.06)";
        el.style.zIndex = "1";
      }}
    >
      <div className="profile-stat-shine" />
      <div style={{ position: "absolute", top: -20, right: -20, width: 70, height: 70, borderRadius: "50%", background: `${tone}22`, filter: "blur(2px)" }} />
      <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.85)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, marginBottom: 12, position: "relative", boxShadow: `0 3px 10px ${tone}33` }}>
        {icon}
      </div>
      <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 800, color: tone, position: "relative", fontVariantNumeric: "tabular-nums" }}>{displayVal}</div>
      <div style={{ fontSize: 11.5, color: "rgba(20,19,43,0.55)", fontWeight: 700, marginTop: 3, position: "relative" }}>{label}</div>
    </div>
  );
}
