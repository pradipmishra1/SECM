"use client";

import { useState, useEffect } from "react";
import TeamChat from "./TeamChat";

export default function TeamDetailModal({ teamId, currentUserId, onClose }: { teamId: string; currentUserId: string; onClose: () => void }) {
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadTeam();
  }, [teamId]);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`)
        .then((r) => r.json())
        .then((d) => setSearchResults(d.users || []));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  function loadTeam() {
    fetch(`/api/teams/${teamId}`)
      .then((r) => r.json())
      .then((d) => {
        setTeam(d.team);
        setLoading(false);
      });
  }

  async function sendInvite(username: string) {
    setInviting(true);
    setError("");
    setSuccess("");
    const res = await fetch(`/api/teams/${teamId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    setInviting(false);
    if (!res.ok) {
      setError(data.error || "Failed to send invite");
      return;
    }
    setSuccess(`Invite sent to @${username}`);
    setSearchQuery("");
    loadTeam();
  }

  const isLeader = team?.leaderId === currentUserId;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,19,43,0.55)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 150,
        animation: "fadeBgT 0.25s ease",
        padding: 20,
      }}
    >
      <style>{`
        @keyframes fadeBgT { from { opacity:0 } to { opacity:1 } }
        @keyframes popModalT { from { opacity:0; transform: scale(0.94) translateY(10px); } to { opacity:1; transform: scale(1) translateY(0); } }
        @keyframes tdMemberIn { from { opacity:0; transform: translateX(-8px); } to { opacity:1; transform: translateX(0); } }
        @keyframes tdOrbFloat1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-8px,8px) scale(1.06); } }
        @keyframes tdOrbFloat2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(8px,-6px) scale(0.94); } }
        @keyframes tdPendingPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes tdSearchIn { from { opacity:0; transform: translateY(-4px) scale(0.98); } to { opacity:1; transform: translateY(0) scale(1); } }
        .td-scroll::-webkit-scrollbar { width: 5px; }
        .td-scroll::-webkit-scrollbar-thumb { background: rgba(15,23,42,0.12); border-radius: 10px; }
        .td-orb-1 { animation: tdOrbFloat1 6s ease-in-out infinite; }
        .td-orb-2 { animation: tdOrbFloat2 7s ease-in-out infinite; }
        .td-member-row { animation: tdMemberIn 0.3s cubic-bezier(.2,.8,.2,1) both; transition: transform 0.15s ease, box-shadow 0.2s ease; }
        .td-member-row:hover { transform: translateX(3px); box-shadow: 0 4px 12px rgba(15,23,42,0.06); }
        .td-member-avatar { transition: transform 0.2s cubic-bezier(.34,1.56,.64,1); }
        .td-member-row:hover .td-member-avatar { transform: scale(1.08) rotate(-3deg); }
        .td-pending-dot { animation: tdPendingPulse 1.6s ease infinite; }
        .td-invite-row { animation: tdSearchIn 0.2s ease both; transition: transform 0.15s ease; }
        .td-invite-row:hover { transform: translateX(2px); }
        .td-invite-btn { transition: transform 0.15s ease, box-shadow 0.2s ease; }
        .td-invite-btn:hover:not(:disabled) { transform: scale(1.05); box-shadow: 0 6px 14px rgba(109,74,255,0.35); }
        .td-search-input:focus { border-color: rgba(109,74,255,0.4) !important; box-shadow: 0 0 0 3px rgba(109,74,255,0.08); }
        .td-close-btn { transition: transform 0.15s ease, background 0.15s ease; }
        .td-close-btn:hover { transform: rotate(90deg); background: rgba(255,255,255,0.3) !important; }
        .td-left-panel::-webkit-scrollbar { width: 5px; }
        .td-left-panel::-webkit-scrollbar-thumb { background: rgba(15,23,42,0.12); border-radius: 10px; }

        @keyframes tdFloatUp1 { 0% { transform: translateY(10px) scale(0.8); opacity:0; } 20% { opacity:1; } 100% { transform: translateY(-40px) scale(1.1); opacity:0; } }
        @keyframes tdFloatUp2 { 0% { transform: translateY(14px) scale(0.7); opacity:0; } 25% { opacity:1; } 100% { transform: translateY(-46px) scale(1.05); opacity:0; } }
        @keyframes tdFloatUp3 { 0% { transform: translateY(8px) scale(0.75); opacity:0; } 15% { opacity:1; } 100% { transform: translateY(-42px) scale(1.15); opacity:0; } }
        @keyframes tdWaveMove { 0% { background-position: 0 0; } 100% { background-position: 200px 0; } }

        .td-bubble { position: absolute; font-size: 20px; bottom: 0; opacity: 0; }
        .td-bubble-1 { left: 18%; animation: tdFloatUp1 3.2s ease-in-out infinite; }
        .td-bubble-2 { left: 48%; animation: tdFloatUp2 3.8s ease-in-out 0.6s infinite; }
        .td-bubble-3 { left: 76%; animation: tdFloatUp3 3.5s ease-in-out 1.2s infinite; }

        .td-wave {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          border-radius: 3px;
          background: repeating-linear-gradient(90deg, rgba(109,74,255,0.35) 0, rgba(109,74,255,0.35) 10px, transparent 10px, transparent 20px);
          background-size: 200px 3px;
          animation: tdWaveMove 3s linear infinite;
        }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 24,
          width: 860,
          maxWidth: "95vw",
          height: "82vh",
          maxHeight: 700,
          overflow: "hidden",
          animation: "popModalT 0.3s cubic-bezier(.2,.8,.2,1)",
          boxShadow: "0 30px 60px rgba(20,19,43,0.25)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {loading || !team ? (
          <div style={{ padding: 60, textAlign: "center", margin: "auto" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 5, marginBottom: 12 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#6D4AFF", animation: `tdPendingPulse 1s ease-in-out ${i * 0.15}s infinite` }} />
              ))}
            </div>
            <p style={{ color: "rgba(20,19,43,0.4)", fontSize: 13 }}>Loading team...</p>
          </div>
        ) : (
          <>
            {/* Header banner */}
            <div style={{ background: "linear-gradient(120deg,#6D4AFF 0%,#8B5CF6 60%,#A78BFA 100%)", padding: "22px 26px", position: "relative", overflow: "hidden", flexShrink: 0 }}>
              <div className="td-orb-1" style={{ position: "absolute", top: -30, right: -10, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
              <div className="td-orb-2" style={{ position: "absolute", bottom: -20, left: 40, width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
              <button
                className="td-close-btn"
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
                }}
              >
                ✕
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 15,
                    background: "rgba(255,255,255,0.2)",
                    border: "2px solid rgba(255,255,255,0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 19,
                    fontFamily: "'Sora', sans-serif",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                    flexShrink: 0,
                  }}
                >
                  {team.name[0]?.toUpperCase()}
                </div>
                <div>
                  <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, color: "#fff" }}>{team.name}</h2>
                  <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.85)", marginTop: 3, display: "flex", alignItems: "center", gap: 5 }}>
                    🚩 {team.challenge.title}
                  </p>
                </div>
              </div>
            </div>

            {/* Two-column body */}
            <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
              {/* Left panel: members, invites, search */}
              <div className="td-left-panel" style={{ width: "42%", borderRight: "1px solid rgba(15,23,42,0.06)", overflowY: "auto", padding: "20px 22px" }}>
                {isLeader && (
                  <>
                    <SectionLabel>Invite Members</SectionLabel>
                    <div style={{ position: "relative", marginBottom: 10 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(20,19,43,0.35)" strokeWidth="2" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }}>
                        <circle cx="11" cy="11" r="6.5" />
                        <path d="m20 20-4-4" strokeLinecap="round" />
                      </svg>
                      <input
                        className="td-search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by username..."
                        style={{
                          width: "100%",
                          padding: "11px 14px 11px 34px",
                          borderRadius: 12,
                          border: "1.5px solid rgba(15,23,42,0.09)",
                          background: "#fff",
                          fontSize: 13.5,
                          outline: "none",
                          color: "#14132B",
                          boxSizing: "border-box",
                          transition: "all 0.2s ease",
                        }}
                      />
                    </div>

                    {searchResults.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                        {searchResults.map((u, i) => (
                          <div key={u.id} className="td-invite-row" style={{ animationDelay: `${i * 0.04}s`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: 10, background: "#F6F5FB" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                                {u.name[0]?.toUpperCase()}
                              </div>
                              <span style={{ fontSize: 13, color: "#14132B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {u.name} <span style={{ color: "rgba(20,19,43,0.4)" }}>@{u.username}</span>
                              </span>
                            </div>
                            <button
                              className="td-invite-btn"
                              onClick={() => sendInvite(u.username)}
                              disabled={inviting}
                              style={{
                                background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)",
                                color: "#fff",
                                border: "none",
                                borderRadius: 8,
                                padding: "6px 14px",
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: "pointer",
                                opacity: inviting ? 0.6 : 1,
                                flexShrink: 0,
                                marginLeft: 8,
                              }}
                            >
                              Invite
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {searchQuery.length >= 2 && searchResults.length === 0 && (
                      <p style={{ fontSize: 12, color: "rgba(20,19,43,0.35)", textAlign: "center", padding: "8px 0", marginBottom: 10 }}>No users found</p>
                    )}

                    {error && (
                      <div style={{ background: "rgba(255,70,70,0.06)", color: "#d32f2f", fontSize: 12.5, padding: "8px 12px", borderRadius: 10, marginBottom: 10 }}>⚠ {error}</div>
                    )}
                    {success && (
                      <div style={{ background: "rgba(22,163,74,0.08)", color: "#15803D", fontSize: 12.5, padding: "8px 12px", borderRadius: 10, marginBottom: 10 }}>✓ {success}</div>
                    )}
                  </>
                )}

                <SectionLabel>Members ({team.members.length})</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                  {team.members.map((m: any, i: number) => (
                    <div key={m.id} className="td-member-row" style={{ animationDelay: `${i * 0.05}s`, display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 12, background: "#F6F5FB" }}>
                      <div
                        className="td-member-avatar"
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          fontWeight: 700,
                          flexShrink: 0,
                          boxShadow: "0 3px 8px rgba(109,74,255,0.3)",
                        }}
                      >
                        {m.user.name[0]?.toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#14132B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.user.name}</div>
                        <div style={{ fontSize: 11.5, color: "rgba(20,19,43,0.4)" }}>@{m.user.username}</div>
                      </div>
                      {m.role === "LEADER" && (
                        <span style={{ fontSize: 10, fontWeight: 700, background: "linear-gradient(135deg,#FEF3C7,#FDE68A)", color: "#92400E", padding: "4px 8px", borderRadius: 20, flexShrink: 0, boxShadow: "0 2px 6px rgba(217,119,6,0.15)" }}>
                          👑
                        </span>
                      )}
                    </div>
                  ))}
                </div>




{team.invites?.length > 0 && (
                  <>
                    <SectionLabel>Pending Invites</SectionLabel>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                      {team.invites.map((inv: any, i: number) => (
                        <div
                          key={inv.id}
                          className="td-invite-row"
                          style={{ animationDelay: `${i * 0.04}s`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderRadius: 12, background: "rgba(217,119,6,0.06)", border: "1px solid rgba(217,119,6,0.12)" }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                            <div className="td-pending-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#D97706", flexShrink: 0 }} />
                            <span style={{ fontSize: 13, color: "rgba(20,19,43,0.65)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>@{inv.invitedUser.username}</span>
                          </div>
                          <span style={{ fontSize: 10.5, fontWeight: 700, color: "#B45309", background: "rgba(217,119,6,0.1)", padding: "3px 9px", borderRadius: 20, flexShrink: 0, marginLeft: 6 }}>
                            Pending
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "#FBFAFF" }}>
                <div style={{ padding: "16px 20px 6px", flexShrink: 0, position: "relative", overflow: "hidden" }}>
                  <SectionLabel>💬 Team Chat</SectionLabel>
                  <div className="td-chat-deco" style={{ position: "relative", height: 46, marginTop: 4 }}>
                    <div className="td-bubble td-bubble-1">💬</div>
                    <div className="td-bubble td-bubble-2">✨</div>
                    <div className="td-bubble td-bubble-3">💭</div>
                    <div className="td-wave" />
                  </div>
                </div>
                <div style={{ flex: 1, minHeight: 0, overflow: "hidden", padding: "0 20px 20px" }}>
                  <TeamChat teamId={teamId} currentUserId={currentUserId} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h4 style={{ fontSize: 11.5, fontWeight: 700, color: "rgba(20,19,43,0.45)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 3, height: 12, borderRadius: 2, background: "linear-gradient(180deg,#6D4AFF,#8B5CF6)", display: "inline-block" }} />
      {children}
    </h4>
  );
}