"use client";

import React, { useState, useRef } from "react";
import TiltCard from "./TiltCard";
import { Icon } from "./icons";

const CARD_THEMES = [
  { bg: "linear-gradient(135deg, #FFF0F0 0%, #FFDCE0 100%)", blob: "rgba(239,68,68,0.15)", accent: "#DC2626" },
  { bg: "linear-gradient(135deg, #F0EDFF 0%, #E6E0FF 100%)", blob: "rgba(109,74,255,0.18)", accent: "#6D4AFF" },
  { bg: "linear-gradient(135deg, #E8F9F1 0%, #D3F3E3 100%)", blob: "rgba(22,163,74,0.16)", accent: "#15803D" },
  { bg: "linear-gradient(135deg, #FFF7E8 0%, #FFEFD1 100%)", blob: "rgba(245,158,11,0.18)", accent: "#D97706" },
  { bg: "linear-gradient(135deg, #E9F3FF 0%, #D6E9FF 100%)", blob: "rgba(37,99,235,0.16)", accent: "#2563EB" },
  { bg: "linear-gradient(135deg, #FDF0FF 0%, #F7DFFF 100%)", blob: "rgba(192,38,211,0.16)", accent: "#A21CAF" },
  { bg: "linear-gradient(135deg, #FFF0F5 0%, #FFDCEB 100%)", blob: "rgba(236,72,153,0.16)", accent: "#DB2777" },
  { bg: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)", blob: "rgba(5,150,105,0.16)", accent: "#047857" },
];

function getTheme(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return CARD_THEMES[hash % CARD_THEMES.length];
}

function getFileMeta(url: string) {
  const clean = url.split("?")[0];
  const ext = clean.split(".").pop()?.toLowerCase() || "";
  const name = decodeURIComponent(clean.split("/").pop() || "submission file");
  const isImage = ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext);
  const isPdf = ext === "pdf";
  return { name, ext: ext.toUpperCase() || "FILE", isImage, isPdf };
}

function OpenLink({ url }: { url: string }) {
  return React.createElement(
    "a",
    {
      href: url,
      target: "_blank",
      rel: "noopener noreferrer",
      style: { fontSize: 12, fontWeight: 700, color: "#6D4AFF", textDecoration: "none", background: "rgba(109,74,255,0.08)", padding: "6px 12px", borderRadius: 8 },
    },
    "Open in new tab"
  );
}

function OpenFileLink({ url }: { url: string }) {
  return React.createElement(
    "a",
    {
      href: url,
      target: "_blank",
      rel: "noopener noreferrer",
      style: { display: "inline-block", background: "#14132B", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700 },
    },
    "Open File"
  );
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
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,19,43,0.6)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 300,
        padding: 24,
      }}
    >
      <style>{`
        @keyframes pmPop { from { opacity:0; transform: scale(0.95) translateY(10px); } to { opacity:1; transform: scale(1) translateY(0); } }
        .pm-close { transition: transform 0.15s ease, background 0.15s ease; }
        .pm-close:hover { transform: rotate(90deg); background: rgba(255,255,255,0.25) !important; }
      `}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 20,
          width: meta.isImage || meta.isPdf ? "min(900px, 92vw)" : 400,
          height: meta.isImage || meta.isPdf ? "min(85vh, 800px)" : "auto",
          overflow: "hidden",
          animation: "pmPop 0.25s cubic-bezier(.2,.8,.2,1)",
          boxShadow: "0 30px 60px rgba(20,19,43,0.3)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid rgba(15,23,42,0.06)", flexShrink: 0 }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: "#14132B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{meta.name}</span>
         <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0, marginLeft: 12 }}>
            <OpenLink url={url} />
            <button className="pm-close" onClick={onClose} style={{ background: "rgba(20,19,43,0.05)", border: "none", borderRadius: 8, width: 28, height: 28, cursor: "pointer", fontSize: 14, color: "rgba(20,19,43,0.5)" }}>
              ✕
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflow: "auto", background: "#F6F5FB", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {meta.isImage ? (
            <img src={url} alt={meta.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
          ) : meta.isPdf ? (
            <iframe src={url} title={meta.name} style={{ width: "100%", height: "100%", border: "none" }} />
          ) : (
            <div style={{ padding: 50, textAlign: "center" }}>
              <div style={{ fontSize: 34, marginBottom: 12, opacity: 0.4 }}>📎</div>
              <p style={{ fontSize: 13, color: "rgba(20,19,43,0.5)", marginBottom: 16 }}>
                This file type ({meta.ext}) can't be previewed here.
              </p>
              
              <OpenFileLink url={url} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SpotlightCard({ theme, children }: { theme: { bg: string; blob: string; accent: string }; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      style={{
        background: theme.bg,
        borderRadius: 20,
        border: "1px solid rgba(15,23,42,0.05)",
        boxShadow: "0 8px 26px rgba(20,19,43,0.08)",
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle 180px at ${pos.x}% ${pos.y}%, rgba(255,255,255,0.55), transparent 70%)`,
          pointerEvents: "none",
          transition: "background 0.05s linear",
        }}
      />
      <div style={{ position: "absolute", top: -30, right: -30, width: 110, height: 110, borderRadius: "50%", background: theme.blob }} />
      <div style={{ position: "absolute", bottom: -40, left: -20, width: 90, height: 90, borderRadius: "50%", background: theme.blob, opacity: 0.6 }} />
      {children}
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
        <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.25 }}>📤</div>
        <p style={{ color: "rgba(20,19,43,0.4)", fontSize: 14 }}>You haven't submitted any work yet.</p>
      </div>
    );
  }

  const reviewedCount = submissions.filter((s) => !!s.review).length;
  const pendingCount = submissions.length - reviewedCount;

  return (
    <div>
      <style>{`
        @keyframes subRise { from { opacity:0; transform: translateY(14px); } to { opacity:1; transform: translateY(0); } }
        .sub-anim { animation: subRise 0.4s cubic-bezier(.2,.8,.2,1) both; transition: transform 0.25s cubic-bezier(.2,.8,.2,1), box-shadow 0.25s ease; }
        .sub-anim:hover { transform: translateY(-5px) scale(1.01); }
        .sub-preview-btn { transition: gap 0.15s ease, transform 0.15s ease, box-shadow 0.2s ease; cursor: pointer; }
        .sub-preview-btn:hover { gap: 9px; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(20,19,43,0.15) !important; }
        .tab-pill { transition: transform 0.15s ease; }
        .tab-pill:hover { transform: translateY(-1px); }
      `}</style>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { key: "ALL", label: `All (${submissions.length})` },
          { key: "REVIEWED", label: `Reviewed (${reviewedCount})` },
          { key: "PENDING", label: `Pending (${pendingCount})` },
        ].map((t) => (
          <button
            key={t.key}
            className="tab-pill"
            onClick={() => setFilter(t.key as any)}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              border: "none",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
          {filtered.map((s, i) => {
            const isReviewed = !!s.review;
            const theme = getTheme(s.id);
            return (
              <div key={s.id} className="sub-anim" style={{ animationDelay: `${Math.min(i * 0.05, 0.3)}s` }}>
                <TiltCard intensity={2} glow={theme.blob} style={{ height: "100%", background: "transparent", padding: 0, border: "none" }}>
                  <SpotlightCard theme={theme}>
                    <div style={{ padding: 22, display: "flex", flexDirection: "column", flex: 1, position: "relative" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 13,
                              background: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: theme.accent,
                              flexShrink: 0,
                              boxShadow: "0 6px 16px rgba(20,19,43,0.12)",
                            }}
                          >
                            <Icon.flag width={18} height={18} />
                          </div>
                          <div>
                            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 800, color: "#14132B", lineHeight: 1.3 }}>{s.challenge.title}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                              <span style={{ fontSize: 12, color: "rgba(20,19,43,0.5)", fontWeight: 600 }}>{s.challenge.organizer?.orgName || "Organizer"}</span>
                              {s.challenge.organizer?.isVerified && <VerifiedTick />}
                            </div>
                          </div>
                        </div>

                        {isReviewed ? (
                          <span style={{ fontSize: 13, fontWeight: 800, fontFamily: "'Sora', sans-serif", padding: "6px 14px", borderRadius: 30, background: "#fff", color: theme.accent, whiteSpace: "nowrap", flexShrink: 0, boxShadow: "0 4px 10px rgba(20,19,43,0.1)" }}>
                            {s.review.score}/10
                          </span>
                        ) : (
                          <span style={{ fontSize: 11.5, fontWeight: 700, padding: "6px 14px", borderRadius: 30, background: "rgba(255,255,255,0.7)", color: "rgba(20,19,43,0.5)", whiteSpace: "nowrap", flexShrink: 0 }}>
                            Pending
                          </span>
                        )}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(20,19,43,0.5)", marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${theme.blob}`, fontWeight: 500 }}>
                        <Icon.clock width={12} height={12} style={{ opacity: 0.7 }} />
                        Submitted {new Date(s.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>

                      {s.description && (
                        <p style={{ fontSize: 12.5, color: "rgba(20,19,43,0.65)", marginBottom: 14, lineHeight: 1.6 }}>
                          {s.description}
                        </p>
                      )}

                      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
                        {s.fileUrl && (
                          <button
                            className="sub-preview-btn"
                            onClick={() => setPreviewUrl(s.fileUrl)}
                            style={{
                              fontSize: 12.5,
                              fontWeight: 700,
                              color: theme.accent,
                              background: "#fff",
                              border: "none",
                              padding: "9px 14px",
                              borderRadius: 10,
                              justifyContent: "center",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              boxShadow: "0 3px 10px rgba(20,19,43,0.08)",
                            }}
                          >
                            <Icon.upload width={13} height={13} />
                            View Submission
                          </button>
                        )}

                        {isReviewed && (
                          s.review.feedback ? (
                            <div style={{ background: "#fff", padding: "12px 14px", borderRadius: 12, borderLeft: `3px solid ${theme.accent}`, boxShadow: "0 3px 10px rgba(20,19,43,0.06)" }}>
                              <div style={{ fontSize: 10.5, fontWeight: 700, color: theme.accent, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                                Organizer Feedback
                              </div>
                              <p style={{ fontSize: 12.5, color: "rgba(20,19,43,0.7)", lineHeight: 1.55, margin: 0 }}>
                                {s.review.feedback}
                              </p>
                            </div>
                          ) : (
                            <p style={{ fontSize: 12, color: "rgba(20,19,43,0.4)", fontStyle: "italic", margin: 0 }}>No written feedback provided.</p>
                          )
                        )}
                      </div>
                    </div>
                  </SpotlightCard>
                </TiltCard>
              </div>
            );
          })}
        </div>
      )}

      {previewUrl && <PreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />}
    </div>
  );
}