"use client";

import { useState, useEffect, useRef } from "react";

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function TeamChat({ teamId, currentUserId }: { teamId: string; currentUserId: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    load();
    const poll = setInterval(load, 4000);
    return () => clearInterval(poll);
  }, [teamId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function load() {
    fetch(`/api/teams/${teamId}/messages`)
      .then((r) => r.json())
      .then((d) => {
        setMessages(d.messages || []);
        setLoading(false);
      });
  }

  async function send() {
    if (!input.trim()) return;
    const content = input;
    setInput("");
    setSending(true);
    await fetch(`/api/teams/${teamId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setSending(false);
    load();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: 380, background: "#FBFAFF", borderRadius: 14, border: "1px solid rgba(15,23,42,0.06)", overflow: "hidden" }}>
      <style>{`
        @keyframes teamMsgIn { from { opacity:0; transform: translateY(6px); } to { opacity:1; transform: translateY(0); } }
        .team-msg { animation: teamMsgIn 0.25s ease both; }
        .team-chat-input:focus { border-color: #6D4AFF !important; box-shadow: 0 0 0 3px rgba(109,74,255,0.08); }
        .team-send-btn { transition: transform 0.15s ease; }
        .team-send-btn:hover:not(:disabled) { transform: translateY(-1px); }
      `}</style>

      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        {loading ? (
          <p style={{ fontSize: 12.5, color: "rgba(20,19,43,0.4)", textAlign: "center", marginTop: 20 }}>Loading chat...</p>
        ) : messages.length === 0 ? (
          <p style={{ fontSize: 12.5, color: "rgba(20,19,43,0.4)", textAlign: "center", marginTop: 20 }}>
            No messages yet — say hi to your team!
          </p>
        ) : (
          messages.map((m) => {
            const isMine = m.senderId === currentUserId;
            return (
              <div key={m.id} className="team-msg" style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start", gap: 8 }}>
                {!isMine && (
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {m.sender.name[0]?.toUpperCase()}
                  </div>
                )}
                <div style={{ maxWidth: "70%" }}>
                  {!isMine && <p style={{ fontSize: 10.5, color: "rgba(20,19,43,0.4)", marginBottom: 2, marginLeft: 4 }}>{m.sender.name}</p>}
                  <div
                    style={{
                      padding: "8px 12px",
                      borderRadius: 12,
                      fontSize: 13,
                      background: isMine ? "linear-gradient(135deg,#6D4AFF,#8B5CF6)" : "#fff",
                      color: isMine ? "#fff" : "#14132B",
                      border: isMine ? "none" : "1px solid rgba(15,23,42,0.06)",
                    }}
                  >
                    {m.content}
                  </div>
                  <p style={{ fontSize: 9.5, color: "rgba(20,19,43,0.3)", marginTop: 2, textAlign: isMine ? "right" : "left" }}>
                    {formatTime(m.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: 12, borderTop: "1px solid rgba(15,23,42,0.06)", display: "flex", gap: 8, background: "#fff" }}>
        <input
          className="team-chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Message your team..."
          style={{
            flex: 1,
            padding: "9px 12px",
            borderRadius: 10,
            border: "1px solid rgba(15,23,42,0.08)",
            background: "#F6F5FB",
            fontSize: 13,
            outline: "none",
            color: "#14132B",
          }}
        />
        <button
          className="team-send-btn"
          onClick={send}
          disabled={sending || !input.trim()}
          style={{
            background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "0 16px",
            fontSize: 12.5,
            fontWeight: 700,
            cursor: "pointer",
            opacity: sending || !input.trim() ? 0.6 : 1,
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}