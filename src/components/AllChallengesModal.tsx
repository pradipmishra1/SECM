"use client";

import { useState, useEffect } from "react";
import ProfileModal from "./ProfileModal";

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: "Draft", color: "#6B7280", bg: "rgba(107,114,128,0.1)" },
  PUBLISHED: { label: "Live", color: "#15803D", bg: "rgba(22,163,74,0.1)" },
  CLOSED: { label: "Closed", color: "#B91C1C", bg: "rgba(220,38,38,0.1)" },
  COMPLETED: { label: "Ended", color: "#6B7280", bg: "rgba(107,114,128,0.1)" },
};

function getEffectiveStatus(c: any): string {
  const isPastDeadline = new Date(c.deadline).getTime() < Date.now();
  if (isPastDeadline && (c.status === "PUBLISHED" || c.status === "CLOSED")) return "CLOSED";
  return c.status;
}

export default function AllChallengesModal({ challenges, onClose }: { challenges: any[]; onClose: () => void }) {
  const [selected, setSelected] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<string | null>(null);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    fetch(`/api/challenges/${selected.id}/submissions`)
      .then((r) => r.json())
      .then((d) => {
        setSubmissions(d.submissions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selected]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(20,19,43,0.5)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 150, animation: "acmFadeBg 0.2s ease",
      }}
    >
      <style>{`
        @keyframes acmFadeBg { from { opacity:0 } to { opacity:1 } }
        @keyframes acmPop { from { opacity:0; transform: scale(0.95) translateY(10px); } to { opacity:1; transform: scale(1) translateY(0); } }
        .acm-card { transition: transform 0.15s ease, box-shadow 0.2s ease, border-color 0.2s ease; cursor: pointer; }
        .acm-card:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(109,74,255,0.15); border-color: rgba(109,74,255,0.25) !important; }
        .acm-back { transition: gap 0.15s ease; display: inline-flex; align-items: center; gap: 4px; cursor: pointer; }
        .acm-back:hover { gap: 8px; }
        .acm-sub-row { transition: background 0.15s ease; }
        .acm-sub-row:hover { background: #F6F5FB !important; }
        .acm-name-btn { transition: color 0.15s ease; cursor: pointer; background: none; border: none; padding: 0; font: inherit; }
        .acm-name-btn:hover { color: #6D4AFF !important; text-decoration: underline; }
      `}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 24, padding: 28, width: 560, maxHeight: "80vh", overflowY: "auto",
          animation: "acmPop 0.3s cubic-bezier(.2,.8,.2,1)", boxShadow: "0 30px 60px rgba(20,19,43,0.25)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            {selected ? (
              <span className="acm-back" onClick={() => setSelected(null)} style={{ fontSize: 12.5, color: "#6D4AFF", fontWeight: 700, marginBottom: 4, display: "inline-flex" }}>
                ← Back to all challenges
              </span>
            ) : null}
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, color: "#14132B", marginTop: selected ? 4 : 0 }}>
              {selected ? selected.title : "All Challenges"}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: "rgba(20,19,43,0.05)", border: "none", borderRadius: 8, width: 28, height: 28, cursor: "pointer", fontSize: 15, color: "rgba(20,19,43,0.5)" }}>✕</button>
        </div>

        {!selected ? (
          challenges.length === 0 ? (
            <p style={{ fontSize: 13.5, color: "rgba(20,19,43,0.4)", textAlign: "center", padding: "30px 0" }}>No challenges yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {challenges.map((c) => {
                const s = STATUS_STYLES[getEffectiveStatus(c)] || STATUS_STYLES.DRAFT;
                return (
                  <div
                    key={c.id}
                    className="acm-card"
                    onClick={() => setSelected(c)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 14, border: "1px solid rgba(15,23,42,0.07)" }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#14132B" }}>{c.title}</div>
                      <div style={{ fontSize: 12, color: "rgba(20,19,43,0.45)", marginTop: 3 }}>
                        {c._count?.submissions || 0} submission{(c._count?.submissions || 0) !== 1 ? "s" : ""} · {c._count?.participations || 0} participant{(c._count?.participations || 0) !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <span style={{ fontSize: 11.5, fontWeight: 700, padding: "4px 10px", borderRadius: 20, color: s.color, background: s.bg, whiteSpace: "nowrap" }}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )
        ) : loading ? (
          <p style={{ fontSize: 13.5, color: "rgba(20,19,43,0.4)", textAlign: "center", padding: "30px 0" }}>Loading submissions...</p>
        ) : submissions.length === 0 ? (
          <p style={{ fontSize: 13.5, color: "rgba(20,19,43,0.4)", textAlign: "center", padding: "30px 0" }}>No submissions yet for this challenge.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {submissions.map((s: any) => {
              const submitterName = s.user?.name || s.team?.name || "Unknown";
              const username = s.user?.username;
              return (
                <div key={s.id} className="acm-sub-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, fontWeight: 700, flexShrink: 0 }}>
                      {submitterName[0]?.toUpperCase()}
                    </div>
                    <div>
                      {username ? (
                        <button className="acm-name-btn" onClick={() => setViewingProfile(username)} style={{ fontSize: 13.5, fontWeight: 700, color: "#14132B" }}>
                          {submitterName}
                        </button>
                      ) : (
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: "#14132B" }}>{submitterName}</span>
                      )}
                      <div style={{ fontSize: 11.5, color: "rgba(20,19,43,0.4)" }}>
                        {new Date(s.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {s.review ? (
                    <span style={{ fontSize: 11.5, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: "rgba(22,163,74,0.1)", color: "#15803D" }}>
                      {s.review.score}/10
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: "rgba(245,158,11,0.1)", color: "#B45309" }}>
                      Pending
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {viewingProfile && <ProfileModal username={viewingProfile} onClose={() => setViewingProfile(null)} />}
    </div>
  );
}