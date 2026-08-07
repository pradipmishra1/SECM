"use client";

import { useState, useEffect } from "react";
import TiltCard from "./TiltCard";
import { Icon } from "./icons";

const MEDAL_COLORS = ["#D4A017", "#9CA3AF", "#B45309"];
const MEDAL_EMOJI = ["🥇", "🥈", "🥉"];

export default function LeaderboardView({
  globalBoard,
  challenges,
  currentUserName,
}: {
  globalBoard: { name: string; points: number }[];
  challenges: { id: string; title: string }[];
  currentUserName: string;
}) {
  const [scope, setScope] = useState("global");
  const [board, setBoard] = useState(globalBoard);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (scope === "global") {
      setBoard(globalBoard);
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
    <div>
      <style>{`
        @keyframes lbRise { from { opacity:0; transform: translateY(14px); } to { opacity:1; transform: translateY(0); } }
        @keyframes podiumPop { from { opacity:0; transform: scale(0.85) translateY(16px); } to { opacity:1; transform: scale(1) translateY(0); } }
        @keyframes crownFloat { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-4px) rotate(-4deg); } }
        @keyframes rowFadeIn { from { opacity:0; transform: translateX(-8px); } to { opacity:1; transform: translateX(0); } }
        .lb-anim { animation: lbRise 0.4s cubic-bezier(.2,.8,.2,1) both; }
        .podium-card { animation: podiumPop 0.5s cubic-bezier(.34,1.56,.64,1) both; }
        .crown-float { animation: crownFloat 2s ease-in-out infinite; display: inline-block; }
        .lb-row { animation: rowFadeIn 0.35s ease both; transition: background 0.15s ease, transform 0.15s ease; }
        .lb-row:hover { transform: translateX(3px); background: #F9F8FE; }
        .scope-select { transition: box-shadow 0.2s ease; }
        .scope-select:focus { box-shadow: 0 0 0 4px rgba(109,74,255,0.1); }
      `}</style>

      <div className="lb-anim" style={{ marginBottom: 24 }}>
        <select
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          className="scope-select"
          style={{
            padding: "10px 16px",
            borderRadius: 12,
            border: "1px solid rgba(15,23,42,0.08)",
            background: "#fff",
            fontSize: 13.5,
            fontWeight: 600,
            color: "#14132B",
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option value="global">🌍 Global Leaderboard</option>
          {challenges.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <div style={{ width: 30, height: 30, border: "3px solid rgba(109,74,255,0.15)", borderTop: "3px solid #6D4AFF", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : board.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.07)", padding: 50, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.25 }}>🏆</div>
          <p style={{ color: "rgba(20,19,43,0.4)", fontSize: 14 }}>No scored submissions yet.</p>
        </div>
      ) : (
        <>
          {/* Podium for top 3 */}
          {podium.length > 0 && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginBottom: 24, justifyContent: "center" }}>
              {[podium[1], podium[0], podium[2]].map((entry, idx) => {
                if (!entry) return <div key={idx} style={{ width: 160 }} />;
                const rank = idx === 1 ? 0 : idx === 0 ? 1 : 2;
                const height = rank === 0 ? 150 : rank === 1 ? 120 : 100;
                const isMe = entry.name === currentUserName;
                return (
                  <div
                    key={rank}
                    className="podium-card"
                    style={{ animationDelay: `${rank * 0.12}s`, width: 160, display: "flex", flexDirection: "column", alignItems: "center" }}
                  >
                    {rank === 0 && <span className="crown-float" style={{ fontSize: 26, marginBottom: 6 }}>👑</span>}
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${MEDAL_COLORS[rank]}, ${MEDAL_COLORS[rank]}cc)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: 22,
                        fontWeight: 700,
                        fontFamily: "'Sora', sans-serif",
                        marginBottom: 10,
                        boxShadow: `0 10px 24px ${MEDAL_COLORS[rank]}55`,
                        border: isMe ? "3px solid #6D4AFF" : "3px solid #fff",
                      }}
                    >
                      {MEDAL_EMOJI[rank]}
                    </div>
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: "#14132B", textAlign: "center", marginBottom: 4 }}>
                      {entry.name} {isMe && <span style={{ color: "#6D4AFF" }}>(You)</span>}
                    </p>
                    <div
                      style={{
                        width: "100%",
                        height,
                        background: `linear-gradient(180deg, ${MEDAL_COLORS[rank]}22, ${MEDAL_COLORS[rank]}08)`,
                        borderRadius: "14px 14px 0 0",
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "center",
                        paddingTop: 14,
                        border: `1px solid ${MEDAL_COLORS[rank]}33`,
                        borderBottom: "none",
                      }}
                    >
                      <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800, color: MEDAL_COLORS[rank] }}>{entry.points}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Rest of the board */}
          {rest.length > 0 && (
            <TiltCard intensity={1} glow="rgba(109,74,255,0.06)" style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.07)", padding: 12 }}>
              {rest.map((entry, i) => {
                const isMe = entry.name === currentUserName;
                const rank = i + 4;
                return (
                  <div
                    key={i}
                    className="lb-row"
                    style={{
                      animationDelay: `${i * 0.03}s`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "13px 14px",
                      borderTop: i > 0 ? "1px solid rgba(15,23,42,0.05)" : "none",
                      background: isMe ? "rgba(109,74,255,0.05)" : "transparent",
                      borderRadius: isMe ? 10 : 0,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "'Sora', sans-serif",
                          fontWeight: 700,
                          fontSize: 12.5,
                          background: "rgba(20,19,43,0.06)",
                          color: "rgba(20,19,43,0.5)",
                        }}
                      >
                        {rank}
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#14132B" }}>
                        {entry.name} {isMe && <span style={{ color: "#6D4AFF" }}>(You)</span>}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Icon.trophy width={14} height={14} style={{ color: "#D97706" }} />
                      <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 15, color: "#14132B" }}>{entry.points}</span>
                      <span style={{ fontSize: 12, color: "rgba(20,19,43,0.4)" }}>pts</span>
                    </div>
                  </div>
                );
              })}
            </TiltCard>
          )}
        </>
      )}
    </div>
  );
}