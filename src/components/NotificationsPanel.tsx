"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const TYPE_ICONS: Record<string, string> = {
  TEAM_INVITE: "👥",
  TEAM_INVITE_ACCEPTED: "✅",
  SUBMISSION_REVIEWED: "📝",
  WINNER_ANNOUNCED: "🏆",
  ORGANIZER_VERIFIED: "✔️",
  ACCOUNT_STATUS_CHANGE: "⚠️",
  FRIEND_REQUEST: "🤝",
  FRIEND_REQUEST_ACCEPTED: "🎉",
  NEW_FOLLOWER: "⭐",
};

export default function NotificationsPanel() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const response = await fetch("/api/notifications");
      if (!response.ok) throw new Error("Unable to load notifications.");
      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

   useEffect(() => {
    load();
    const poll = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 45000);
    return () => clearInterval(poll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleOpen() {
    setOpen((prev) => !prev);
  }

  async function handleNotificationClick(n: any) {
    if (!n.isRead) {
      try {
        await fetch(`/api/notifications/${n.id}`, { method: "PATCH" });
      } catch {
        // Keep navigation available if marking the item read fails.
      }
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setOpen(false);
    if (n.link) router.push(n.link);
  }

  async function markAllRead() {
    try {
      const response = await fetch("/api/notifications/mark-all-read", { method: "PATCH" });
      if (!response.ok) return;
    } catch {
      return;
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <style>{`
        @keyframes nbPop { from { opacity:0; transform: translateY(-8px) scale(0.96); } to { opacity:1; transform: translateY(0) scale(1); } }
        .nb-btn { transition: background 0.15s ease; }
        .nb-btn:hover { background: rgba(109,74,255,0.08) !important; }
        .nb-item { transition: background 0.15s ease; cursor: pointer; }
        .nb-item:hover { background: #F6F5FB !important; }
        .nb-panel { animation: nbPop 0.18s cubic-bezier(.2,.8,.2,1); }
        .nb-mark-all { transition: opacity 0.15s ease; }
        .nb-mark-all:hover { opacity: 0.7; }
        @media (prefers-reduced-motion: reduce) { .nb-btn, .nb-item, .nb-panel, .nb-mark-all { animation: none; transition: none; } }
      `}</style>

      <button
        className="nb-btn"
        onClick={handleOpen}
        aria-label="Notifications"
        aria-expanded={open}
        style={{
          position: "relative",
          width: 38,
          height: 38,
          borderRadius: 10,
          border: "1px solid rgba(15,23,42,0.08)",
          background: "#F6F5FB",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#14132B" strokeWidth="1.8">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {unreadCount > 0 && (
          <span
            className="nb-dot"
            style={{
              position: "absolute",
              top: -3,
              right: -3,
              minWidth: 17,
              height: 17,
              borderRadius: "50%",
              background: "#DC2626",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 3px",
              border: "2px solid #fff",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="nb-panel"
          style={{
            position: "absolute",
            top: 46,
            right: 0,
            width: "min(340px, calc(100vw - 24px))",
            maxHeight: 420,
            background: "#fff",
            borderRadius: 16,
            border: "1px solid rgba(15,23,42,0.08)",
            boxShadow: "0 16px 40px rgba(20,19,43,0.15)",
            overflow: "hidden",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid rgba(15,23,42,0.06)" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#14132B" }}>Notifications</span>
            {unreadCount > 0 && (
              <button
                className="nb-mark-all"
                onClick={markAllRead}
                style={{ background: "none", border: "none", fontSize: 12, fontWeight: 600, color: "#6D4AFF", cursor: "pointer" }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={{ overflowY: "auto", flex: 1 }}>
            {loading ? (
              <div style={{ padding: 30, textAlign: "center", fontSize: 13, color: "rgba(20,19,43,0.4)" }}>Loading...</div>
            ) : loadError ? (
              <div role="status" style={{ padding: 32, textAlign: "center", fontSize: 13, color: "rgba(20,19,43,0.48)" }}>Notifications are temporarily unavailable.</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center" }}>
                <div style={{ fontSize: 26, marginBottom: 8, opacity: 0.3 }}>🔔</div>
                <p style={{ fontSize: 13, color: "rgba(20,19,43,0.4)" }}>No notifications yet.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="nb-item"
                  onClick={() => handleNotificationClick(n)}
                  style={{
                    display: "flex",
                    gap: 10,
                    padding: "12px 16px",
                    borderBottom: "1px solid rgba(15,23,42,0.05)",
                    background: n.isRead ? "transparent" : "rgba(109,74,255,0.04)",
                  }}
                >
                  <div style={{ fontSize: 18, flexShrink: 0 }}>{TYPE_ICONS[n.type] || "🔔"}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: n.isRead ? 600 : 700, color: "#14132B", marginBottom: 2 }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(20,19,43,0.55)", lineHeight: 1.4 }}>{n.message}</div>
                    <div style={{ fontSize: 10.5, color: "rgba(20,19,43,0.35)", marginTop: 4 }}>{timeAgo(n.createdAt)}</div>
                  </div>
                  {!n.isRead && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#6D4AFF", flexShrink: 0, marginTop: 5 }} />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
