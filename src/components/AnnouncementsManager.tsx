"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
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
    <div style={{ display: "flex", gap: 20 }}>
      <style>{`
        @keyframes annCardIn { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: translateY(0); } }
        .ann-item { animation: annCardIn 0.35s ease both; }
        .post-input:focus { border-color: #6D4AFF !important; box-shadow: 0 0 0 4px rgba(109,74,255,0.1); }
        .post-btn { transition: transform 0.15s ease, box-shadow 0.2s ease; }
        .post-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(109,74,255,0.3); }
      `}</style>

      {/* Compose form */}
      <div style={{ width: 340, flexShrink: 0 }}>
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.07)", padding: 22, position: "sticky", top: 20 }}>
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "#14132B", marginBottom: 16 }}>
            📢 New Announcement
          </h3>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(20,19,43,0.5)", marginBottom: 6, display: "block" }}>Title</label>
            <input className="post-input" style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. New hackathon starting soon" />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(20,19,43,0.5)", marginBottom: 6, display: "block" }}>Message</label>
            <textarea
              className="post-input"
              style={{ ...inputStyle, minHeight: 100, resize: "vertical", fontFamily: "inherit" }}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your announcement..."
            />
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
              padding: "12px",
              fontSize: 13.5,
              fontWeight: 700,
              cursor: "pointer",
              opacity: posting ? 0.6 : 1,
            }}
          >
            {posting ? "Posting..." : "Post Announcement"}
          </button>
        </div>
      </div>

      {/* Past announcements */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "#14132B", marginBottom: 14 }}>
          Your Announcements ({announcements.length})
        </h3>

        {announcements.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.07)", padding: 40, textAlign: "center" }}>
            <p style={{ color: "rgba(20,19,43,0.4)", fontSize: 14 }}>No announcements posted yet.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {announcements.map((a, i) => (
              <div key={a.id} className="ann-item" style={{ animationDelay: `${i * 0.05}s`, background: "#fff", borderRadius: 16, border: "1px solid rgba(15,23,42,0.07)", padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <h4 style={{ fontSize: 14.5, fontWeight: 700, color: "#14132B" }}>{a.title}</h4>
                  <span style={{ fontSize: 11.5, color: "rgba(20,19,43,0.35)", flexShrink: 0, marginLeft: 10 }}>{timeAgo(a.createdAt)}</span>
                </div>
                <p style={{ fontSize: 13.5, color: "rgba(20,19,43,0.65)", lineHeight: 1.6 }}>{a.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}