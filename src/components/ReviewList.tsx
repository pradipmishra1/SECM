"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TiltCard from "./TiltCard";
import { Icon } from "./icons";

function getFileMeta(url: string) {
  const clean = url.split("?")[0];
  const ext = clean.split(".").pop()?.toLowerCase() || "";
  let name = clean.split("/").pop() || "submission file";
  try { name = decodeURIComponent(name); } catch { /* Keep the encoded name if the URL is malformed. */ }
  const isImage = ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext);
  const isPdf = ext === "pdf";
  const isZip = ["zip", "rar", "7z"].includes(ext);
  const icon = isImage ? "🖼️" : isPdf ? "📄" : isZip ? "🗂️" : "📎";
  return { name, ext: ext.toUpperCase() || "FILE", icon };
}

function SubmissionFilesModal({ submission, onClose }: { submission: any; onClose: () => void }) {
  const submitterName = submission.user ? submission.user.name : submission.team ? submission.team.name : "Unknown";
  const files = submission.fileUrl ? [submission.fileUrl] : [];
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(20,19,43,0.5)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16,
      }}
    >
      <style>{`
        @keyframes sfmPop { from { opacity:0; transform: scale(0.94) translateY(10px); } to { opacity:1; transform: scale(1) translateY(0); } }
        .sfm-card { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .sfm-card:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(45,35,100,0.18); }
        .sfm-open-btn { transition: transform 0.15s ease, box-shadow 0.2s ease; }
        .sfm-open-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 18px rgba(109,74,255,0.3); }
        @media (prefers-reduced-motion: reduce) { .sfm-card, .sfm-open-btn { transition: none; } }
      `}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-files-title"
        style={{
          background: "#fff", borderRadius: 20, padding: 24, width: "min(440px, 92vw)", boxSizing: "border-box", animation: "sfmPop 0.22s ease-out",
          boxShadow: "0 30px 60px rgba(20,19,43,0.25)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 id="review-files-title" style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 700, color: "#14132B" }}>Submitted Files</h3>
          <button onClick={onClose} style={{ background: "rgba(20,19,43,0.05)", border: "none", borderRadius: 8, width: 28, height: 28, cursor: "pointer", fontSize: 15, color: "rgba(20,19,43,0.5)" }}>✕</button>
        </div>

        {files.length === 0 ? (
          <p style={{ fontSize: 13, color: "rgba(20,19,43,0.4)", textAlign: "center", padding: "30px 0" }}>No files attached.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {files.map((url, i) => {
              const meta = getFileMeta(url);
              return (
                <div
                  key={i}
                  className="sfm-card"
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: 18,
                    padding: 22,
                    background: "linear-gradient(135deg, #14132B 0%, #3B2E7A 55%, #6D4AFF 100%)",
                    color: "#fff",
                  }}
                >
                  <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 26 }}>
                    <span style={{ fontSize: 26 }}>{meta.icon}</span>
                    <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, opacity: 0.7, background: "rgba(255,255,255,0.15)", padding: "4px 10px", borderRadius: 20 }}>
                      {meta.ext}
                    </span>
                  </div>
                  <div style={{ position: "relative" }}>
                    <p style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 4, wordBreak: "break-word" }}>{meta.name}</p>
                    <p style={{ fontSize: 11.5, opacity: 0.65 }}>Submitted by {submitterName}</p>
                  </div>
                  
                    <a href={url} target="_blank" rel="noreferrer" className="sfm-open-btn" style={{ position: "relative", marginTop: 18, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#fff", color: "#14132B", textDecoration: "none", borderRadius: 12, padding: "10px 0", fontSize: 13, fontWeight: 700 }}>Open File <Icon.arrow width={13} height={13} /></a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}



export default function ReviewList({
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
  const [scores, setScores] = useState<Record<string, string>>({});
  const [criterionInputs, setCriterionInputs] = useState<Record<string, Record<string, string>>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [rubric, setRubric] = useState<any[]>([]);
  const [rubricLoading, setRubricLoading] = useState(true);
  const [rubricError, setRubricError] = useState("");
  const [viewingSubmission, setViewingSubmission] = useState<any>(null);
  const [aiLoadingId, setAiLoadingId] = useState<string | null>(null);
  const [aiResults, setAiResults] = useState<Record<string, { score: number; feedback: string }>>({});
  const [aiError, setAiError] = useState<Record<string, string>>({});



  async function runAiReview(submissionId: string) {
    setAiLoadingId(submissionId);
    setAiError((prev) => ({ ...prev, [submissionId]: "" }));
    try {
      const res = await fetch(`/api/submissions/${submissionId}/ai-review`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setAiError((prev) => ({ ...prev, [submissionId]: data.error || "AI review failed" }));
      } else {
        setAiResults((prev) => ({ ...prev, [submissionId]: { score: data.score, feedback: data.feedback } }));
      }
    } catch {
      setAiError((prev) => ({ ...prev, [submissionId]: "AI review failed, try again" }));
    }
    setAiLoadingId(null);
  }

  async function acceptAiScore(submissionId: string, aiScore100: number, aiFeedback: string) {
    setSavingId(submissionId);
    setError("");
    const scoreOutOf10 = Math.round((aiScore100 / 100) * 10);
    try {
      const res = await fetch("/api/submissions/" + submissionId + "/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: scoreOutOf10, feedback: aiFeedback }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to accept AI score");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not save the review. Check your connection and try again.");
    } finally {
      setSavingId(null);
    }
  }

  useEffect(() => {
    if (!selectedChallengeId) return;
    const controller = new AbortController();
    setRubricLoading(true);
    setRubricError("");
    fetch(`/api/challenges/${selectedChallengeId}/rubric`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error("Unable to load scoring criteria.");
        return r.json();
      })
      .then((d) => {
        setRubric(d.criteria || []);
        setRubricLoading(false);
      })
      .catch((error) => {
        if (error instanceof Error && error.name === "AbortError") return;
        setRubric([]);
        setRubricLoading(false);
        setRubricError("Scoring criteria could not be loaded. Standard scoring is available.");
      })
    return () => controller.abort();
  }, [selectedChallengeId]);

  function changeChallenge(id: string) {
    router.push("/dashboard/review?challenge=" + id);
  }

  function setCriterionScore(submissionId: string, criterionId: string, value: string) {
    setCriterionInputs((prev) => ({
      ...prev,
      [submissionId]: { ...(prev[submissionId] || {}), [criterionId]: value },
    }));
  }

  async function saveReview(submissionId: string) {
    setError("");

    let body: any = { feedback: feedbacks[submissionId] || "" };

    if (rubric.length > 0) {
      const inputs = criterionInputs[submissionId] || {};
      const criterionScores = rubric.map((c) => ({
        criterionId: c.id,
        score: parseInt(inputs[c.id] || "0"),
      }));
      if (criterionScores.some((cs) => isNaN(cs.score))) {
        setError("Fill in all criterion scores");
        return;
      }
      body.criterionScores = criterionScores;
    } else {
      const score = scores[submissionId];
      if (score === undefined || score === "") {
        setError("Enter a score first");
        return;
      }
      const num = parseInt(score);
      if (num < 0 || num > 10) {
        setError("Score must be between 0 and 10");
        return;
      }
      body.score = num;
    }

    setSavingId(submissionId);
    try {
      const res = await fetch("/api/submissions/" + submissionId + "/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to save review");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not save the review. Check your connection and try again.");
    } finally {
      setSavingId(null);
    }
  }

  const scoreInputStyle: React.CSSProperties = {
    padding: "9px 12px",
    borderRadius: 10,
    border: "1px solid rgba(109,74,255,0.15)",
    background: "rgba(109,74,255,0.05)",
    fontSize: 13,
    fontWeight: 700,
    color: "#4C2FCC",
    outline: "none",
    boxSizing: "border-box",
  };

  const feedbackInputStyle: React.CSSProperties = {
    padding: "9px 12px",
    borderRadius: 10,
    border: "1px solid rgba(109,74,255,0.12)",
    background: "rgba(109,74,255,0.04)",
    fontSize: 13,
    color: "#4C2FCC",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div>
      <style>{`
        @keyframes rlRise { from { opacity:0; transform: translateY(14px); } to { opacity:1; transform: translateY(0); } }
        .rl-anim { animation: rlRise 0.4s cubic-bezier(.2,.8,.2,1) both; }
        .tab-pill { transition: transform 0.15s ease; }
        .tab-pill:hover { transform: translateY(-1px); }
        .rl-score-input:focus { border-color: rgba(109,74,255,0.4) !important; box-shadow: 0 0 0 3px rgba(109,74,255,0.1); background: #fff !important; }
        .rl-feedback-input:focus { border-color: rgba(109,74,255,0.4) !important; box-shadow: 0 0 0 3px rgba(109,74,255,0.1); background: #fff !important; }
        .rl-save-btn { transition: transform 0.15s ease, box-shadow 0.2s ease; }
        .rl-save-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 18px rgba(20,19,43,0.2); }
        .rl-link { transition: all 0.15s ease; display: inline-flex; align-items: center; gap: 4px; }
        .rl-link:hover { gap: 7px; background: rgba(109,74,255,0.06) !important; }
        .rl-challenge-tabs { display: flex; gap: 8px; margin-bottom: 20px; overflow-x: auto; scrollbar-width: thin; }
        .rl-challenge-tabs > button { flex: 0 0 auto; }
        .rl-submission-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr)); gap: 18px; }
        @media (prefers-reduced-motion: reduce) { .rl-anim, .tab-pill, .rl-save-btn, .rl-link { animation: none; transition: none; } }
      `}</style>

      <div className="rl-challenge-tabs" role="group" aria-label="Choose a challenge">
        {challenges.map(function (c) {
          const isActive = c.id === selectedChallengeId;
          return (
            <button
              key={c.id}
              className="tab-pill"
              onClick={function () { changeChallenge(c.id); }}
              aria-pressed={isActive}
              style={{
                padding: "8px 14px",
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

      {rubric.length > 0 && !rubricLoading && (
        <div style={{ background: "rgba(109,74,255,0.06)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 12.5, color: "#6D4AFF", fontWeight: 600 }}>
          This challenge uses rubric scoring: {rubric.map((c: any) => c.name).join(", ")}
        </div>
      )}

      {rubricError && (
        <div role="status" style={{ background: "rgba(109,74,255,0.06)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 12.5, color: "#6D4AFF", fontWeight: 600 }}>
          {rubricError}
        </div>
      )}

      {error ? (
        <div style={{ background: "rgba(255,70,70,0.05)", border: "1px solid rgba(255,70,70,0.15)", borderRadius: 10, padding: "10px 14px", color: "#d32f2f", fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      ) : null}

      {submissions.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.07)", padding: 50, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.25 }}>📭</div>
          <p style={{ color: "rgba(20,19,43,0.4)", fontSize: 14 }}>No submissions for this challenge yet.</p>
        </div>
      ) : (
        <div className="rl-submission-grid">
          {submissions.map(function (s, i) {
            const submitterName = s.user ? s.user.name : (s.team ? s.team.name : "Unknown");
            const alreadyScored = !!s.review;

            return (
              <div key={s.id} className="rl-anim" style={{ animationDelay: `${Math.min(i * 0.05, 0.3)}s` }}>
                <TiltCard
                  intensity={2}
                  glow="rgba(109,74,255,0.08)"
                  style={{
                    background: "#fff",
                    borderRadius: 18,
                    border: alreadyScored ? "1px solid rgba(22,163,74,0.15)" : "1px solid rgba(15,23,42,0.07)",
                    padding: 20,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, fontWeight: 700, flexShrink: 0 }}>
                          {submitterName[0]?.toUpperCase()}
                        </div>
                        <div style={{ fontSize: 14.5, fontWeight: 700, color: "#14132B" }}>{submitterName}</div>
                      </div>
                      <button
                        onClick={() => setViewingSubmission(s)}
                        className="rl-link"
                        style={{ fontSize: 12, color: "#6D4AFF", marginTop: 6, fontWeight: 600, background: "none", border: "none", padding: "3px 6px", borderRadius: 8, cursor: "pointer" }}
                      >
                        View submission <Icon.arrow width={10} height={10} />
                      </button>
                    </div>
                    {alreadyScored ? (
                      <span style={{ fontSize: 11.5, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: "rgba(22,163,74,0.1)", color: "#15803D", whiteSpace: "nowrap" }}>
                        {"✓ " + s.review.score + "/10"}
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: "rgba(245,158,11,0.1)", color: "#B45309", whiteSpace: "nowrap" }}>
                        Pending
                      </span>
                    )}
                  </div>

                  {s.description ? (
                    <p style={{ fontSize: 12.5, color: "rgba(20,19,43,0.6)", marginBottom: 14, lineHeight: 1.5, background: "#F6F5FB", padding: "10px 12px", borderRadius: 10 }}>
                      {s.description}
                    </p>
                  ) : null}

                  <div style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px solid rgba(15,23,42,0.06)", display: "flex", flexDirection: "column", gap: 10 }}>
                    {rubric.length > 0 ? (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
                        {rubric.map((c: any) => (
                          <div key={c.id}>
                            <label style={{ fontSize: 10.5, fontWeight: 600, color: "rgba(20,19,43,0.5)", display: "block", marginBottom: 4 }}>
                              {c.name} (/{c.maxScore})
                            </label>
                            <input
                              type="number"
                              className="rl-score-input"
                              min={0}
                              max={c.maxScore}
                              value={criterionInputs[s.id]?.[c.id] ?? ""}
                              onChange={(e) => setCriterionScore(s.id, c.id, e.target.value)}
                              style={{ ...scoreInputStyle, width: "100%" }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="number"
                        className="rl-score-input"
                        min={0}
                        max={10}
                        placeholder={alreadyScored ? String(s.review.score) : "Score /10"}
                        value={scores[s.id] !== undefined ? scores[s.id] : ""}
                        onChange={function (e) {
                          const next = Object.assign({}, scores);
                          next[s.id] = e.target.value;
                          setScores(next);
                        }}
                        style={{ ...scoreInputStyle, width: 100 }}
                      />
                    )}

                    <input
                      type="text"
                      className="rl-feedback-input"
                      placeholder={alreadyScored ? (s.review.feedback || "Feedback") : "Feedback (optional)"}
                      value={feedbacks[s.id] !== undefined ? feedbacks[s.id] : ""}
                      onChange={function (e) {
                        const next = Object.assign({}, feedbacks);
                        next[s.id] = e.target.value;
                        setFeedbacks(next);
                      }}
                      style={feedbackInputStyle}
                    />



                    <button
                      className="rl-save-btn"
                      onClick={function () { saveReview(s.id); }}
                      disabled={savingId === s.id}
                      style={{
                        background: "#14132B",
                        color: "#fff",
                        border: "none",
                        borderRadius: 10,
                        padding: "10px 0",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                        opacity: savingId === s.id ? 0.6 : 1,
                      }}
                    >
                      {savingId === s.id ? "Saving..." : alreadyScored ? "Update Score" : "Save Score"}
                    </button>

                    {aiReviewEnabled && (
                      <>
                        <button
                          className="rl-save-btn"
                          onClick={() => runAiReview(s.id)}
                          disabled={aiLoadingId === s.id}
                          style={{
                            background: "rgba(109,74,255,0.08)",
                            color: "#6D4AFF",
                            border: "1px solid rgba(109,74,255,0.2)",
                            borderRadius: 10,
                            padding: "10px 0",
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: "pointer",
                            opacity: aiLoadingId === s.id ? 0.6 : 1,
                          }}
                        >
                          {aiLoadingId === s.id ? "Running AI Review..." : (s.aiReview || aiResults[s.id]) ? "Re-run AI Review" : "Run AI Review"}
                        </button>

                        {aiError[s.id] && (
                          <div style={{ fontSize: 11.5, color: "#B91C1C", background: "rgba(220,38,38,0.06)", padding: "6px 10px", borderRadius: 8 }}>
                            {aiError[s.id]}
                          </div>
                        )}



                        {(aiResults[s.id] || s.aiReview) && (
                          <div style={{ background: "rgba(109,74,255,0.05)", border: "1px solid rgba(109,74,255,0.12)", borderRadius: 10, padding: "10px 12px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: "#6D4AFF", textTransform: "uppercase", letterSpacing: 0.4 }}>AI Score</span>
                              <span style={{ fontSize: 13, fontWeight: 700, color: "#4C2FCC" }}>
                                {(aiResults[s.id]?.score ?? s.aiReview?.score)}/100
                                <span style={{ fontSize: 10.5, fontWeight: 600, color: "rgba(76,47,204,0.6)", marginLeft: 4 }}>
                                  (≈ {Math.round(((aiResults[s.id]?.score ?? s.aiReview?.score) / 100) * 10)}/10)
                                </span>
                              </span>
                            </div>
                            <p style={{ fontSize: 12, color: "rgba(20,19,43,0.65)", lineHeight: 1.5, marginBottom: 8 }}>
                              {aiResults[s.id]?.feedback ?? s.aiReview?.feedback}
                            </p>
                            <button
                              onClick={() => {
                                const score = aiResults[s.id]?.score ?? s.aiReview?.score;
                                const feedback = aiResults[s.id]?.feedback ?? s.aiReview?.feedback;
                                acceptAiScore(s.id, score, feedback);
                              }}
                              disabled={savingId === s.id}
                              style={{
                                width: "100%",
                                background: "#6D4AFF",
                                color: "#fff",
                                border: "none",
                                borderRadius: 8,
                                padding: "8px 0",
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: "pointer",
                                opacity: savingId === s.id ? 0.6 : 1,
                              }}
                            >
                              {savingId === s.id ? "Saving..." : "Accept as Official Score"}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </TiltCard>
              </div>
            );
          })}
        </div>
      )}

      {viewingSubmission && (
        <SubmissionFilesModal submission={viewingSubmission} onClose={() => setViewingSubmission(null)} />
      )}
    </div>
  );
}
