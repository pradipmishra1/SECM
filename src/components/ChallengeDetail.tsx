"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./icons";
import { TypeBadge } from "./Badges";

export default function ChallengeDetail({
  challenge,
  role,
  alreadyJoined,
  myTeam,
}: {
  challenge: any;
  role: string;
  alreadyJoined: boolean;
  myTeam: any;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function joinSolo() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/challenges/${challenge.id}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ joinType: "SOLO" }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed to join");
      return;
    }
    router.refresh();
  }

  const cardStyle: React.CSSProperties = {
    background: "#fff",
    borderRadius: 16,
    border: "1px solid rgba(15,23,42,0.07)",
    padding: 22,
    transition: "box-shadow 0.25s ease, transform 0.25s ease",
  };

  return (
    <div style={{ animation: "scF 0.4s cubic-bezier(.2,.8,.2,1)" }}>
      <style>{`
        @keyframes scF { from { opacity:0; transform: translateY(10px);} to { opacity:1; transform: translateY(0);} }
        @keyframes popIn { from { opacity:0; transform: scale(0.9);} to { opacity:1; transform: scale(1);} }
        .sec-card:hover { box-shadow: 0 8px 24px rgba(15,23,42,0.06); transform: translateY(-2px); }
        .sec-btn { transition: transform 0.15s ease, box-shadow 0.25s ease, opacity 0.2s ease; }
        .sec-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 10px 24px rgba(109,74,255,0.3); }
        .sec-btn:active:not(:disabled) { transform: translateY(0); }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div style={{ animation: "popIn 0.35s ease" }}>
          <div style={{ marginBottom: 10 }}>
            <TypeBadge type={challenge.type} />
          </div>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 27, fontWeight: 700, color: "#14132B" }}>
            {challenge.title}
          </h1>
          <p style={{ color: "rgba(20,19,43,0.5)", fontSize: 14, marginTop: 4 }}>
            By {challenge.organizer?.orgName || "Organizer"}
          </p>
        </div>

        <div style={{ animation: "popIn 0.4s ease" }}>
          {role === "STUDENT" &&
            (alreadyJoined || myTeam ? (
              <span
                style={{
                  background: "rgba(22,163,74,0.1)",
                  color: "#15803D",
                  fontWeight: 700,
                  fontSize: 13,
                  padding: "10px 18px",
                  borderRadius: 20,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                ✓ Joined
              </span>
            ) : (
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  className="sec-btn"
                  onClick={joinSolo}
                  disabled={loading}
                  style={{
                    background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    padding: "10px 18px",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 6px 16px rgba(109,74,255,0.25)",
                  }}
                >
                  {loading ? "Joining..." : "Join Solo"}
                </button>
                <button
                  className="sec-btn"
                  onClick={() => router.push(`/dashboard/challenge/${challenge.id}/create-team`)}
                  style={{
                    background: "#14132B",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    padding: "10px 18px",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Create Team
                </button>
              </div>
            ))}
        </div>
      </div>

      {error && (
        <div style={{ background: "rgba(255,70,70,0.05)", border: "1px solid rgba(255,70,70,0.15)", borderRadius: 10, padding: "10px 14px", color: "#d32f2f", fontSize: 13, marginBottom: 20, animation: "popIn 0.3s ease" }}>
          ⚠ {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 18 }}>
        <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="sec-card" style={{ ...cardStyle, animation: "scF 0.4s ease 0.05s both" }}>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "#14132B", marginBottom: 10 }}>
              Description
            </h2>
            <p style={{ fontSize: 14, color: "rgba(20,19,43,0.65)", lineHeight: 1.6 }}>
              {challenge.description || "No description provided."}
            </p>
          </div>

          <div className="sec-card" style={{ ...cardStyle, animation: "scF 0.4s ease 0.1s both" }}>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "#14132B", marginBottom: 10 }}>
              Rules
            </h2>
            <p style={{ fontSize: 14, color: "rgba(20,19,43,0.65)", lineHeight: 1.6 }}>
              {challenge.rules || "No specific rules provided."}
            </p>
          </div>

          {(alreadyJoined || myTeam) && role === "STUDENT" && (
            <button
              className="sec-btn"
              onClick={() => router.push(`/dashboard/challenge/${challenge.id}/submit`)}
              style={{
                background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "15px",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 8px 20px rgba(109,74,255,0.25)",
                animation: "scF 0.4s ease 0.15s both",
              }}
            >
              Submit Your Work
            </button>
          )}
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="sec-card" style={{ ...cardStyle, padding: 18, animation: "scF 0.4s ease 0.08s both" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Icon.clock width={15} height={15} style={{ color: "#6D4AFF" }} />
              <span style={{ fontSize: 12.5, color: "rgba(20,19,43,0.5)", fontWeight: 600 }}>Deadline</span>
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#14132B" }}>
              {new Date(challenge.deadline).toLocaleString()}
            </p>
          </div>

          {challenge.prize && (
            <div className="sec-card" style={{ ...cardStyle, padding: 18, animation: "scF 0.4s ease 0.12s both" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Icon.trophy width={15} height={15} style={{ color: "#D97706" }} />
                <span style={{ fontSize: 12.5, color: "rgba(20,19,43,0.5)", fontWeight: 600 }}>Prize</span>
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#14132B" }}>{challenge.prize}</p>
            </div>
          )}

          {challenge.maxTeamSize && (
            <div className="sec-card" style={{ ...cardStyle, padding: 18, animation: "scF 0.4s ease 0.16s both" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Icon.users width={15} height={15} style={{ color: "#2563EB" }} />
                <span style={{ fontSize: 12.5, color: "rgba(20,19,43,0.5)", fontWeight: 600 }}>Max Team Size</span>
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#14132B" }}>{challenge.maxTeamSize} members</p>
            </div>
          )}

          {challenge.tags?.length > 0 && (
            <div className="sec-card" style={{ ...cardStyle, padding: 18, animation: "scF 0.4s ease 0.2s both" }}>
              <span style={{ fontSize: 12.5, color: "rgba(20,19,43,0.5)", fontWeight: 600, display: "block", marginBottom: 10 }}>
                Tags
              </span>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {challenge.tags.map((t: any) => (
                  <span key={t.id} style={{ fontSize: 11.5, background: "rgba(20,19,43,0.05)", padding: "4px 10px", borderRadius: 8, color: "rgba(20,19,43,0.6)" }}>
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}