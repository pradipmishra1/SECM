"use client";

import { useState, useEffect, useRef } from "react";
import { Icon } from "./icons";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const STORAGE_KEY = "secm_last_seen_announcement";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/announcements")
      .then((r) => r.json())
      .then((d) => {
        const list = d.announcements || [];
        setAnnouncements(list);
        setLoaded(true);
        if (list.length > 0) {
          const lastSeen = localStorage.getItem(STORAGE_KEY);
          const newest = new Date(list[0].createdAt).getTime();
          if (!lastSeen || newest > parseInt(lastSeen)) {
            setHasUnread(true);
          }
        }
      });
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && announcements.length > 0) {
      const newest = new Date(announcements[0].createdAt).getTime();
      localStorage.setItem(STORAGE_KEY, String(newest));
      setHasUnread(false);
    }
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <style>{`
        @keyframes bellDropIn { from { opacity:0; transform: translateY(-8px) scale(0.97); } to { opacity:1; transform: translateY(0) scale(1); } }
        @keyframes annRowIn { from { opacity:0; transform: translateX(-6px); } to { opacity:1; transform: translateX(0); } }
        @keyframes dotPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(220,38,38,0.4); } 50% { box-shadow: 0 0 0 4px rgba(220,38,38,0); } }
        .bell-dot { animation: dotPulse 1.8s ease-in-out infinite; }
      `}</style>
      <button onClick={toggle} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(20,19,43,0.45)", padding: 4, position: "relative" }}>
        <Icon.bell width={19} height={19} />
        {hasUnread && (
          <span
            className="bell-dot"
            style={{
              position: "absolute",
              top: 2,
              right: 2,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#DC2626",
              border: "2px solid #fff",
            }}
          />
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 12px)",
            right: 0,
            width: 340,
            maxHeight: 420,
            overflowY: "auto",
            background: "#fff",
            borderRadius: 16,
            border: "1px solid rgba(15,23,42,0.08)",
            boxShadow: "0 20px 50px rgba(20,19,43,0.15)",
            animation: "bellDropIn 0.2s cubic-bezier(.2,.8,.2,1)",
            zIndex: 100,
          }}
        >
          <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(15,23,42,0.06)" }}>
            <h4 style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "#14132B" }}>📢 Announcements</h4>
          </div>

          {!loaded ? (
            <p style={{ padding: 24, textAlign: "center", fontSize: 13, color: "rgba(20,19,43,0.4)" }}>Loading...</p>
          ) : announcements.length === 0 ? (
            <p style={{ padding: 24, textAlign: "center", fontSize: 13, color: "rgba(20,19,43,0.4)" }}>No announcements yet.</p>
          ) : (
            announcements.map((a, i) => (
              <div
                key={a.id}
                style={{
                  padding: "12px 18px",
                  borderTop: i > 0 ? "1px solid rgba(15,23,42,0.05)" : "none",
                  animation: "annRowIn 0.25s ease both",
                  animationDelay: `${i * 0.03}s`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#14132B" }}>{a.title}</span>
                  <span style={{ fontSize: 10.5, color: "rgba(20,19,43,0.35)", flexShrink: 0, marginLeft: 8 }}>{timeAgo(a.createdAt)}</span>
                </div>
                <p style={{ fontSize: 12.5, color: "rgba(20,19,43,0.6)", lineHeight: 1.5, marginBottom: 4 }}>{a.message}</p>
                <span style={{ fontSize: 11, color: "#6D4AFF", fontWeight: 600 }}>— {a.organizer.orgName}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}