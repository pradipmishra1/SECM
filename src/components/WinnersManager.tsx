"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TiltCard from "./TiltCard";

const MEDAL = {
  1: { label: "1st", color: "#D4A017", light: "#F5A623", soft: "#FFF7E0" },
  2: { label: "2nd", color: "#8E96A3", light: "#B0B8C4", soft: "#F3F4F6" },
  3: { label: "3rd", color: "#B45309", light: "#D97A3A", soft: "#FFF1E4" },
};

function initials(name: string) {
  return (name || "?").trim()[0]?.toUpperCase() || "?";
}

function Avatar({ name, image, size, ring }: { name: string; image?: string | null; size: number; ring?: string }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: image ? "#fff" : "linear-gradient(135deg,#6D4AFF,#8B5CF6)",
        color: "#fff",
        fontWeight: 700,
        fontSize: size * 0.36,
        fontFamily: "'Sora', sans-serif",
        border: ring ? `3px solid ${ring}` : "3px solid #fff",
        boxShadow: "0 6px 16px rgba(20,19,43,0.14)",
        flexShrink: 0,
      }}
    >
      {image ? (
        <img src={image} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        initials(name)
      )}
    </div>
  );
}

function MedalIcon({ position, size = 22 }: { position: 1 | 2 | 3; size?: number }) {
  const m = MEDAL[position];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="14" r="7" fill={m.color} />
      <circle cx="12" cy="14" r="7" fill="url(#grad)" fillOpacity="0.25" />
      <defs>
        <linearGradient id="grad" x1="6" y1="8" x2="18" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <text x="12" y="17.5" textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#fff" fontFamily="Sora, sans-serif">
        {position}
      </text>
      <path d="M8.5 2.5 L12 8 L15.5 2.5" stroke={m.light} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function CrownIcon({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M3 8.5 L7 12 L12 4.5 L17 12 L21 8.5 L19.5 18 H4.5 L3 8.5 Z"
        fill="url(#crownGrad)"
        stroke="#B8860B"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="crownGrad" x1="3" y1="4.5" x2="21" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE68A" />
          <stop offset="1" stopColor="#F5A623" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 44 });
  const colors = ["#6D4AFF", "#8B5CF6", "#D4A017", "#22C55E", "#EC4899", "#22D3EE"];
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 300, overflow: "hidden" }}>
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0.3; }
        }
      `}</style>
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.4;
        const duration = 2 + Math.random() * 1.5;
        const size = 6 + Math.random() * 6;
        const color = colors[i % colors.length];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${left}%`,
              top: 0,
              width: size,
              height: size * 1.6,
              background: color,
              borderRadius: 2,
              animation: `confettiFall ${duration}s ease-in ${delay}s forwards`,
            }}
          />
        );
      })}
    </div>
  );
}

export default function WinnersManager({
  challenges,
  selectedChallengeId,
  submissions,
  aiReviewEnabled = false,
}: {
  challenges: { id: string; title: string }[];
  selectedChallengeId: string;
  submissions: any[];
  aiReviewEnabled?: boolean;
}) {
  const router = useRouter();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [aiBatchLoading, setAiBatchLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{ submissionId: string; name: string; score: number; feedback: string; suggestedPosition: number }[] | null>(null);
  const [aiAllResults, setAiAllResults] = useState<{ submissionId: string; name: string; score: number; error?: string }[] | null>(null);
  const [confirmingAll, setConfirmingAll] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  async function runAiBatch() {
    setAiBatchLoading(true);
    setError("");
    setAiSuggestions(null);
    setAiAllResults(null);
    try {
      const res = await fetch(`/api/challenges/${selectedChallengeId}/ai-batch-review`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "AI batch review failed");
      } else {
        setAiAllResults(data.results);
        setAiSuggestions(data.suggestedWinners);
      }
    } catch {
      setError("AI batch review failed, try again");
    }
    setAiBatchLoading(false);
  }

  async function confirmAiWinners() {
    if (!aiSuggestions) return;
    setConfirmingAll(true);
    for (const s of aiSuggestions) {
      await fetch("/api/submissions/" + s.submissionId + "/winner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position: s.suggestedPosition, challengeId: selectedChallengeId }),
      });
    }
    setConfirmingAll(false);
    setAiSuggestions(null);
    setAiAllResults(null);
    setSuccessMsg("Winners confirmed from AI suggestions!");
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3500);
    setTimeout(() => setSuccessMsg(""), 4000);
    router.refresh();
  }

  function changeChallenge(id: string) {
    router.push("/dashboard/winners?challenge=" + id);
  }

  async function announce(submissionId: string, position: number) {
    setError("");
    setSavingId(submissionId);
    setOpenDropdownId(null);

    const res = await fetch("/api/submissions/" + submissionId + "/winner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ position, challengeId: selectedChallengeId }),
    });

    setSavingId(null);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to announce winner");
      return;
    }

    const label = position === 1 ? "1st" : position === 2 ? "2nd" : "3rd";
    setSuccessMsg(`Winner announced as ${label} place`);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3500);
    setTimeout(() => setSuccessMsg(""), 4000);
    router.refresh();
  }

  async function clearWinner(submissionId: string) {
    setError("");
    setSavingId(submissionId);

    const res = await fetch("/api/submissions/" + submissionId + "/winner", {
      method: "DELETE",
    });

    setSavingId(null);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to clear winner");
      return;
    }

    setSuccessMsg("Winner cleared");
    setTimeout(() => setSuccessMsg(""), 3000);
    router.refresh();
  }

  const takenPositions = submissions.filter((s) => s.winner).map((s) => s.winner.position);
  const podium: Record<number, any> = {};
  submissions.forEach((s) => {
    if (s.winner) podium[s.winner.position] = s;
  });

  // sort list: winners first (by position), then by score desc
  const sortedSubmissions = [...submissions].sort((a, b) => {
    const posA = a.winner?.position || 99;
    const posB = b.winner?.position || 99;
    if (posA !== posB) return posA - posB;
    const scoreA = a.review?.score ?? -1;
    const scoreB = b.review?.score ?? -1;
    return scoreB - scoreA;
  });

  return (
    <div>
      {showConfetti && <Confetti />}
      <style>{`
        @keyframes wmRise {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes wmPodiumIn {
          from { opacity: 0; transform: translateY(30px) scale(0.85); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes wmFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes wmMedalPop {
          0% { transform: scale(1); }
          40% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        @keyframes wmCrownBob {
          0%, 100% { transform: translateY(0) rotate(-4deg); }
          50% { transform: translateY(-4px) rotate(4deg); }
        }
        @keyframes wmGlow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.9; }
        }
        @keyframes wmBarRise {
          from { height: 0; opacity: 0; }
        }
        .wm-anim { animation: wmRise 0.55s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .wm-fade { animation: wmFadeIn 0.4s ease both; }
        .wm-card {
          transition: box-shadow 0.35s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.35s ease, transform 0.25s ease;
        }
        .wm-card:hover { box-shadow: 0 16px 40px rgba(20,19,43,0.10); }
        .medal-btn {
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
                      background 0.25s ease, box-shadow 0.25s ease, color 0.25s ease;
        }
        .medal-btn:hover:not(:disabled) { transform: translateY(-2px); }
        .medal-btn:active:not(:disabled) { transform: scale(0.94); }
        .medal-btn.active-medal { animation: wmMedalPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .tab-pill {
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
                      background 0.25s ease, color 0.25s ease, box-shadow 0.25s ease;
        }
        .tab-pill:hover { transform: translateY(-1px); }
        .tab-pill:active { transform: scale(0.96); }
        .clear-btn { transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease; }
        .clear-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          background: rgba(220,38,38,0.1) !important;
          border-color: rgba(220,38,38,0.3) !important;
        }
        .clear-btn:active:not(:disabled) { transform: scale(0.96); }
        .ai-btn { transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease, opacity 0.2s ease; }
        .ai-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(109,74,255,0.25); }
        .ai-btn:active:not(:disabled) { transform: scale(0.96); }
        .wm-banner { animation: wmRise 0.4s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .wm-podium-item { animation: wmPodiumIn 0.65s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .wm-crown { animation: wmCrownBob 2.2s ease-in-out infinite; transform-origin: center bottom; }
        .wm-podium-glow { animation: wmGlow 3s ease-in-out infinite; }
        .wm-bar { animation: wmBarRise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; overflow: hidden; }
        .confirm-btn, .dismiss-btn { transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease; }
        .confirm-btn:hover:not(:disabled), .dismiss-btn:hover { transform: translateY(-2px); }
        .confirm-btn:active:not(:disabled), .dismiss-btn:active { transform: scale(0.96); }

        .set-place-btn { transition: background 0.2s ease, transform 0.15s ease; }
        .set-place-btn:hover { background: rgba(109,74,255,0.06) !important; }
        .set-place-btn:active { transform: scale(0.97); }
        .dropdown-menu { animation: wmFadeIn 0.15s ease both; }
        .dropdown-item { transition: background 0.15s ease; }
        .dropdown-item:hover { background: rgba(109,74,255,0.06); }
        .leaderboard-row { transition: background 0.2s ease, transform 0.2s ease; animation: wmRise 0.4s cubic-bezier(0.22,1,0.36,1) both; }
        .leaderboard-row:hover { background: #FAFAFD; }
      `}</style>

      {/* Header row */}
      <div style={{ marginBottom: 24, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {challenges.map((c) => {
            const isActive = c.id === selectedChallengeId;
            return (
              <button
                key={c.id}
                className="tab-pill"
                onClick={() => changeChallenge(c.id)}
                style={{
                  padding: "9px 18px",
                  borderRadius: 22,
                  border: isActive ? "none" : "1px solid rgba(20,19,43,0.08)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  background: isActive ? "linear-gradient(135deg,#6D4AFF,#8B5CF6)" : "#fff",
                  color: isActive ? "#fff" : "rgba(20,19,43,0.62)",
                  boxShadow: isActive ? "0 8px 20px rgba(109,74,255,0.28)" : "0 1px 3px rgba(20,19,43,0.04)",
                }}
              >
                {c.title}
              </button>
            );
          })}
        </div>

        {aiReviewEnabled && (
          <button
            className="ai-btn"
            onClick={runAiBatch}
            disabled={aiBatchLoading}
            style={{
              padding: "10px 20px",
              borderRadius: 22,
              border: "1px solid rgba(109,74,255,0.18)",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              background: "#fff",
              color: "#6D4AFF",
              opacity: aiBatchLoading ? 0.6 : 1,
              boxShadow: "0 2px 8px rgba(109,74,255,0.08)",
            }}
          >
            {aiBatchLoading ? "Scoring submissions..." : "AI Score All & Suggest Winners"}
          </button>
        )}
      </div>

      {/* AI results panel */}
      {aiAllResults && (
        <div
          className="wm-anim"
          style={{ background: "#fff", border: "1px solid rgba(20,19,43,0.06)", borderRadius: 20, padding: 24, marginBottom: 24, boxShadow: "0 4px 24px rgba(20,19,43,0.05)" }}
        >
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "#14132B", marginBottom: 14 }}>
            AI Suggested Ranking
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
            {aiAllResults
              .slice()
              .sort((a, b) => (b.score || 0) - (a.score || 0))
              .map((r) => {
                const suggested = aiSuggestions?.find((s) => s.submissionId === r.submissionId);
                return (
                  <div
                    key={r.submissionId}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "12px 16px", borderRadius: 12,
                      background: suggested ? "rgba(109,74,255,0.05)" : "#FAFAFC",
                      border: suggested ? "1px solid rgba(109,74,255,0.15)" : "1px solid rgba(20,19,43,0.04)",
                    }}
                  >
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "#14132B" }}>
                      {suggested && `#${suggested.suggestedPosition} `}{r.name}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: r.error ? "#B91C1C" : "#6D4AFF" }}>
                      {r.error ? "Failed to score" : `${r.score}/100`}
                    </span>
                  </div>
                );
              })}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="confirm-btn"
              onClick={confirmAiWinners}
              disabled={confirmingAll || !aiSuggestions?.length}
              style={{
                background: "linear-gradient(135deg,#16A34A,#15803D)", color: "#fff", border: "none",
                borderRadius: 12, padding: "11px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                opacity: confirmingAll ? 0.6 : 1, boxShadow: "0 8px 20px rgba(22,163,74,0.22)",
              }}
            >
              {confirmingAll ? "Confirming..." : "Confirm Top 3 as Winners"}
            </button>
            <button
              className="dismiss-btn"
              onClick={() => { setAiAllResults(null); setAiSuggestions(null); }}
              style={{ background: "#F5F5F8", color: "#14132B", border: "1px solid rgba(20,19,43,0.06)", borderRadius: 12, padding: "11px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Podium */}
      {Object.keys(podium).length > 0 && (
        <div
          className="wm-anim"
          style={{
            position: "relative",
            background: "linear-gradient(180deg, #EDEBFF 0%, #F5F4FF 55%, #FBFAFF 100%)",
            borderRadius: 24, padding: "36px 28px 0", marginBottom: 28,
            border: "1px solid rgba(109,74,255,0.1)", boxShadow: "0 12px 40px rgba(109,74,255,0.10)",
            overflow: "hidden",
          }}
        >
          {/* soft glow blobs */}
          <div className="wm-podium-glow" style={{ position: "absolute", top: -40, left: "20%", width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,160,23,0.25), transparent 70%)", pointerEvents: "none" }} />
          <div className="wm-podium-glow" style={{ position: "absolute", top: -20, right: "15%", width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, rgba(109,74,255,0.2), transparent 70%)", pointerEvents: "none", animationDelay: "1s" }} />

          <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "#14132B", marginBottom: 28, position: "relative" }}>
            Winners Podium
          </h3>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 0, maxWidth: 520, margin: "0 auto", position: "relative" }}>
            {[2, 1, 3].map((pos) => {
              const s = podium[pos];
              const m = MEDAL[pos as 1 | 2 | 3];
              const barHeight = { 1: 120, 2: 84, 3: 62 };
              const avatarSize = { 1: 76, 2: 60, 3: 56 };
              const name = s ? (s.user?.name || s.team?.name || "Unknown") : null;
              const image = s ? (s.user?.image || s.team?.image || null) : null;

              return (
                <div key={pos} style={{ width: 160, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  {s ? (
                    <div
                      className="wm-podium-item"
                      style={{ animationDelay: `${pos === 1 ? 0.05 : pos === 2 ? 0.2 : 0.35}s`, display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 14, position: "relative" }}
                    >
                      {pos === 1 && (
                        <div className="wm-crown" style={{ marginBottom: -8, zIndex: 2 }}>
                          <CrownIcon size={30} />
                        </div>
                      )}
                      {pos !== 1 && <div style={{ height: 22 }} />}
                      <div style={{ position: "relative" }}>
                        <Avatar name={name!} image={image} size={avatarSize[pos as 1 | 2 | 3]} ring={m.color} />
                        <div
                          style={{
                            position: "absolute", bottom: -6, right: -4,
                            width: 26, height: 26, borderRadius: "50%",
                            background: `linear-gradient(135deg, ${m.color}, ${m.light})`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            border: "2px solid #fff", boxShadow: `0 4px 10px ${m.color}55`,
                          }}
                        >
                          <MedalIcon position={pos as 1 | 2 | 3} size={15} />
                        </div>
                      </div>
                      <p style={{ fontSize: 13.5, fontWeight: 700, color: "#14132B", marginTop: 12, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {name}
                      </p>
                      {s.review?.score != null && (
                        <p style={{ fontSize: 11.5, color: "rgba(20,19,43,0.5)", fontWeight: 600, marginTop: 2 }}>
                          Score: {s.review.score}/10
                        </p>
                      )}
                    </div>
                  ) : (
                    <div style={{ marginBottom: 14, opacity: 0.4, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ height: 22 }} />
                      <div style={{ width: avatarSize[pos as 1 | 2 | 3], height: avatarSize[pos as 1 | 2 | 3], borderRadius: "50%", background: "rgba(20,19,43,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                        ?
                      </div>
                      <p style={{ fontSize: 12, color: "rgba(20,19,43,0.4)", fontWeight: 600, marginTop: 12 }}>{m.label} Place (TBD)</p>
                    </div>
                  )}
                  <div
                    className="wm-bar"
                    style={{
                      width: "100%", height: barHeight[pos as 1 | 2 | 3],
                      background: `linear-gradient(180deg, ${m.soft}, ${m.soft}88)`,
                      borderTop: `3px solid ${m.color}`,
                      borderRadius: "14px 14px 0 0",
                      display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 14,
                      boxShadow: `0 -4px 16px ${m.color}22 inset`,
                      animationDelay: `${pos === 1 ? 0.15 : pos === 2 ? 0.3 : 0.45}s`,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 800, color: m.color, letterSpacing: 0.3 }}>{m.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Status banners */}
      {error && (
        <div className="wm-banner" style={{ background: "#FEF2F2", border: "1px solid rgba(220,38,38,0.15)", borderRadius: 14, padding: "12px 16px", color: "#D32F2F", fontSize: 13, marginBottom: 18 }}>
          {error}
        </div>
      )}
      {successMsg && (
        <div className="wm-banner" style={{ background: "#F0FDF4", border: "1px solid rgba(22,163,74,0.18)", borderRadius: 14, padding: "12px 16px", color: "#15803D", fontSize: 13, marginBottom: 18 }}>
          {successMsg}
        </div>
      )}

      {/* Leaderboard table */}
      {submissions.length === 0 ? (
        <div className="wm-fade" style={{ background: "#fff", borderRadius: 24, border: "1px solid rgba(20,19,43,0.06)", padding: 56, textAlign: "center", boxShadow: "0 4px 20px rgba(20,19,43,0.04)" }}>
          <div style={{ fontSize: 38, marginBottom: 12, opacity: 0.2 }}>🏆</div>
          <p style={{ color: "rgba(20,19,43,0.4)", fontSize: 14 }}>No submissions for this challenge yet.</p>
        </div>
      ) : (
        <TiltCard intensity={1} glow="rgba(109,74,255,0.05)" style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(20,19,43,0.06)", boxShadow: "0 4px 20px rgba(20,19,43,0.04)", overflow: "visible" }}>
          <div style={{ padding: "6px 4px" }}>
            {sortedSubmissions.map((s, i) => {
              const submitterName = s.user?.name || s.team?.name || "Unknown";
              const image = s.user?.image || s.team?.image || null;
              const currentPosition = s.winner?.position || null;
              const cardMedal = currentPosition ? MEDAL[currentPosition as 1 | 2 | 3] : null;
              const isOpen = openDropdownId === s.id;

              return (
                <div
                  key={s.id}
                  className="leaderboard-row"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "12px 14px",
                    borderRadius: 14,
                    borderTop: i > 0 ? "1px solid rgba(20,19,43,0.05)" : "none",
                    background: cardMedal ? `${cardMedal.soft}66` : "transparent",
                    position: "relative",
                    animationDelay: `${i * 0.04}s`,
                  }}
                >
                  <span style={{ width: 20, fontSize: 12.5, fontWeight: 700, color: "rgba(20,19,43,0.4)", flexShrink: 0, textAlign: "center" }}>
                    {i + 1}
                  </span>

                  {cardMedal && <MedalIcon position={currentPosition as 1 | 2 | 3} size={20} />}
                  {!cardMedal && <div style={{ width: 20, flexShrink: 0 }} />}

                  <Avatar name={submitterName} image={image} size={34} />

                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "#14132B", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {submitterName}
                  </span>

                  <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(20,19,43,0.55)", width: 60, flexShrink: 0 }}>
                    {s.review ? `${s.review.score}/10` : "—"}
                  </span>

                  {/* Set Place dropdown */}
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <button
                      className="set-place-btn"
                      disabled={savingId === s.id}
                      onClick={() => setOpenDropdownId(isOpen ? null : s.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "8px 14px", borderRadius: 10,
                        border: "1px solid rgba(20,19,43,0.1)",
                        background: "#fff", cursor: "pointer",
                        fontSize: 12.5, fontWeight: 700,
                        color: cardMedal ? cardMedal.color : "#14132B",
                      }}
                    >
                      {cardMedal ? `✓ ${cardMedal.label}` : "Set Place"}
                      <span style={{ fontSize: 10, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}>▾</span>
                    </button>

                    {isOpen && (
                      <div
                        className="dropdown-menu"
                        style={{
                          position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 20,
                          background: "#fff", borderRadius: 12, border: "1px solid rgba(20,19,43,0.08)",
                          boxShadow: "0 12px 28px rgba(20,19,43,0.14)", minWidth: 140, overflow: "hidden",
                        }}
                      >
                        {[1, 2, 3].map((pos) => {
                          const m = MEDAL[pos as 1 | 2 | 3];
                          const isThisPosition = currentPosition === pos;
                          const isTakenByOther = takenPositions.indexOf(pos) !== -1 && !isThisPosition;
                          return (
                            <button
                              key={pos}
                              className="dropdown-item"
                              disabled={isTakenByOther}
                              onClick={() => announce(s.id, pos)}
                              style={{
                                width: "100%", display: "flex", alignItems: "center", gap: 8,
                                padding: "10px 14px", border: "none", background: isThisPosition ? `${m.soft}` : "transparent",
                                cursor: isTakenByOther ? "not-allowed" : "pointer",
                                opacity: isTakenByOther ? 0.35 : 1,
                                fontSize: 12.5, fontWeight: 600, color: m.color, textAlign: "left",
                              }}
                            >
                              <MedalIcon position={pos as 1 | 2 | 3} size={15} />
                              {m.label} {isThisPosition ? "(current)" : ""}
                            </button>
                          );
                        })}
                        {cardMedal && (
                          <button
                            className="dropdown-item"
                            onClick={() => { setOpenDropdownId(null); clearWinner(s.id); }}
                            style={{
                              width: "100%", padding: "10px 14px", border: "none", background: "transparent",
                              borderTop: "1px solid rgba(20,19,43,0.06)", cursor: "pointer",
                              fontSize: 12.5, fontWeight: 600, color: "#DC2626", textAlign: "left",
                            }}
                          >
                            Clear Winner
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {cardMedal && (
                    <button
                      className="clear-btn"
                      disabled={savingId === s.id}
                      onClick={() => clearWinner(s.id)}
                      style={{
                        background: "rgba(220,38,38,0.06)", color: "#DC2626",
                        border: "1px solid rgba(220,38,38,0.15)", borderRadius: 10, padding: "8px 12px",
                        fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0,
                      }}
                    >
                      {savingId === s.id ? "..." : "Clear"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </TiltCard>
      )}
    </div>
  );
}