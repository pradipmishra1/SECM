"use client";

import { useRouter } from "next/navigation";
import TiltCard from "./TiltCard";
import AvatarStack from "./AvatarStack";
import { Icon } from "./icons";
import { useState } from "react";
import TeamDetailModal from "./TeamDetailModal";

const TEAM_THEMES = [
  { bg: "linear-gradient(135deg, #FFF0F0 0%, #FFDCE0 100%)", blob: "rgba(239,68,68,0.15)", accent: "#DC2626", chip: "#DC2626" },
  { bg: "linear-gradient(135deg, #F0EDFF 0%, #E6E0FF 100%)", blob: "rgba(109,74,255,0.18)", accent: "#6D4AFF", chip: "#6D4AFF" },
  { bg: "linear-gradient(135deg, #E8F9F1 0%, #D3F3E3 100%)", blob: "rgba(22,163,74,0.16)", accent: "#15803D", chip: "#15803D" },
  { bg: "linear-gradient(135deg, #FFF7E8 0%, #FFEFD1 100%)", blob: "rgba(245,158,11,0.18)", accent: "#D97706", chip: "#D97706" },
  { bg: "linear-gradient(135deg, #E9F3FF 0%, #D6E9FF 100%)", blob: "rgba(37,99,235,0.16)", accent: "#2563EB", chip: "#2563EB" },
  { bg: "linear-gradient(135deg, #FDF0FF 0%, #F7DFFF 100%)", blob: "rgba(192,38,211,0.16)", accent: "#A21CAF", chip: "#A21CAF" },
  { bg: "linear-gradient(135deg, #FFF0F5 0%, #FFDCEB 100%)", blob: "rgba(236,72,153,0.16)", accent: "#DB2777", chip: "#DB2777" },
  { bg: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)", blob: "rgba(5,150,105,0.16)", accent: "#047857", chip: "#047857" },
];

function getTeamTheme(teamId: string) {
  let hash = 0;
  for (let i = 0; i < teamId.length; i++) {
    hash = (hash * 31 + teamId.charCodeAt(i)) >>> 0;
  }
  return TEAM_THEMES[hash % TEAM_THEMES.length];
}

export default function TeamsGrid({ teams, userId, invites }: { teams: any[]; userId: string; invites: any[] }) {
  const router = useRouter();
const [openTeamId, setOpenTeamId] = useState<string | null>(null);
  async function respondInvite(inviteId: string, accept: boolean) {
    await fetch(`/api/team-invites/${inviteId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accept }),
    });
    router.refresh();
  }

  return (
    <div>
      <style>{`
        @keyframes teamRiseIn { from { opacity:0; transform: translateY(14px) scale(0.98); } to { opacity:1; transform: translateY(0) scale(1); } }
      .team-anim { animation: teamRiseIn 0.45s cubic-bezier(.2,.8,.2,1) both; transition: transform 0.2s ease; }
        .team-anim:hover { transform: translateY(-3px); }
        .create-tile { transition: transform 0.25s cubic-bezier(.2,.8,.2,1), background 0.25s ease, border-color 0.25s ease; }
        .create-tile:hover { transform: translateY(-3px); background: rgba(109,74,255,0.04); border-color: rgba(109,74,255,0.5) !important; }
        .create-tile:hover .create-plus { transform: rotate(90deg) scale(1.1); }
        .create-plus { transition: transform 0.3s cubic-bezier(.34,1.56,.64,1); }
        .invite-anim { animation: teamRiseIn 0.35s cubic-bezier(.2,.8,.2,1) both; }
        .accept-btn, .reject-btn { transition: transform 0.15s ease; }
        .accept-btn:hover, .reject-btn:hover { transform: translateY(-1px); }
      `}</style>

      {invites.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "#14132B", marginBottom: 12 }}>
            Team Requests
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {invites.map((inv, i) => (
              <div
                key={inv.id}
                className="invite-anim"
                style={{
                  animationDelay: `${i * 0.05}s`,
                  background: "#fff",
                  borderRadius: 14,
                  border: "1px solid rgba(109,74,255,0.15)",
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    {inv.team.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: "#14132B" }}>
                      <strong>{inv.invitedBy.name}</strong> invited you to <strong>{inv.team.name}</strong>
                    </p>
                    <p style={{ fontSize: 12, color: "rgba(20,19,43,0.45)" }}>{inv.team.challenge.title}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="reject-btn"
                    onClick={() => respondInvite(inv.id, false)}
                    style={{ background: "rgba(20,19,43,0.05)", color: "rgba(20,19,43,0.6)", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}
                  >
                    Decline
                  </button>
                  <button
                    className="accept-btn"
                    onClick={() => respondInvite(inv.id, true)}
                    style={{ background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)", color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 }}>
        {teams.map((t, i) => {
          const isLeader = t.leaderId === userId;
          const theme = getTeamTheme(t.id);
          return (
            <div
              key={t.id}
              className="team-anim"
              style={{ animationDelay: `${i * 0.06}s`, cursor: "pointer" }}
              onClick={() => setOpenTeamId(t.id)}
            >


<TiltCard
                intensity={3}
                glow={theme.blob}
                style={{
                  background: theme.bg,
                  borderRadius: 20,
                  border: "1px solid rgba(15,23,42,0.05)",
                  boxShadow: "0 8px 26px rgba(20,19,43,0.08)",
                  overflow: "hidden",
                  height: "100%",
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                }}
              >
                {/* Decorative blobs */}
                <div
                  style={{
                    position: "absolute",
                    top: -30,
                    right: -30,
                    width: 110,
                    height: 110,
                    borderRadius: "50%",
                    background: theme.blob,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: -40,
                    left: -20,
                    width: 90,
                    height: 90,
                    borderRadius: "50%",
                    background: theme.blob,
                    opacity: 0.6,
                  }}
                />

                <div style={{ padding: 22, display: "flex", flexDirection: "column", flex: 1, position: "relative" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 14,
                        background: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: theme.accent,
                        fontFamily: "'Sora', sans-serif",
                        fontWeight: 800,
                        fontSize: 18,
                        boxShadow: "0 6px 16px rgba(20,19,43,0.12)",
                        flexShrink: 0,
                      }}
                    >
                      {t.name[0]?.toUpperCase()}
                    </div>
                    {isLeader && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          background: "#fff",
                          color: theme.accent,
                          padding: "6px 13px",
                          borderRadius: 20,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          boxShadow: "0 4px 10px rgba(20,19,43,0.12)",
                        }}
                      >
                        👑 Leader
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 800, color: "#14132B", marginBottom: 14, letterSpacing: -0.3 }}>
                    {t.name}
                  </h3>

                  <div style={{ marginBottom: "auto", paddingBottom: 18 }}>
                                       <AvatarStack members={t.members.map((m: any) => ({ name: m.user?.name || m.name || "?", image: m.user?.image }))} max={5} />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      paddingTop: 14,
                      borderTop: `1px solid ${theme.blob}`,
                      fontSize: 12.5,
                      color: "rgba(20,19,43,0.55)",
                      fontWeight: 600,
                    }}
                  >
                    <span style={{ width: 22, height: 22, borderRadius: 7, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon.flag width={11} height={11} style={{ color: theme.accent }} />
                    </span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.challenge.title}</span>
                  </div>
                </div>
              </TiltCard>
            </div>
          );
        })}

        <div
          className="team-anim create-tile"
          style={{
            animationDelay: `${teams.length * 0.06}s`,
            border: "2px dashed rgba(109,74,255,0.3)",
            borderRadius: 18,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            cursor: "pointer",
            color: "#6D4AFF",
            minHeight: 160,
          }}
        onClick={() => router.push("/dashboard/my-challenges")}
        >
          <div
            className="create-plus"
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              marginBottom: 10,
              boxShadow: "0 8px 20px rgba(109,74,255,0.25)",
            }}
          >
            +
          </div>
          <span style={{ fontSize: 13.5, fontWeight: 700 }}>Create New Team</span>
          <span style={{ fontSize: 11.5, color: "rgba(20,19,43,0.4)", marginTop: 4 }}>Pick a challenge to team up on</span>
        </div>
      </div>

      {teams.length === 0 && (
        <p style={{ fontSize: 13, color: "rgba(20,19,43,0.4)", marginTop: 16, textAlign: "center" }}>
          You're not part of any teams yet — join a challenge and form one!
        </p>
      )}
{openTeamId && <TeamDetailModal teamId={openTeamId} currentUserId={userId} onClose={() => setOpenTeamId(null)} />}
    </div>
  );
}