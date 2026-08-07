"use client";

import TiltCard from "./TiltCard";
import { Icon } from "./icons";

function VerifiedTick() {
  return (
    <span
      title="Verified Organizer"
      style={{
        color: "#2563EB",
        display: "inline-flex",
        flexShrink: 0,
        filter: "drop-shadow(0 0 4px rgba(37,99,235,0.6))",
        transition: "filter 0.2s",
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.4 2.2 3.2-.6.8 3.2 3 1.5-1.2 3.1 1.2 3.1-3 1.5-.8 3.2-3.2-.6L12 22l-2.4-2.2-3.2.6-.8-3.2-3-1.5 1.2-3.1L2.6 9.5l3-1.5.8-3.2 3.2.6L12 2z" />
        <path
          d="M9 12l2 2 4-4"
          stroke="#fff"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

import { useState } from "react";

export default function SubmissionsListView({ submissions }: { submissions: any[] }) {
  const [filter, setFilter] = useState<"ALL" | "REVIEWED" | "PENDING">("ALL");

  const filtered = submissions.filter((s) => {
    if (filter === "REVIEWED") return !!s.review;
    if (filter === "PENDING") return !s.review;
    return true;
  });

  if (submissions.length === 0) {
    return (
      <div
        style={{
          background: "linear-gradient(145deg, #ffffff 0%, #f8f7ff 100%)",
          borderRadius: 24,
          border: "1px solid rgba(109,74,255,0.1)",
          boxShadow: "0 12px 30px rgba(109,74,255,0.08), 0 0 0 1px rgba(109,74,255,0.05)",
          padding: 50,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.2, filter: "grayscale(0.5)" }}>📤</div>
        <p style={{ color: "rgba(20,19,43,0.4)", fontSize: 14, fontWeight: 500 }}>You haven't submitted any work yet.</p>
      </div>
    );
  }

  const reviewedCount = submissions.filter((s) => !!s.review).length;
  const pendingCount = submissions.length - reviewedCount;

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {[
          { key: "ALL", label: `All (${submissions.length})` },
          { key: "REVIEWED", label: `Reviewed (${reviewedCount})` },
          { key: "PENDING", label: `Pending (${pendingCount})` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key as any)}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              border: "none",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: filter === t.key ? "linear-gradient(135deg,#6D4AFF,#8B5CF6)" : "rgba(20,19,43,0.05)",
              color: filter === t.key ? "#fff" : "rgba(20,19,43,0.6)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.07)", padding: 40, textAlign: "center" }}>
          <p style={{ color: "rgba(20,19,43,0.4)", fontSize: 14 }}>No {filter.toLowerCase()} submissions.</p>
        </div>
      ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <style>{`
        @keyframes subRiseIn {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .sub-anim {
          animation: subRiseIn 0.5s cubic-bezier(0.22, 0.61, 0.36, 1) both;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .sub-anim:hover {
          transform: translateY(-2px);
        }
        .score-glow {
          animation: scoreGlow 2.4s ease-in-out infinite, scoreShift 3s ease-in-out infinite;
          box-shadow: 0 0 0 0 rgba(22,163,74,0.2);
          position: relative;
          overflow: hidden;
        }
        @keyframes scoreGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(22,163,74,0.25); }
          50% { box-shadow: 0 0 0 10px rgba(22,163,74,0); }
        }
        @keyframes scoreShift {
          0%, 100% { background: linear-gradient(135deg, rgba(22,163,74,0.12) 0%, rgba(5,150,105,0.08) 100%); }
          50% { background: linear-gradient(135deg, rgba(5,150,105,0.12) 0%, rgba(22,163,74,0.08) 100%); }
        }
        .pending-pulse {
          animation: pendingPulse 2s ease-in-out infinite, pendingGlow 2s ease-in-out infinite;
          box-shadow: 0 0 0 0 rgba(217,119,6,0.3);
        }
        @keyframes pendingPulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.03); }
        }
        @keyframes pendingGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(217,119,6,0.4); }
          50% { box-shadow: 0 0 0 12px rgba(217,119,6,0); }
        }
        .shimmer-overlay {
          position: absolute;
          top: 0;
          left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,0.3),
            transparent
          );
          transform: skewX(-20deg);
          transition: none;
        }
        .sub-anim:hover .shimmer-overlay {
          left: 120%;
          transition: left 0.8s ease;
        }
      `}</style>

      {filtered.map((s, i) => {
        const isReviewed = !!s.review;
        return (
          <div
            key={s.id}
            className="sub-anim"
            style={{
              animationDelay: `${i * 0.08}s`,
              position: "relative",
              borderRadius: 20,
              boxShadow: isReviewed
                ? "0 6px 24px rgba(22,163,74,0.08), 0 0 0 1px rgba(22,163,74,0.1)"
                : "0 6px 24px rgba(217,119,6,0.06), 0 0 0 1px rgba(217,119,6,0.08)",
              transition: "box-shadow 0.3s, transform 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = isReviewed
                ? "0 12px 36px rgba(22,163,74,0.18), 0 0 0 2px rgba(22,163,74,0.25)"
                : "0 12px 36px rgba(217,119,6,0.14), 0 0 0 2px rgba(217,119,6,0.2)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = isReviewed
                ? "0 6px 24px rgba(22,163,74,0.08), 0 0 0 1px rgba(22,163,74,0.1)"
                : "0 6px 24px rgba(217,119,6,0.06), 0 0 0 1px rgba(217,119,6,0.08)";
            }}
          >
            {/* Shimmer overlay */}
            <div className="shimmer-overlay" style={{ pointerEvents: "none" }} />

            <TiltCard
              intensity={2}
              glow={isReviewed ? "rgba(22,163,74,0.12)" : "rgba(217,119,6,0.12)"}
              style={{
                background: "linear-gradient(145deg, #ffffff 0%, #faf9ff 100%)",
                borderRadius: 20,
                border: "1px solid rgba(109,74,255,0.08)",
                padding: 24,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 14,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 13,
                      background: "linear-gradient(135deg, #6D4AFF, #A78BFA)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      flexShrink: 0,
                      boxShadow: "0 6px 15px rgba(109,74,255,0.3)",
                    }}
                  >
                    <Icon.flag width={18} height={18} />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontFamily: "'Sora', sans-serif",
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#14132B",
                        margin: 0,
                        lineHeight: 1.2,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {s.challenge.title}
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginTop: 3,
                      }}
                    >
                      <span style={{ fontSize: 12.5, color: "rgba(20,19,43,0.5)", fontWeight: 500 }}>
                        {s.challenge.organizer?.orgName || "Organizer"}
                      </span>
                      {s.challenge.organizer?.isVerified && <VerifiedTick />}
                    </div>
                  </div>
                </div>

                {isReviewed ? (
                  <span
                    className="score-glow"
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: "#065F46",
                      padding: "6px 16px",
                      borderRadius: 30,
                      flexShrink: 0,
                      fontFamily: "'Sora', sans-serif",
                      background: "linear-gradient(135deg, rgba(22,163,74,0.12) 0%, rgba(5,150,105,0.08) 100%)",
                      border: "1px solid rgba(22,163,74,0.2)",
                      backdropFilter: "blur(4px)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {s.review.score}/10
                  </span>
                ) : (
                  <span
                    className="pending-pulse"
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      background: "linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(217,119,6,0.08) 100%)",
                      color: "#92400E",
                      padding: "6px 16px",
                      borderRadius: 30,
                      flexShrink: 0,
                      border: "1px solid rgba(245,158,11,0.2)",
                      backdropFilter: "blur(4px)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    Pending Review
                  </span>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 12,
                  color: "rgba(20,19,43,0.45)",
                  marginBottom: isReviewed || s.description ? 12 : 0,
                }}
              >
                <Icon.clock width={13} height={13} style={{ opacity: 0.5 }} />
                <span style={{ fontWeight: 500 }}>
                  Submitted{" "}
                  {new Date(s.submittedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              {s.description && (
                <p
                  style={{
                    fontSize: 13,
                    color: "rgba(20,19,43,0.65)",
                    lineHeight: 1.6,
                    marginBottom: 12,
                    paddingLeft: 2,
                    fontWeight: 400,
                  }}
                >
                  {s.description}
                </p>
              )}

              {s.fileUrl && (
                
                  <a href={s.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: "#6D4AFF",
                    textDecoration: "none",
                    marginBottom: isReviewed ? 12 : 0,
                  }}
                >
                  <Icon.upload width={13} height={13} />
                  View Submission
                </a>
              )}

              {isReviewed && s.review.feedback && (
                <div
                  style={{
                    background: "linear-gradient(105deg, #F8F6FF 0%, #F4F2FF 100%)",
                    borderRadius: 14,
                    padding: "12px 16px",
                    borderLeft: "3px solid #6D4AFF",
                    boxShadow: "inset 0 1px 4px rgba(109,74,255,0.06)",
                    position: "relative",
                  }}
                >
                  <p
                    style={{
                      fontSize: 12.5,
                      color: "rgba(20,19,43,0.7)",
                      fontStyle: "italic",
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    “{s.review.feedback}”
                  </p>
                </div>
              )}

              {isReviewed && !s.review.feedback && (
                <p
                  style={{
                    fontSize: 12,
                    color: "rgba(20,19,43,0.35)",
                    fontStyle: "italic",
                    margin: 0,
                  }}
                >
                  No written feedback provided.
                </p>
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