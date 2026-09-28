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
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (scope === "global") {
      setBoard(globalBoard || []);
      setLoadError("");
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setLoadError("");
    fetch(`/api/leaderboard?challengeId=${scope}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Unable to load this leaderboard.");
        return res.json();
      })
      .then((data) => {
        setBoard(data.board || []);
        setLoading(false);
      })
      .catch((error) => {
        if (error instanceof Error && error.name === "AbortError") return;
        setBoard([]);
        setLoadError("We couldn’t load this leaderboard. Please try another scope.");
        setLoading(false);
      });
    return () => controller.abort();
  }, [scope, globalBoard]);

  const podium = board.slice(0, 3);
  const rest = board.slice(3);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .lb-anim, .podium-card, .lb-row { animation: fadeSlideIn 0.32s ease-out both; }
        .lb-row { transition: background-color 0.18s ease; }
        .lb-row:hover { background: #F5F3FF; }
        .lb-row-me { border-radius: 50%; box-shadow: 0 0 0 3px rgba(109,74,255,0.12); }
        .podium-avatar { transition: transform 0.18s ease; }
        .podium-card:hover .podium-avatar { transform: translateY(-2px); }
        .scope-tab { flex: 0 0 auto; transition: background-color 0.18s ease, color 0.18s ease; cursor: pointer; }
        .lb-scope-tabs { width: 100% !important; max-width: 100%; flex-wrap: nowrap !important; overflow-x: auto; scrollbar-width: thin; }
        .lb-podium { display: grid; grid-template-columns: repeat(3, minmax(0, 170px)); align-items: end; justify-content: center; gap: 18px; }
        .lb-podium-item { width: 100% !important; min-width: 0; }
        @media (max-width: 560px) {
          .lb-podium { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
          .lb-podium .podium-avatar { width: 52px !important; height: 52px !important; }
          .lb-podium-item > p { font-size: 12px !important; min-height: 34px; display: flex; align-items: center; justify-content: center; }
          .lb-podium-bar { padding-top: 12px !important; }
          .lb-podium-points { font-size: 18px !important; }
          .lb-row { padding: 13px 12px !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .lb-anim, .podium-card, .lb-row { animation: none; }
          .lb-row, .podium-avatar, .scope-tab { transition: none; }
        }
      `}</style>

      {/* Header */}
      <div className="lb-anim" style={{ marginBottom: 22 }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 800, color: "#14132B", letterSpacing: -0.5, marginBottom: 4 }}>
          Leaderboard
        </h1>
        <p style={{ fontSize: 13.5, color: "rgba(20,19,43,0.45)" }}>{board.length} ranked player{board.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Scope tabs */}
      <div className="lb-anim lb-scope-tabs" role="group" aria-label="Leaderboard scope" style={{ display: "flex", gap: 6, marginBottom: 32, background: "rgba(15,23,42,0.04)", padding: 6, borderRadius: 14, width: "fit-content", flexWrap: "wrap" }}>
        <button
          className="scope-tab"
          onClick={() => setScope("global")}
          aria-pressed={scope === "global"}
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
            aria-pressed={scope === c.id}
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
        <div role="status" aria-live="polite" style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(15,23,42,0.07)", padding: 40, textAlign: "center", color: "rgba(20,19,43,0.5)", fontSize: 14 }}>
          Loading leaderboard…
        </div>
      ) : loadError ? (
        <div role="alert" style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(15,23,42,0.07)", padding: 40, textAlign: "center", color: "rgba(20,19,43,0.55)", fontSize: 14 }}>
          {loadError}
        </div>
      ) : board.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.07)", padding: 50, textAlign: "center" }}>
          <p style={{ color: "rgba(20,19,43,0.4)", fontSize: 14 }}>No scored submissions yet.</p>
        </div>
      ) : (
        <>
          {/* Podium */}
          {podium.length > 0 && (
            <div className="lb-podium" style={{ marginBottom: 32 }}>
              {[podium[1], podium[0], podium[2]].map((entry, idx) => {
                if (!entry) return <div key={idx} aria-hidden="true" />;
                const rank = idx === 1 ? 0 : idx === 0 ? 1 : 2;
                const height = rank === 0 ? 140 : rank === 1 ? 110 : 90;
                const isMe = entry.name === currentUserName;
                const theme = RANK_THEME[rank];
                return (
                  <div
                    key={rank}
                    className="podium-card lb-podium-item"
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
                      className="podium-bar lb-podium-bar"
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
                      <span className="lb-podium-points" style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, color: theme.text }}>{entry.points.toLocaleString()}</span>
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
