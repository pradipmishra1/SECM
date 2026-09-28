"use client";

import React, { useEffect, useState } from "react";
import { Icon } from "./icons";

function getFileMeta(url: string) {
  const clean = url.split("?")[0];
  const ext = clean.split(".").pop()?.toLowerCase() || "";
  const name = decodeURIComponent(clean.split("/").pop() || "submission file");
  const isImage = ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext);
  const isPdf = ext === "pdf";
  return { name, ext: ext.toUpperCase() || "FILE", isImage, isPdf };
}

function scoreColor(score: number) {
  if (score >= 7) return { bg: "rgba(22,163,74,0.1)", text: "#15803D" };
  if (score >= 4) return { bg: "rgba(217,119,6,0.1)", text: "#B45309" };
  return { bg: "rgba(220,38,38,0.1)", text: "#DC2626" };
}

function VerifiedTick() {
  return (
    <span title="Verified Organizer" style={{ color: "#2563EB", display: "inline-flex", flexShrink: 0 }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.4 2.2 3.2-.6.8 3.2 3 1.5-1.2 3.1 1.2 3.1-3 1.5-.8 3.2-3.2-.6L12 22l-2.4-2.2-3.2.6-.8-3.2-3-1.5 1.2-3.1L2.6 9.5l3-1.5.8-3.2 3.2.6L12 2z" />
        <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function PreviewModal({ url, onClose }: { url: string; onClose: () => void }) {
  const meta = getFileMeta(url);
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
      style={{ position: "fixed", inset: 0, background: "rgba(20,19,43,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 24 }}
    >
      <style>{`@keyframes pmPop { from { opacity:0; transform: scale(0.96) translateY(8px); } to { opacity:1; transform: scale(1) translateY(0); } }`}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="submission-preview-title"
        style={{
          background: "#fff",
          borderRadius: 16,
          width: meta.isImage || meta.isPdf ? "min(880px, 92vw)" : "min(400px, 92vw)",
          height: meta.isImage || meta.isPdf ? "min(82vh, 760px)" : "auto",
          overflow: "hidden",
          animation: "pmPop 0.2s ease",
          boxShadow: "0 24px 50px rgba(20,19,43,0.28)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid rgba(15,23,42,0.06)", flexShrink: 0 }}>
          <span id="submission-preview-title" style={{ fontSize: 13.5, fontWeight: 700, color: "#14132B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{meta.name}</span>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0, marginLeft: 12 }}>
            <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 700, color: "#6D4AFF", textDecoration: "none", background: "rgba(109,74,255,0.08)", padding: "6px 12px", borderRadius: 8 }}>
              Open in new tab
            </a>
            <button onClick={onClose} style={{ background: "rgba(20,19,43,0.05)", border: "none", borderRadius: 8, width: 28, height: 28, cursor: "pointer", fontSize: 14, color: "rgba(20,19,43,0.5)" }}>✕</button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "auto", background: "#F6F5FB", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {meta.isImage ? (
            <img src={url} alt={meta.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
          ) : meta.isPdf ? (
            <iframe src={url} title={meta.name} style={{ width: "100%", height: "100%", border: "none" }} />
          ) : (
            <div style={{ padding: 50, textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "rgba(20,19,43,0.5)", marginBottom: 16 }}>This file type ({meta.ext}) can't be previewed here.</p>
              <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", background: "#14132B", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700 }}>
                Open File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SubmissionsListView({ submissions }: { submissions: any[] }) {
  const [filter, setFilter] = useState<"ALL" | "REVIEWED" | "PENDING">("ALL");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const filtered = submissions.filter((s) => {
    if (filter === "REVIEWED") return !!s.review;
    if (filter === "PENDING") return !s.review;
    return true;
  });

  if (submissions.length === 0) {
    return (
      <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.07)", padding: 50, textAlign: "center" }}>
        <p style={{ color: "rgba(20,19,43,0.4)", fontSize: 14 }}>You haven't submitted any work yet.</p>
      </div>
    );
  }

  const reviewedCount = submissions.filter((s) => !!s.review).length;
  const pendingCount = submissions.length - reviewedCount;

  return (
    <div>
      <style>{`
        @keyframes subRise { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
        .sub-card { animation: subRise 0.35s ease both; transition: box-shadow 0.2s ease, border-color 0.2s ease; }
        .sub-card:hover { box-shadow: 0 8px 24px rgba(20,19,43,0.08); border-color: rgba(109,74,255,0.2) !important; }
        .sub-view-btn { transition: background 0.15s ease; cursor: pointer; }
        .sub-view-btn:hover { background: rgba(109,74,255,0.08) !important; }
        .tab-pill { transition: transform 0.15s ease; }
        .tab-pill:hover { transform: translateY(-1px); }
        .sub-filter-group { max-width: 100%; }
        .submissions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr)); gap: 16px; align-items: start; }
        @media (prefers-reduced-motion: reduce) {
          .sub-card { animation: none; transition: none; }
          .sub-view-btn, .tab-pill { transition: none; }
        }
      `}</style>

      <div className="sub-filter-group" role="group" aria-label="Filter submissions" style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
        {[
          { key: "ALL", label: `All (${submissions.length})` },
          { key: "REVIEWED", label: `Reviewed (${reviewedCount})` },
          { key: "PENDING", label: `Pending (${pendingCount})` },
        ].map((t) => (
          <button
            key={t.key}
            className="tab-pill"
            onClick={() => setFilter(t.key as any)}
            aria-pressed={filter === t.key}
            style={{
              padding: "8px 16px",
              borderRadius: 10,
              border: "none",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              background: filter === t.key ? "#6D4AFF" : "rgba(15,23,42,0.05)",
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
        <div className="submissions-grid">
          {filtered.map((s, i) => {
            const isReviewed = !!s.review;
            const sc = isReviewed ? scoreColor(s.review.score) : null;
            return (
              <div
                key={s.id}
                className="sub-card"
                style={{
                  animationDelay: `${Math.min(i * 0.03, 0.24)}s`,
                  background: "#fff",
                  borderRadius: 16,
                  border: "1px solid rgba(15,23,42,0.08)",
                  padding: 18,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 14.5, fontWeight: 700, color: "#14132B", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.challenge.title}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                      <span style={{ fontSize: 11.5, color: "rgba(20,19,43,0.45)", fontWeight: 600 }}>{s.challenge.organizer?.orgName || "Organizer"}</span>
                      {s.challenge.organizer?.isVerified && <VerifiedTick />}
                    </div>
                  </div>

                  {isReviewed ? (
                    <span style={{ fontSize: 12.5, fontWeight: 800, fontFamily: "'Sora', sans-serif", padding: "5px 11px", borderRadius: 8, background: sc!.bg, color: sc!.text, whiteSpace: "nowrap", flexShrink: 0 }}>
                      {s.review.score}/10
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "5px 11px", borderRadius: 8, background: "rgba(15,23,42,0.05)", color: "rgba(20,19,43,0.45)", whiteSpace: "nowrap", flexShrink: 0 }}>
                      Pending
                    </span>
                  )}
                </div>

                {/* Date */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "rgba(20,19,43,0.45)", fontWeight: 500, paddingBottom: 10, borderBottom: "1px solid rgba(15,23,42,0.06)" }}>
                  <Icon.clock width={12} height={12} style={{ opacity: 0.6 }} />
                  {new Date(s.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </div>

                {/* Description */}
                {s.description && (
                  <p style={{ fontSize: 12.5, color: "rgba(20,19,43,0.6)", lineHeight: 1.55, margin: 0 }}>{s.description}</p>
                )}

                {/* Feedback */}
                {isReviewed && s.review.feedback && (
                  <div style={{ background: "#F6F5FB", padding: "10px 12px", borderRadius: 10, borderLeft: "3px solid #6D4AFF" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#6D4AFF", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 }}>
                      Feedback
                    </div>
                    <p style={{ fontSize: 12, color: "rgba(20,19,43,0.65)", lineHeight: 1.5, margin: 0 }}>{s.review.feedback}</p>
                  </div>
                )}

                {/* Footer button */}
                {s.fileUrl && (
                  <button
                    className="sub-view-btn"
                    onClick={() => setPreviewUrl(s.fileUrl)}
                    style={{
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: "#6D4AFF",
                      background: "rgba(109,74,255,0.06)",
                      border: "none",
                      padding: "9px 14px",
                      borderRadius: 9,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      marginTop: "auto",
                    }}
                  >
                    <Icon.upload width={13} height={13} />
                    View Submission
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {previewUrl && <PreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />}
    </div>
  );
}
