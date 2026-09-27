"use client";
import { useState, useEffect, useRef } from "react";
import { FollowButton } from "./FriendButton";
function Avatar({ src, name, size, fontSize, className, style }: { src?: string | null; name: string; size: number; fontSize: number; className?: string; style?: React.CSSProperties }) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: showImage ? undefined : "linear-gradient(135deg,#6D4AFF,#8B5CF6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Sora', sans-serif",
        fontSize,
        fontWeight: 700,
        color: "#fff",
        overflow: "hidden",
        flexShrink: 0,
        ...style,
      }}
    >
      {showImage ? (
        <img src={src} onError={() => setFailed(true)} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        name[0]?.toUpperCase()
      )}
    </div>
  );
}

const SKILL_COLORS = [
  { bg: "#EDE9FE", text: "#5B21B6" },
  { bg: "#DBEAFE", text: "#1E40AF" },
  { bg: "#FCE7F3", text: "#9D174D" },
  { bg: "#D1FAE5", text: "#065F46" },
  { bg: "#FEF3C7", text: "#92400E" },
];

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

function useCountUp(value: number, active: boolean) {
  const [display, setDisplay] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (!active || started.current) return;
    started.current = true;
    const duration = 600;
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [value, active]);
  return display;
}

export default function ProfileModal({ username, onClose }: { username: string; onClose: () => void }) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${username}`)
      .then((r) => r.json())
      .then((d) => {
        setProfile(d);
        setLoading(false);
      });
  }, [username]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,19,43,0.5)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        animation: "fadeBgP 0.25s ease",
        padding: 20,
      }}
    >
      <style>{`
                @keyframes fadeBgP { from { opacity:0 } to { opacity:1 } }
        @keyframes popModalP { from { opacity:0; transform: scale(0.92) translateY(14px); } to { opacity:1; transform: scale(1) translateY(0); } }
        @keyframes pmHueMove { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes pmDrift1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-3%,2%) scale(1.05); } }
               @keyframes pmDrift2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(3%,-2%) scale(1.04); } }
        @keyframes pmParticle { 0% { transform: translateY(0); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(-130px); opacity: 0; } }
        @keyframes riseInP { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
        @keyframes chipIn { from { opacity:0; transform: scale(0.8); } to { opacity:1; transform: scale(1); } }
        @keyframes sheenSweepP { 0% { transform: translateX(-160%) rotate(10deg); } 100% { transform: translateX(260%) rotate(10deg); } }
        @keyframes badgePopP { from { opacity:0; transform: scale(0.8) translateY(8px); } to { opacity:1; transform: scale(1) translateY(0); } }
        .p-rise { animation: riseInP 0.4s cubic-bezier(.2,.8,.2,1) both; }
        .p-chip { animation: chipIn 0.3s cubic-bezier(.34,1.56,.64,1) both; transition: transform 0.15s ease, background 0.15s ease; }
        .p-chip:hover { transform: translateY(-2px); background: rgba(109,74,255,0.1) !important; color: #6D4AFF !important; }
        .p-stat { transition: transform 0.2s ease; }
        .p-stat:hover { transform: translateY(-3px); }
        .p-sheen { position: absolute; top: -60%; left: 0; width: 35%; height: 220%; background: linear-gradient(100deg, transparent, rgba(255,255,255,0.18), transparent); animation: sheenSweepP 6s ease-in-out infinite; pointer-events: none; }
        .p-badge { animation: badgePopP 0.4s cubic-bezier(.34,1.56,.64,1) both; transition: transform 0.2s cubic-bezier(.34,1.56,.64,1); }
        .p-badge:hover { transform: translateY(-3px); }
      `}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 24,
          width: 420,
          maxHeight: "88vh",
          overflowY: "auto",
          animation: "popModalP 0.35s cubic-bezier(.2,.8,.2,1)",
          boxShadow: "0 30px 70px rgba(20,19,43,0.3)",
          position: "relative",
        }}
      >
        {loading || !profile ? (
          <div style={{ padding: 70, textAlign: "center", color: "rgba(20,19,43,0.4)", fontSize: 14 }}>Loading profile...</div>
        ) : profile.error ? (
          <div style={{ padding: 50, textAlign: "center" }}>
            <p style={{ color: "rgba(20,19,43,0.5)", fontSize: 14, marginBottom: 16 }}>User not found.</p>
            <button onClick={onClose} style={{ background: "#14132B", color: "#fff", border: "none", borderRadius: 10, padding: "9px 18px", cursor: "pointer", fontSize: 13 }}>
              Close
            </button>
          </div>
        ) : profile.status && profile.status !== "ACTIVE" ? (
          <div style={{ padding: 50, textAlign: "center" }}>
            <div style={{ fontSize: 34, marginBottom: 12, opacity: 0.5 }}>🚫</div>
            <p style={{ color: "rgba(20,19,43,0.6)", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
              {profile.status === "SUSPENDED" ? "This account is on hold" : "This account has been deleted"}
            </p>
            <p style={{ color: "rgba(20,19,43,0.4)", fontSize: 12.5, marginBottom: 16 }}>Profile is no longer available.</p>
            <button onClick={onClose} style={{ background: "#14132B", color: "#fff", border: "none", borderRadius: 10, padding: "9px 18px", cursor: "pointer", fontSize: 13 }}>
              Close
            </button>
          </div>
        ) : (
          <ProfileContent profile={profile} onClose={onClose} />
        )}
      </div>
    </div>
  );
}

export function ProfileContent({ profile, onClose, fullPage = false }: { profile: any; onClose?: () => void; fullPage?: boolean }) {
  const isOrganizer = profile.role === "ORGANIZER";
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followTab, setFollowTab] = useState<"followers" | "following">("followers");
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [followLoading, setFollowLoading] = useState(false);
  const [viewingUsername, setViewingUsername] = useState<string | null>(null);

  async function openFollowModal(tab: "followers" | "following") {
    setFollowTab(tab);
    setShowFollowModal(true);
    setFollowLoading(true);
    const res = await fetch(`/api/users/${profile.username}/follow-list`);
    const data = await res.json();
    setFollowers(data.followers || []);
    setFollowing(data.following || []);
    setFollowLoading(false);
  }
  const stat1 = useCountUp(isOrganizer ? profile.stats.challengesCreated : profile.stats.challengesJoined, true);
  const stat2 = useCountUp(isOrganizer ? profile.stats.submissionsReceived : profile.stats.submissionsCount, true);
  const stat3 = useCountUp(isOrganizer ? profile.stats.winnersAnnounced : profile.stats.winsCount, true);

  function getPositionCount(position: number) {
    if (position === 1) return profile.stats.firstPlaceCount || 0;
    if (position === 2) return profile.stats.secondPlaceCount || 0;
    return profile.stats.thirdPlaceCount || 0;
  }

   const earnedSet = new Set(
    ACHIEVEMENTS.filter((a) => {
      if (a.type === "position") return getPositionCount(a.position!) >= a.threshold;
      return (profile.stats.submissionsCount || 0) >= a.threshold;
    }).map((a) => a.title)
  );

  return (
    <>
      {!fullPage && onClose && (
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "rgba(255,255,255,0.2)",
            border: "none",
            borderRadius: 8,
            width: 28,
            height: 28,
            cursor: "pointer",
            color: "#fff",
            fontSize: 14,
            zIndex: 2,
          }}
        >
          ✕
        </button>
      )}

                                {/* Hero banner - matches profile page style */}
           <div style={{ position: "relative", overflow: "hidden", background: "linear-gradient(135deg,#F5F3FF,#EDE9FE)", borderRadius: "24px 24px 0 0", paddingBottom: 26 }}>
        <div style={{ position: "absolute", top: -40, left: "10%", width: 220, height: 220, borderRadius: "50%", background: "rgba(109,74,255,0.35)", filter: "blur(50px)", animation: "pmDrift1 10s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: -20, right: "15%", width: 180, height: 180, borderRadius: "50%", background: "rgba(236,72,153,0.25)", filter: "blur(60px)", animation: "pmDrift2 12s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: -60, left: "40%", width: 200, height: 200, borderRadius: "50%", background: "rgba(139,92,246,0.3)", filter: "blur(50px)", animation: "pmDrift1 13s ease-in-out infinite", animationDelay: "1s" }} />
        <div style={{ position: "relative", textAlign: "center", paddingTop: 34 }}>
          


<Avatar
          src={profile.image}
          name={profile.name}
          size={90}
          fontSize={36}
          className="p-rise"
          style={{ margin: "0 auto 16px", animation: "riseInP 0.4s cubic-bezier(.2,.8,.2,1) both, ringPulse 2.4s ease-in-out 0.4s infinite" }}
        />


          <p className="p-rise" style={{ animationDelay: "0.05s", fontFamily: "'Sora', sans-serif", fontSize: 19, fontWeight: 700, color: "#14132B", marginBottom: 2 }}>
            {profile.name}
          </p>
          <p className="p-rise" style={{ animationDelay: "0.1s", fontSize: 13, color: "rgba(20,19,43,0.5)", marginBottom: 12 }}>
            @{profile.username}
          </p>

                    <div className="p-rise" style={{ animationDelay: "0.15s", display: "flex", justifyContent: "center", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.5, padding: "5px 13px", borderRadius: 20, background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)", color: "#fff" }}>
              {profile.role}
            </span>
                       {profile.isVerified && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "5px 13px",
                  borderRadius: 20,
                  background: "rgba(217,119,6,0.1)",
                  color: "#B45309",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                ✓ Verified
              </span>
            )}
            {profile.isMutualFollow && !profile.isOwner && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "5px 13px",
                  borderRadius: 20,
                  background: "rgba(22,163,74,0.1)",
                  color: "#15803D",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                🤝 Friends
              </span>
            )}
          </div>

                                                         {!profile.isOwner && (
            <div className="p-rise" style={{ animationDelay: "0.18s", marginTop: 14, display: "flex", gap: 8, justifyContent: "center" }}>
                           <FollowButton targetUserId={profile.id} initialIsFollowing={profile.followStatus?.isFollowing || false} followsYou={profile.followStatus?.followsYou || false} />
            </div>
          )}
        </div>
      </div>

      <style>{`
        .p-name-dark { color: #14132B !important; }
      `}</style>

      <div style={{ padding: "24px 26px 28px" }}>
        {profile.orgName && (
          <p className="p-rise" style={{ animationDelay: "0.2s", fontSize: 13.5, color: "#14132B", marginBottom: 10, fontWeight: 700, textAlign: "center" }}>
            {profile.orgName}
          </p>
        )}

        {profile.bio && (
          <p className="p-rise" style={{ animationDelay: "0.22s", fontSize: 13.5, color: "rgba(20,19,43,0.6)", lineHeight: 1.6, marginBottom: 14, textAlign: "center" }}>
            {profile.bio}
          </p>
        )}

               {profile.education && (
          <p className="p-rise" style={{ animationDelay: "0.24s", fontSize: 12.5, color: "rgba(20,19,43,0.5)", marginBottom: 14, textAlign: "center" }}>
            🎓 {profile.education}
          </p>
        )}

        {(profile.githubUrl || profile.linkedinUrl) && (
          <div className="p-rise" style={{ animationDelay: "0.25s", display: "flex", justifyContent: "center", gap: 10, marginBottom: 16 }}>
            {profile.githubUrl && (
              
              <a href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub"
                style={{
                  width: 36, height: 36, borderRadius: 10, background: "#14132B", display: "flex",
                  alignItems: "center", justifyContent: "center", color: "#fff", textDecoration: "none",
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.7 5.38-5.27 5.67.42.36.78 1.07.78 2.16 0 1.56-.01 2.82-.01 3.2 0 .3.2.66.79.55A10.52 10.52 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5Z"/>
                </svg>
              </a>
            )}
            {profile.linkedinUrl && (
              
               <a href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn"
                style={{
                  width: 36, height: 36, borderRadius: 10, background: "#0A66C2", display: "flex",
                  alignItems: "center", justifyContent: "center", color: "#fff", textDecoration: "none",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z"/>
                </svg>
              </a>
            )}
          </div>
        )}


        {profile.skills?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 20 }}>
            {profile.skills.map((s: string, i: number) => {
              const c = SKILL_COLORS[i % SKILL_COLORS.length];
              return (
                <span
                  key={i}
                  className="p-chip"
                  style={{
                    animationDelay: `${0.25 + i * 0.04}s`,
                    fontSize: 11.5,
                    fontWeight: 700,
                    background: c.bg,
                    color: c.text,
                    padding: "4px 11px",
                    borderRadius: 20,
                    cursor: "default",
                  }}
                >
                  {s}
                </span>
              );
            })}
          </div>
        )}

                                                      <div className="p-rise" style={{ animationDelay: "0.3s", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 10 }}>
          <StatBox label={isOrganizer ? "Created" : "Challenges"} value={stat1} icon={isOrganizer ? "🚩" : "🎯"} />
          <StatBox label="Submissions" value={stat2} icon="📤" />
          <StatBox label={isOrganizer ? "Winners" : "Wins"} value={stat3} icon="🏆" />
        </div>

        {!isOrganizer && (profile.stats.totalWinnings ?? 0) > 0 && (
          <div
            className="p-rise"
            style={{
              animationDelay: "0.305s",
              background: "linear-gradient(135deg,#D1FAE5,#ECFDF5)",
              border: "1px solid rgba(21,128,61,0.15)",
              borderRadius: 14,
              padding: "12px 16px",
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 16 }}>💰</span>
            <span style={{ fontSize: 13, color: "rgba(20,19,43,0.5)", fontWeight: 600 }}>Total Winnings:</span>
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 800, color: "#15803D" }}>
              Rs. {(profile.stats.totalWinnings ?? 0).toLocaleString()}
            </span>
          </div>
        )}

                        <div className="p-rise" style={{ animationDelay: "0.31s", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 20 }}>
          <FollowStatBox label="Followers" value={profile.followerCount ?? 0} icon="⭐" onClick={() => openFollowModal("followers")} />
          <FollowStatBox label="Following" value={profile.followingCount ?? 0} icon="🔗" onClick={() => openFollowModal("following")} />
        </div>

        {profile.role === "STUDENT" && (
          

<div className="p-rise" style={{ animationDelay: "0.32s" }}>
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 13.5, fontWeight: 700, color: "#14132B", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
              🏅 Achievements
              <span style={{ fontSize: 11.5, fontWeight: 600, color: "rgba(20,19,43,0.4)" }}>({earnedSet.size}/{ACHIEVEMENTS.length})</span>
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
              {ACHIEVEMENTS.map((a, i) => {
                const earned = earnedSet.has(a.title);
                return (
                  <div
                    key={i}
                    className="p-badge"
                    title={a.title}
                    style={{
                      animationDelay: `${i * 0.03}s`,
                      background: earned ? "linear-gradient(160deg,#1A1626,#2A2340)" : "#F6F5FB",
                      borderRadius: 14,
                      border: earned ? `1px solid ${a.color}44` : "1px solid rgba(15,23,42,0.06)",
                      padding: "10px 6px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        margin: "0 auto 6px",
                        overflow: "hidden",
                        border: earned ? `2px solid ${a.color}66` : "1px solid rgba(15,23,42,0.08)",
                        boxShadow: earned ? `0 6px 14px ${a.color}55` : "none",
                        filter: earned ? "none" : "grayscale(1)",
                        opacity: earned ? 1 : 0.35,
                      }}
                    >
                      <img src={a.icon} alt={a.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <p style={{ fontSize: 9, fontWeight: 700, color: earned ? "#F5D98C" : "rgba(20,19,43,0.4)", lineHeight: 1.25 }}>{a.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

               <p
          className="p-rise"
          style={{ animationDelay: "0.35s", textAlign: "center", fontSize: 11.5, color: "rgba(20,19,43,0.35)", paddingTop: 14, borderTop: profile.history ? "none" : "1px solid rgba(15,23,42,0.06)", marginBottom: profile.history ? 20 : 0 }}
        >
          Joined {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>

                       {!fullPage && profile.isOwner && (
          
            <a href={`/dashboard/u/${profile.username}`}
            className="p-rise"
            style={{ animationDelay: "0.36s", display: "block", textAlign: "center", fontSize: 12.5, fontWeight: 700, color: "#6D4AFF", textDecoration: "none", paddingTop: 14, borderTop: "1px solid rgba(15,23,42,0.06)" }}
          >
            View full profile with history →
          </a>
        )}

        {profile.history?.submissions && (
          <div className="p-rise" style={{ animationDelay: "0.4s", marginTop: 20, paddingTop: 20, borderTop: "1px solid rgba(15,23,42,0.06)" }}>
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 13.5, fontWeight: 700, color: "#14132B", marginBottom: 12 }}>
              Challenge History
            </h3>
            {profile.history.submissions.length === 0 ? (
              <p style={{ fontSize: 12.5, color: "rgba(20,19,43,0.4)", textAlign: "center", padding: "16px 0" }}>No submissions yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {profile.history.submissions.map((s: any) => (
                  <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: 10, background: "#F6F5FB" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#14132B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.challenge.title}</div>
                      <div style={{ fontSize: 11, color: "rgba(20,19,43,0.4)" }}>{new Date(s.submittedAt).toLocaleDateString()}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      {s.winner && (
                        <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: "rgba(212,160,23,0.12)", color: "#B45309" }}>
                          #{s.winner.position}
                        </span>
                      )}
                      {s.review && (
                        <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: "rgba(109,74,255,0.08)", color: "#6D4AFF" }}>
                          {s.review.score}/10
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {showFollowModal && (
          <div onClick={() => setShowFollowModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(20,19,43,0.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 20 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 22, padding: 24, width: 400, maxHeight: "78vh", overflowY: "auto", boxShadow: "0 30px 60px rgba(20,19,43,0.25)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => setFollowTab("followers")}
                    style={{
                      padding: "7px 16px", borderRadius: 20, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
                      background: followTab === "followers" ? "linear-gradient(135deg,#6D4AFF,#8B5CF6)" : "rgba(20,19,43,0.05)",
                      color: followTab === "followers" ? "#fff" : "rgba(20,19,43,0.6)",
                    }}
                  >
                    Followers ({followers.length})
                  </button>
                  <button
                    onClick={() => setFollowTab("following")}
                    style={{
                      padding: "7px 16px", borderRadius: 20, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
                      background: followTab === "following" ? "linear-gradient(135deg,#6D4AFF,#8B5CF6)" : "rgba(20,19,43,0.05)",
                      color: followTab === "following" ? "#fff" : "rgba(20,19,43,0.6)",
                    }}
                  >
                    Following ({following.length})
                  </button>
                </div>
                <button onClick={() => setShowFollowModal(false)} style={{ background: "rgba(20,19,43,0.05)", border: "none", borderRadius: 8, width: 28, height: 28, cursor: "pointer", flexShrink: 0 }}>✕</button>
              </div>

              {followLoading ? (
                <p style={{ textAlign: "center", padding: 30, color: "rgba(20,19,43,0.4)", fontSize: 13 }}>Loading...</p>
              ) : (followTab === "followers" ? followers : following).length === 0 ? (
                <p style={{ textAlign: "center", padding: 30, color: "rgba(20,19,43,0.4)", fontSize: 13 }}>
                  {followTab === "followers" ? "No followers yet." : "Not following anyone yet."}
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(followTab === "followers" ? followers : following).map((u: any) => (
                    <div
                      key={u.id}
                      onClick={() => setViewingUsername(u.username)}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, background: "#F6F5FB", cursor: "pointer" }}
                    >
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

        {profile.history?.challengesCreated && (
     
          <div className="p-rise" style={{ animationDelay: "0.4s", marginTop: 20, paddingTop: 20, borderTop: "1px solid rgba(15,23,42,0.06)" }}>
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 13.5, fontWeight: 700, color: "#14132B", marginBottom: 12 }}>
              Challenges Created
            </h3>
            {profile.history.challengesCreated.length === 0 ? (
              <p style={{ fontSize: 12.5, color: "rgba(20,19,43,0.4)", textAlign: "center", padding: "16px 0" }}>No challenges yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {profile.history.challengesCreated.map((c: any) => (
                  <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: 10, background: "#F6F5FB" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#14132B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</div>
                      <div style={{ fontSize: 11, color: "rgba(20,19,43,0.4)" }}>{c._count.submissions} submissions</div>
                    </div>
                    <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: c.status === "PUBLISHED" ? "rgba(22,163,74,0.1)" : "rgba(20,19,43,0.06)", color: c.status === "PUBLISHED" ? "#15803D" : "rgba(20,19,43,0.5)", flexShrink: 0 }}>
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-stat" style={{ flex: 1, background: "#F6F5FB", borderRadius: 14, padding: "14px 8px", textAlign: "center" }}>
      <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 700, color: "#14132B", fontVariantNumeric: "tabular-nums" }}>{value}</div>
      <div style={{ fontSize: 11, color: "rgba(20,19,43,0.45)", marginTop: 3 }}>{label}</div>
    </div>
  );
}


function FollowStatBox({ label, value, onClick }: { label: string; value: number; onClick?: () => void }) {
  return (
    <div
      className="p-stat"
      onClick={onClick}
      style={{
        flex: 1,
        background: "#F6F5FB",
        borderRadius: 14,
        padding: "14px 8px",
        textAlign: "center",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 700, color: "#14132B", fontVariantNumeric: "tabular-nums" }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: "rgba(20,19,43,0.45)", marginTop: 3 }}>{label}</div>
    </div>
  );
}