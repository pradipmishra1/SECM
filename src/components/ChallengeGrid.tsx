"use client";

import { useRouter } from "next/navigation";

const TYPE_COLORS: Record<string, { bg: string; text: string; emoji: string }> = {
  HACKATHON: { bg: "linear-gradient(135deg,#ff8a3d,#ff5f6d)", text: "#fff", emoji: "🚀" },
  CODING_CONTEST: { bg: "linear-gradient(135deg,#3d9bff,#4f6dff)", text: "#fff", emoji: "💻" },
  DESIGN_CHALLENGE: { bg: "linear-gradient(135deg,#ff3d9b,#ff6ec7)", text: "#fff", emoji: "🎨" },
  IDEA_PITCHING: { bg: "linear-gradient(135deg,#3dffb0,#22c55e)", text: "#fff", emoji: "💡" },
};

function daysLeft(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return "Closed";
  if (days === 0) return "Ends today";
  return `Ends in ${days} day${days > 1 ? "s" : ""}`;
}

export default function ChallengeGrid({ challenges, role }: { challenges: any[]; role: string }) {
  const router = useRouter();

  if (challenges.length === 0) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          color: "rgba(0,0,0,0.4)",
          background: "rgba(255,255,255,0.6)",
          borderRadius: 20,
        }}
      >
        No published challenges yet.
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 20,
      }}
    >
      {challenges.map((c) => {
        const typeStyle = TYPE_COLORS[c.type] || TYPE_COLORS.HACKATHON;
        return (
          <div
            key={c.id}
            style={{
              background: "rgba(255,255,255,0.75)",
              backdropFilter: "blur(20px)",
              borderRadius: 20,
              padding: 20,
              border: "1px solid rgba(255,255,255,0.5)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                display: "inline-block",
                background: typeStyle.bg,
                color: typeStyle.text,
                fontSize: 11,
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: 20,
                marginBottom: 12,
                letterSpacing: 0.3,
              }}
            >
              {typeStyle.emoji} {c.type.replace("_", " ")}
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e", marginBottom: 8 }}>
              {c.title}
            </h3>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              {c.tags?.slice(0, 3).map((tag: any) => (
                <span
                  key={tag.id}
                  style={{
                    fontSize: 11,
                    color: "rgba(0,0,0,0.45)",
                    background: "rgba(0,0,0,0.04)",
                    padding: "3px 8px",
                    borderRadius: 10,
                  }}
                >
                  {tag.name}
                </span>
              ))}
            </div>

            <p style={{ fontSize: 13, color: "rgba(0,0,0,0.4)", marginBottom: 14 }}>
              ⏱ {daysLeft(c.deadline)}
            </p>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: "rgba(0,0,0,0.4)" }}>
                👥 {c.teams?.length || 0} Teams
              </span>
              <button
                onClick={() => router.push(`/dashboard/challenge/${c.id}`)}
                style={{
                  background: "linear-gradient(135deg,#7c5cfc,#b26aff)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 20,
                  padding: "8px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {role === "STUDENT" ? "View / Join" : "View Details"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}