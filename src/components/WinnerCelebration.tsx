"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const MEDAL = { 1: { emoji: "🥇", label: "1st Place", color: "#D4A017" }, 2: { emoji: "🥈", label: "2nd Place", color: "#9CA3AF" }, 3: { emoji: "🥉", label: "3rd Place", color: "#B45309" } };

export default function WinnerCelebration({ username }: { username?: string }) {
  const router = useRouter();
  const [wins, setWins] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch("/api/winners/unseen")
      .then((r) => r.json())
      .then((d) => setWins(d.wins || []));
  }, []);

  async function dismiss() {
    const win = wins[current];
    await fetch("/api/winners/unseen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winnerId: win.id }),
    });
    if (current + 1 < wins.length) {
      setCurrent(current + 1);
    } else {
      setWins([]);
    }
  }

  if (wins.length === 0) return null;
  const win = wins[current];
  const medal = MEDAL[win.position as 1 | 2 | 3] || MEDAL[3];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,19,43,0.6)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 300,
        animation: "celeBgIn 0.3s ease",
      }}
    >
      <style>{`
        @keyframes celeBgIn { from { opacity:0 } to { opacity:1 } }
        @keyframes celePop { 0% { opacity:0; transform: scale(0.7) translateY(20px); } 60% { opacity:1; transform: scale(1.05) translateY(0); } 100% { transform: scale(1) translateY(0); } }
        @keyframes confettiFall { 0% { transform: translateY(-20px) rotate(0deg); opacity:1; } 100% { transform: translateY(340px) rotate(400deg); opacity:0; } }
        @keyframes medalGlow { 0%,100% { box-shadow: 0 0 0 0 var(--mc); } 50% { box-shadow: 0 0 0 14px transparent; } }
        .cele-card { animation: celePop 0.5s cubic-bezier(.34,1.56,.64,1) both; }
        .confetti { position: absolute; top: 0; animation: confettiFall linear infinite; }
        .cele-btn { transition: transform 0.15s ease, box-shadow 0.2s ease; }
        .cele-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(109,74,255,0.35); }
      `}</style>

      <div
        className="cele-card"
        style={{
          background: "linear-gradient(160deg,#1A1626,#2A2340)",
          borderRadius: 26,
          padding: "40px 36px",
          width: 400,
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          boxShadow: `0 40px 80px ${medal.color}33`,
        }}
      >
        {["🎉", "✨", "🎊", "⭐", "🎉", "✨"].map((e, i) => (
          <span
            key={i}
            className="confetti"
            style={{ left: `${10 + i * 16}%`, animationDuration: `${2 + i * 0.3}s`, animationDelay: `${i * 0.15}s`, fontSize: 18 }}
          >
            {e}
          </span>
        ))}

        <div
          style={{
            width: 90,
            height: 90,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${medal.color}, ${medal.color}cc)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 42,
            margin: "0 auto 20px",
            animation: "medalGlow 2s ease-in-out infinite",
            ["--mc" as any]: `${medal.color}55`,
          }}
        >
          {medal.emoji}
        </div>

        <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 6 }}>
          Congratulations! 🎉
        </p>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>You won</p>
        <p style={{ fontSize: 16, fontWeight: 700, color: medal.color, marginBottom: 4 }}>{medal.label}</p>
        <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 700, color: "#F5D98C", marginBottom: 18, lineHeight: 1.4 }}>
          "{win.challenge.title}"
        </p>

        {win.challenge.prize && (
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 20 }}>
            🎁 Prize: <strong style={{ color: "#fff" }}>{win.challenge.prize}</strong>
          </p>
        )}

        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>
          Organized by {win.challenge.organizer?.orgName || "Organizer"}
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          {username && (
            <button
              className="cele-btn"
              onClick={() => router.push(`/dashboard/profile`)}
              style={{ flex: 1, background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12, padding: "12px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
            >
              View My Profile
            </button>
          )}
          <button
            className="cele-btn"
            onClick={dismiss}
            style={{ flex: 1, background: `linear-gradient(135deg, ${medal.color}, ${medal.color}cc)`, color: "#1A1626", border: "none", borderRadius: 12, padding: "12px", fontSize: 13, fontWeight: 800, cursor: "pointer" }}
          >
            {current + 1 < wins.length ? "Next →" : "Awesome! 🎉"}
          </button>
        </div>

        {wins.length > 1 && (
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 14 }}>
            {current + 1} of {wins.length} new wins
          </p>
        )}
      </div>
    </div>
  );
}