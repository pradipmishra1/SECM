"use client";

import { useState, useEffect } from "react";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

function LbAvatar({ image, name, size, fontSize, style, className }: { image?: string | null; name: string; size: number; fontSize: number; style?: React.CSSProperties; className?: string }) {
  const [failed, setFailed] = useState(false);
  const showImage = image && !failed;
  return (
    <div className={className} style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize, flexShrink: 0, ...style }}>
      {showImage ? (
        <img src={image} alt={name} onError={() => setFailed(true)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        initials(name)
      )}
    </div>
  );
}

const RANK_THEME = [
  { border: "#EAB308", text: "#92400E", bg: "linear-gradient(180deg, rgba(234,179,8,0.22), rgba(234,179,8,0.03))", avatarBg: "linear-gradient(135deg,#FDE047,#CA8A04)" }, // 1st gold
  { border: "#64748B", text: "#334155", bg: "linear-gradient(180deg, rgba(100,116,139,0.22), rgba(100,116,139,0.03))", avatarBg: "linear-gradient(135deg,#CBD5E1,#475569)" }, // 2nd silver
  { border: "#EA580C", text: "#7C2D12", bg: "linear-gradient(180deg, rgba(234,88,12,0.22), rgba(234,88,12,0.03))", avatarBg: "linear-gradient(135deg,#FB923C,#9A3412)" }, // 3rd bronze
];

const RANK_LABEL = ["1ST", "2ND", "3RD"];

export default function LeaderboardView({
  globalBoard,
  challenges,
  currentUserName,
}: {
  globalBoard: { name: string; points: number; image?: string | null }[];
  challenges: { id: string; title: string }[];
  currentUserName: string;
}) {
  const [scope, setScope] = useState("global");
  const [board, setBoard] = useState(globalBoard || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (scope === "global") {
      setBoard(globalBoard || []);
      return;
    }
    setLoading(true);
    fetch(`/api/leaderboard?challengeId=${scope}`)
      .then((res) => res.json())
      .then((data) => {
        setBoard(data.board || []);
        setLoading(false);
      });
  }, [scope, globalBoard]);

  const podium = board.slice(0, 3);
  const rest = board.slice(3);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes lbRise { from { opacity:0; transform: translateY(14px); } to { opacity:1; transform: translateY(0); } }
        @keyframes podiumPop { from { opacity:0; transform: scale(0.85) translateY(20px); } to { opacity:1; transform: scale(1) translateY(0); } }
        @keyframes barGrow { from { height: 0; } }
        @keyframes crownFloat { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-4px) rotate(-5deg); } }
        @keyframes crownGlow { 0%,100% { filter: drop-shadow(0 0 3px rgba(234,179,8,0.4)); } 50% { filter: drop-shadow(0 0 9px rgba(234,179,8,0.7)); } }
        @keyframes rowFadeIn { from { opacity:0; transform: translateX(-10px); } to { opacity:1; transform: translateX(0); } }
        @keyframes lbSpin { to { transform: rotate(360deg); } }
        @keyframes numberPop { from { opacity:0; transform: scale(0.5); } to { opacity:1; transform: scale(1); } }
        @keyframes avatarPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(109,74,255,0.4); } 50% { box-shadow: 0 0 0 5px rgba(109,74,255,0); } }
        .lb-anim { animation: lbRise 0.4s cubic-bezier(.2,.8,.2,1) both; }
        .podium-card { animation: podiumPop 0.55s cubic-bezier(.2,.9,.3,1.2) both; }
        .podium-bar { animation: barGrow 0.6s cubic-bezier(.2,.8,.2,1) both; transform-origin: bottom; }
        .crown-float { animation: crownFloat 2s ease-in-out infinite, crownGlow 2s ease-in-out infinite; display: inline-block; }
        .points-pop { animation: numberPop 0.4s cubic-bezier(.34,1.56,.64,1) both; }
        .lb-row { animation: rowFadeIn 0.35s cubic-bezier(.2,.8,.2,1) both; transition: background 0.15s ease, transform 0.15s ease; }
        .lb-row:hover { background: #F5F3FF; transform: translateX(4px); }
        .lb-row-me { animation: avatarPulse 2.2s ease-in-out infinite; border-radius: 50%; }
        .podium-avatar { transition: transform 0.25s cubic-bezier(.34,1.56,.64,1); }
        .podium-card:hover .podium-avatar { transform: scale(1.1) rotate(-4deg); }
        .scope-tab { transition: background 0.15s ease, color 0.15s ease, transform 0.15s ease; cursor: pointer; }
        .scope-tab:active { transform: scale(0.95); }
      `}</style>

      {/* Header */}
      <div className="lb-anim" style={{ marginBottom: 22 }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 800, color: "#14132B", letterSpacing: -0.5, marginBottom: 4 }}>
          Leaderboard
        </h1>
        <p style={{ fontSize: 13.5, color: "rgba(20,19,43,0.45)" }}>{board.length} ranked player{board.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Scope tabs */}
      <div className="lb-anim" style={{ display: "flex", gap: 6, marginBottom: 32, background: "rgba(15,23,42,0.04)", padding: 6, borderRadius: 14, width: "fit-content", flexWrap: "wrap" }}>
        <button
          className="scope-tab"
          onClick={() => setScope("global")}
          style={{
            padding: "9px 18px",
            borderRadius: 10,
            border: "none",
            fontSize: 13.5,
            fontWeight: 700,
            background: scope === "global" ? "#6D4AFF" : "transparent",
            color: scope === "global" ? "#fff" : "rgba(20,19,43,0.55)",
          }}
        >
          Global
        </button>
        {challenges.map((c) => (
          <button
            key={c.id}
            className="scope-tab"
            onClick={() => setScope(c.id)}
            style={{
              padding: "9px 18px",
              borderRadius: 10,
              border: "none",
              fontSize: 13.5,
              fontWeight: 700,
              background: scope === c.id ? "#6D4AFF" : "transparent",
              color: scope === c.id ? "#fff" : "rgba(20,19,43,0.55)",
              whiteSpace: "nowrap",
            }}
          >
            {c.title}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <div style={{ width: 30, height: 30, border: "3px solid rgba(109,74,255,0.15)", borderTop: "3px solid #6D4AFF", borderRadius: "50%", animation: "lbSpin 0.7s linear infinite" }} />
        </div>
      ) : board.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.07)", padding: 50, textAlign: "center" }}>
          <p style={{ color: "rgba(20,19,43,0.4)", fontSize: 14 }}>No scored submissions yet.</p>
        </div>
      ) : (
        <>
          {/* Podium */}
          {podium.length > 0 && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 20, marginBottom: 32, justifyContent: "center", flexWrap: "wrap" }}>
              {[podium[1], podium[0], podium[2]].map((entry, idx) => {
                if (!entry) return <div key={idx} style={{ width: 170 }} />;
                const rank = idx === 1 ? 0 : idx === 0 ? 1 : 2;
                const height = rank === 0 ? 140 : rank === 1 ? 110 : 90;
                const isMe = entry.name === currentUserName;
                const theme = RANK_THEME[rank];
                return (
                  <div
                    key={rank}
                    className="podium-card"
                    style={{ animationDelay: `${rank * 0.1}s`, width: 170, display: "flex", flexDirection: "column", alignItems: "center" }}
                  >
                                        {rank === 0 && <span className="crown-float" style={{ fontSize: 24, marginBottom: 6 }}>👑</span>}
                    <LbAvatar
                      image={entry.image}
                      name={entry.name}
                      size={64}
                      fontSize={18}
                      className={`podium-avatar${isMe ? " lb-row-me" : ""}`}
                      style={{
                        background: theme.avatarBg,
                        color: "#fff",
                        marginBottom: 10,
                        border: `3px solid ${theme.border}`,
                        boxShadow: "0 6px 18px rgba(20,19,43,0.2)",
                      }}
                    />
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#14132B", textAlign: "center", marginBottom: 12 }}>
                      {entry.name} {isMe && <span style={{ color: "#6D4AFF" }}>(You)</span>}
                    </p>
                    <div
                      className="podium-bar"
                      style={{
                        width: "100%",
                        height,
                        background: theme.bg,
                        borderRadius: "14px 14px 0 0",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        paddingTop: 18,
                        border: `2px solid ${theme.border}66`,
                        borderBottom: "none",
                        animationDelay: `${rank * 0.1 + 0.15}s`,
                      }}
                    >
                      <span className="points-pop" style={{ animationDelay: `${rank * 0.1 + 0.4}s`, fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, color: theme.text }}>{entry.points.toLocaleString()}</span>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(20,19,43,0.35)", letterSpacing: 0.5, marginTop: 2 }}>PTS</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: theme.text, letterSpacing: 0.5, marginTop: "auto", marginBottom: 12 }}>{RANK_LABEL[rank]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Rest of the board */}
          {rest.length > 0 && (
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(15,23,42,0.07)", overflow: "hidden" }}>
              {rest.map((entry, i) => {
                const isMe = entry.name === currentUserName;
                const rank = i + 4;
                return (
                  <div
                    key={i}
                    className="lb-row"
                    style={{
                      animationDelay: `${Math.min(i * 0.03, 0.3)}s`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "16px 20px",
                      borderTop: i > 0 ? "1px solid rgba(15,23,42,0.05)" : "none",
                      background: isMe ? "rgba(109,74,255,0.05)" : "transparent",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                           <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(20,19,43,0.35)", width: 18, textAlign: "center" }}>{rank}</span>
                      <LbAvatar
                        image={entry.image}
                        name={entry.name}
                        size={34}
                        fontSize={12}
                        className={isMe ? "lb-row-me" : ""}
                        style={{
                          background: isMe ? "linear-gradient(135deg,#8B5CF6,#6D4AFF)" : "rgba(15,23,42,0.06)",
                          color: isMe ? "#fff" : "rgba(20,19,43,0.6)",
                          border: isMe ? "2px solid #6D4AFF" : "2px solid transparent",
                        }}
                      />
                      <span style={{ fontSize: 14.5, fontWeight: 600, color: "#14132B", display: "flex", alignItems: "center", gap: 8 }}>
                        {entry.name}
                        {isMe && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: "#6D4AFF", background: "rgba(109,74,255,0.1)", padding: "2px 8px", borderRadius: 6, letterSpacing: 0.3 }}>
                            YOU
                          </span>
                        )}
                      </span>
                    </div>
                    <div>
                      <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 16, color: "#14132B" }}>{entry.points.toLocaleString()}</span>
                      <span style={{ fontSize: 11, color: "rgba(20,19,43,0.4)", marginLeft: 5, fontWeight: 600 }}>PTS</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}