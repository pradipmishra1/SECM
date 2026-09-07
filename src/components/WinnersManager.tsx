"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TiltCard from "./TiltCard";

const MEDAL = { 1: { label: "1st", emoji: "🥇", color: "#D4A017" }, 2: { label: "2nd", emoji: "🥈", color: "#9CA3AF" }, 3: { label: "3rd", emoji: "🥉", color: "#B45309" } };

function Confetti() {
  const pieces = Array.from({ length: 40 });
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
    setSuccessMsg(`🎉 Winner announced as ${label} place!`);
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

  return (
    <div>
      {showConfetti && <Confetti />}
      <style>{`
        @keyframes wmRise { from { opacity:0; transform: translateY(14px); } to { opacity:1; transform: translateY(0); } }
        @keyframes wmPulse { 0%,100% { box-shadow: 0 0 0 0 var(--mc); } 50% { box-shadow: 0 0 0 8px transparent; } }
        @keyframes wmPodiumIn { from { opacity:0; transform: translateY(20px) scale(0.9); } to { opacity:1; transform: translateY(0) scale(1); } }
        .wm-anim { animation: wmRise 0.4s cubic-bezier(.2,.8,.2,1) both; }
        .wm-podium-item { animation: wmPodiumIn 0.5s cubic-bezier(.34,1.56,.64,1) both; }
        .medal-btn { transition: transform 0.15s ease, box-shadow 0.2s ease; }
        .medal-btn:hover:not(:disabled) { transform: translateY(-2px); }
        .medal-btn:active:not(:disabled) { transform: scale(0.95); }
        .tab-pill { transition: transform 0.15s ease; }
        .tab-pill:hover { transform: translateY(-1px); }
        .clear-btn { transition: transform 0.15s ease, background 0.15s ease; }
        .clear-btn:hover:not(:disabled) { transform: translateY(-1px); background: rgba(220,38,38,0.15) !important; }
      `}</style>


      <div style={{ marginBottom: 20, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {challenges.map((c) => {
            const isActive = c.id === selectedChallengeId;
            return (
              <button
                key={c.id}
                className="tab-pill"
                onClick={() => changeChallenge(c.id)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 20,
                  border: "none",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  background: isActive ? "linear-gradient(135deg,#6D4AFF,#8B5CF6)" : "rgba(20,19,43,0.05)",
                  color: isActive ? "#fff" : "rgba(20,19,43,0.6)",
                }}
              >
                {c.title}
              </button>
            );
          })}
        </div>

        {aiReviewEnabled && (
          <button
            className="tab-pill"
            onClick={runAiBatch}
            disabled={aiBatchLoading}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              border: "1px solid rgba(109,74,255,0.25)",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              background: "rgba(109,74,255,0.08)",
              color: "#6D4AFF",
              opacity: aiBatchLoading ? 0.6 : 1,
            }}
          >
            {aiBatchLoading ? "Scoring all submissions..." : "AI Score All & Suggest Winners"}
          </button>
        )}
      </div>

      {aiAllResults && (
        <div className="wm-anim" style={{ background: "#fff", border: "1px solid rgba(109,74,255,0.15)", borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "#14132B", marginBottom: 12 }}>
            AI Suggested Ranking
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {aiAllResults
              .slice()
              .sort((a, b) => (b.score || 0) - (a.score || 0))
              .map((r) => {
                const suggested = aiSuggestions?.find((s) => s.submissionId === r.submissionId);
                return (
                  <div
                    key={r.submissionId}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 14px",
                      borderRadius: 10,
                      background: suggested ? "rgba(109,74,255,0.06)" : "#F6F5FB",
                      border: suggested ? "1px solid rgba(109,74,255,0.2)" : "1px solid transparent",
                    }}
                  >
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "#14132B" }}>
                      {suggested && `#${suggested.suggestedPosition} `}{r.name}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: r.error ? "#B91C1C" : "#4C2FCC" }}>
                      {r.error ? "Failed to score" : `${r.score}/100`}
                    </span>
                  </div>
                );
              })}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={confirmAiWinners}
              disabled={confirmingAll || !aiSuggestions?.length}
              style={{
                background: "linear-gradient(135deg,#16A34A,#15803D)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "10px 20px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                opacity: confirmingAll ? 0.6 : 1,
              }}
            >
              {confirmingAll ? "Confirming..." : "Confirm Top 3 as Winners"}
            </button>
            <button
              onClick={() => { setAiAllResults(null); setAiSuggestions(null); }}
              style={{ background: "rgba(20,19,43,0.05)", color: "#14132B", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Podium summary */}
      {Object.keys(podium).length > 0 && (
        <div className="wm-anim" style={{ background: "linear-gradient(160deg,#1A1626,#2A2340)", borderRadius: 20, padding: "26px 24px", marginBottom: 24, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 0%, rgba(212,160,23,0.15), transparent 60%)", pointerEvents: "none" }} />
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "#F5D98C", marginBottom: 18, position: "relative" }}>🏆 Winners Podium</h3>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 16, position: "relative" }}>
            {[2, 1, 3].map((pos) => {
              const s = podium[pos];
              const m = MEDAL[pos as 1 | 2 | 3];
              const heights = { 1: 130, 2: 100, 3: 80 };
              if (!s) {
                return (
                  <div key={pos} style={{ width: 130, textAlign: "center" }}>
                    <div style={{ height: heights[pos as 1 | 2 | 3], display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 10 }}>
                      <span style={{ fontSize: 24, opacity: 0.3 }}>{m.emoji}</span>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "10px 10px 0 0", height: 6 }} />
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 8 }}>Not yet assigned</p>
                  </div>
                );
              }
              const name = s.user?.name || s.team?.name || "Unknown";
              return (
                <div key={pos} className="wm-podium-item" style={{ animationDelay: `${pos * 0.1}s`, width: 130, textAlign: "center" }}>
                  <div style={{ height: heights[pos as 1 | 2 | 3], display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", paddingBottom: 10 }}>
                    <span style={{ fontSize: 30, marginBottom: 6 }}>{m.emoji}</span>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${m.color}, ${m.color}cc)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#1A1626", fontWeight: 700, fontSize: 15, marginBottom: 6 }}>
                      {name[0]?.toUpperCase()}
                    </div>
                    <p style={{ fontSize: 12.5, fontWeight: 700, color: "#fff", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</p>
                  </div>
                  <div style={{ background: `linear-gradient(180deg, ${m.color}, ${m.color}88)`, borderRadius: "10px 10px 0 0", height: heights[pos as 1 | 2 | 3] * 0.35, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#1A1626" }}>{m.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {error && (
        <div style={{ background: "rgba(255,70,70,0.05)", border: "1px solid rgba(255,70,70,0.15)", borderRadius: 10, padding: "10px 14px", color: "#d32f2f", fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}
      {successMsg && (
        <div style={{ background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)", borderRadius: 10, padding: "10px 14px", color: "#15803D", fontSize: 13, marginBottom: 16 }}>
          {successMsg}
        </div>
      )}

      {submissions.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.07)", padding: 50, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.25 }}>🏆</div>
          <p style={{ color: "rgba(20,19,43,0.4)", fontSize: 14 }}>No submissions for this challenge yet.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {submissions.map((s, i) => {
            const submitterName = s.user?.name || s.team?.name || "Unknown";
            const currentPosition = s.winner?.position || null;
            const cardMedal = currentPosition ? MEDAL[currentPosition as 1 | 2 | 3] : null;

            return (
              <div key={s.id} className="wm-anim" style={{ animationDelay: `${i * 0.05}s` }}>
                <TiltCard
                  intensity={cardMedal ? 5 : 2}
                  glow={cardMedal ? `${cardMedal.color}55` : "rgba(109,74,255,0.08)"}
                  style={{
                    background: cardMedal ? "linear-gradient(160deg,#1A1626,#2A2340)" : "#fff",
                    borderRadius: 18,
                    border: cardMedal ? "1px solid rgba(255,215,120,0.15)" : "1px solid rgba(15,23,42,0.07)",
                    padding: 20,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {cardMedal && (
                    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 20% 0%, ${cardMedal.color}25, transparent 60%)`, pointerEvents: "none" }} />
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, position: "relative" }}>
                    <div>
                      <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15.5, fontWeight: 700, color: cardMedal ? "#F5D98C" : "#14132B" }}>
                        {submitterName}
                      </h3>
                      <p style={{ fontSize: 12, color: cardMedal ? "rgba(255,255,255,0.5)" : "rgba(20,19,43,0.45)", marginTop: 3 }}>
                        {s.review ? `Score: ${s.review.score}/10` : "Not yet reviewed"}
                      </p>
                    </div>
                    {cardMedal && (
                      <span
                        style={{
                          fontSize: 22,
                          animation: "wmPulse 2s ease-in-out infinite",
                          ["--mc" as any]: `${cardMedal.color}44`,
                        }}
                      >
                        {cardMedal.emoji}
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 8, position: "relative", marginBottom: cardMedal ? 10 : 0 }}>
                    {[1, 2, 3].map((pos) => {
                      const m = MEDAL[pos as 1 | 2 | 3];
                      const isThisPosition = currentPosition === pos;
                      const isTakenByOther = takenPositions.indexOf(pos) !== -1 && !isThisPosition;
                      return (
                        <button
                          key={pos}
                          className="medal-btn"
                          disabled={isTakenByOther || savingId === s.id}
                          onClick={() => announce(s.id, pos)}
                          style={{
                            flex: 1,
                            padding: "9px 0",
                            borderRadius: 10,
                            border: "none",
                            fontSize: 12.5,
                            fontWeight: 700,
                            cursor: isTakenByOther ? "not-allowed" : "pointer",
                            opacity: isTakenByOther ? 0.3 : 1,
                            background: isThisPosition ? `linear-gradient(135deg, ${m.color}, ${m.color}cc)` : cardMedal ? "rgba(255,255,255,0.08)" : "rgba(20,19,43,0.05)",
                            color: isThisPosition ? "#1A1626" : cardMedal ? "rgba(255,255,255,0.6)" : "rgba(20,19,43,0.55)",
                            boxShadow: isThisPosition ? `0 6px 16px ${m.color}44` : "none",
                          }}
                        >
                          {m.emoji} {m.label}
                        </button>
                      );
                    })}
                  </div>

                  {cardMedal && (
                    <button
                      className="clear-btn"
                      disabled={savingId === s.id}
                      onClick={() => clearWinner(s.id)}
                      style={{
                        position: "relative",
                        width: "100%",
                        marginTop: 4,
                        background: "rgba(220,38,38,0.08)",
                        color: "#F87171",
                        border: "1px solid rgba(220,38,38,0.2)",
                        borderRadius: 10,
                        padding: "8px 0",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {savingId === s.id ? "Clearing..." : "✕ Clear Winner"}
                    </button>
                  )}
                </TiltCard>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}