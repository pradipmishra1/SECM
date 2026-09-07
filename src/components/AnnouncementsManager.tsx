"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CARD_THEMES = [
  { bg: "linear-gradient(135deg, #F0EDFF 0%, #E6E0FF 100%)", blob: "rgba(109,74,255,0.18)", accent: "#6D4AFF" },
  { bg: "linear-gradient(135deg, #E9F3FF 0%, #D6E9FF 100%)", blob: "rgba(37,99,235,0.16)", accent: "#2563EB" },
  { bg: "linear-gradient(135deg, #FFF7E8 0%, #FFEFD1 100%)", blob: "rgba(245,158,11,0.18)", accent: "#D97706" },
  { bg: "linear-gradient(135deg, #E8F9F1 0%, #D3F3E3 100%)", blob: "rgba(22,163,74,0.16)", accent: "#15803D" },
  { bg: "linear-gradient(135deg, #FDF0FF 0%, #F7DFFF 100%)", blob: "rgba(192,38,211,0.16)", accent: "#A21CAF" },
  { bg: "linear-gradient(135deg, #FFF0F5 0%, #FFDCEB 100%)", blob: "rgba(236,72,153,0.16)", accent: "#DB2777" },
];

function getTheme(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return CARD_THEMES[hash % CARD_THEMES.length];
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function AnnouncementsManager({ announcements }: { announcements: any[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const MAX_MSG = 500;

  async function post() {
    setError("");
    if (!title.trim() || !message.trim()) {
      setError("Title and message are both required");
      return;
    }
    setPosting(true);
    const res = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, message }),
    });
    setPosting(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to post announcement");
      return;
    }
    setTitle("");
    setMessage("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    router.refresh();
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1.5px solid rgba(15,23,42,0.09)",
    background: "#fff",
    fontSize: 14,
    outline: "none",
    color: "#14132B",
    boxSizing: "border-box",
  };

  return (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
      <style>{`
        @keyframes annCardIn { from { opacity:0; transform: translateY(16px) scale(0.98); } to { opacity:1; transform: translateY(0) scale(1); } }
        @keyframes annOrbFloat { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-8px,6px) scale(1.06); } }
        @keyframes annPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        .ann-item { animation: annCardIn 0.4s cubic-bezier(.2,.8,.2,1) both; transition: transform 0.2s ease, box-shadow 0.2s ease; position: relative; overflow: hidden; }
        .ann-item:hover { transform: translateY(-4px); box-shadow: 0 14px 30px rgba(20,19,43,0.1); }
        .ann-orb { animation: annOrbFloat 6s ease-in-out infinite; }
        .post-input:focus { border-color: #6D4AFF !important; box-shadow: 0 0 0 4px rgba(109,74,255,0.1); }
        .post-btn { transition: transform 0.15s ease, box-shadow 0.2s ease; }
        .post-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(109,74,255,0.35); }
        .live-dot { animation: annPulse 1.6s ease infinite; }
        .compose-panel { position: sticky; top: 20px; }
        @media (max-width: 800px) {
          .compose-panel { position: static; }
        }
      `}</style>

      {/* Compose form */}
      <div style={{ width: 340, flexShrink: 0 }}>
        <div className="compose-panel" style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(15,23,42,0.07)", padding: 24, boxShadow: "0 6px 20px rgba(20,19,43,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, boxShadow: "0 4px 12px rgba(109,74,255,0.3)" }}>
              📢
            </div>
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 700, color: "#14132B" }}>
              New Announcement
            </h3>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(20,19,43,0.5)", marginBottom: 6, display: "block" }}>Title</label>
            <input className="post-input" style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. New hackathon starting soon" maxLength={100} />
          </div>

          <div style={{ marginBottom: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(20,19,43,0.5)", marginBottom: 6, display: "block" }}>Message</label>
            <textarea
              className="post-input"
              style={{ ...inputStyle, minHeight: 100, resize: "vertical", fontFamily: "inherit" }}
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, MAX_MSG))}
              placeholder="Write your announcement..."
            />
          </div>
          <div style={{ textAlign: "right", fontSize: 11, color: message.length > MAX_MSG - 40 ? "#D97706" : "rgba(20,19,43,0.35)", marginBottom: 14 }}>
            {message.length}/{MAX_MSG}
          </div>

          {error && (
            <div style={{ background: "rgba(255,70,70,0.06)", color: "#d32f2f", fontSize: 12.5, padding: "8px 12px", borderRadius: 10, marginBottom: 14 }}>
              ⚠ {error}
            </div>
          )}
          {success && (
            <div style={{ background: "rgba(22,163,74,0.08)", color: "#15803D", fontSize: 12.5, padding: "8px 12px", borderRadius: 10, marginBottom: 14 }}>
              ✓ Posted! Students will see it in their notifications.
            </div>
          )}

          <button
            className="post-btn"
            onClick={post}
            disabled={posting}
            style={{
              width: "100%",
              background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "13px",
              fontSize: 13.5,
              fontWeight: 700,
              cursor: "pointer",
              opacity: posting ? 0.6 : 1,
              boxShadow: "0 4px 14px rgba(109,74,255,0.25)",
            }}
          >
            {posting ? "Posting..." : "Post Announcement"}
          </button>
        </div>
      </div>

      {/* Past announcements */}
      <div style={{ flex: 1, minWidth: 300 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 700, color: "#14132B" }}>
            Your Announcements
          </h3>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#6D4AFF", background: "rgba(109,74,255,0.08)", padding: "3px 10px", borderRadius: 20 }}>
            {announcements.length}
          </span>
        </div>

        {announcements.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(15,23,42,0.07)", padding: 50, textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.3 }}>📭</div>
            <p style={{ color: "rgba(20,19,43,0.5)", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No announcements yet</p>
            <p style={{ color: "rgba(20,19,43,0.35)", fontSize: 12.5 }}>Post your first update — students will see it instantly.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {announcements.map((a, i) => {
              const theme = getTheme(a.id);
              const isRecent = Date.now() - new Date(a.createdAt).getTime() < 3600000;
              return (
                <div
                  key={a.id}
                  className="ann-item"
                  style={{
                    animationDelay: `${Math.min(i * 0.05, 0.3)}s`,
                    background: theme.bg,
                    borderRadius: 18,
                    border: "1px solid rgba(255,255,255,0.5)",
                    padding: 22,
                    boxShadow: "0 4px 16px rgba(20,19,43,0.06)",
                  }}
                >
                  <div className="ann-orb" style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: theme.blob }} />
                  <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <h4 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15.5, fontWeight: 700, color: "#14132B" }}>{a.title}</h4>
                      {isRecent && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: theme.accent, background: "#fff", padding: "2px 8px", borderRadius: 20, display: "flex", alignItems: "center", gap: 4 }}>
                          <span className="live-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: theme.accent, display: "inline-block" }} />
                          New
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: 11.5, color: "rgba(20,19,43,0.4)", flexShrink: 0, marginLeft: 10, fontWeight: 600 }}>{timeAgo(a.createdAt)}</span>
                  </div>
                  <p style={{ position: "relative", fontSize: 13.5, color: "rgba(20,19,43,0.7)", lineHeight: 1.65 }}>{a.message}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}