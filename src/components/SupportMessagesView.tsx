"use client";

import { useEffect, useState } from "react";

type SupportMsg = {
  id: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  user: { name: string; email: string; username: string; role: string };
};

export default function SupportMessagesView() {
  const [messages, setMessages] = useState<SupportMsg[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "OPEN" | "RESOLVED">("OPEN");

  useEffect(() => {
    fetch("/api/support/list")
      .then((r) => r.json())
      .then((d) => {
        setMessages(d.messages || []);
        setLoading(false);
      });
  }, []);

  async function toggleStatus(id: string, current: string) {
    const next = current === "OPEN" ? "RESOLVED" : "OPEN";
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status: next } : m)));
    await fetch(`/api/support/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
  }

  const filtered = messages.filter((m) => filter === "ALL" || m.status === filter);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", fontFamily: "'Inter', sans-serif" }}>
      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 700, color: "#14132B", marginBottom: 6 }}>
        Support Messages
      </h1>
      <p style={{ color: "rgba(20,19,43,0.5)", fontSize: 14, marginBottom: 20 }}>
        Messages submitted through the Help Center contact form.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["OPEN", "RESOLVED", "ALL"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "8px 16px",
              borderRadius: 10,
              border: "none",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              background: filter === f ? "#6D4AFF" : "rgba(15,23,42,0.05)",
              color: filter === f ? "#fff" : "rgba(20,19,43,0.6)",
            }}
          >
            {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "rgba(20,19,43,0.4)", fontSize: 13 }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(15,23,42,0.07)", padding: 40, textAlign: "center" }}>
          <p style={{ color: "rgba(20,19,43,0.4)", fontSize: 13.5 }}>No messages here.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((m) => (
            <div key={m.id} style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(15,23,42,0.07)", padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 12 }}>
                <div>
                  <p style={{ fontSize: 14.5, fontWeight: 700, color: "#14132B" }}>{m.subject}</p>
                  <p style={{ fontSize: 12, color: "rgba(20,19,43,0.45)", marginTop: 2 }}>
                    {m.user.name} ({m.user.role}) · @{m.user.username} · {m.user.email}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 20,
                    whiteSpace: "nowrap",
                    background: m.status === "OPEN" ? "rgba(217,119,6,0.1)" : "rgba(22,163,74,0.1)",
                    color: m.status === "OPEN" ? "#B45309" : "#15803D",
                  }}
                >
                  {m.status}
                </span>
              </div>
              <p style={{ fontSize: 13, color: "rgba(20,19,43,0.7)", lineHeight: 1.6, marginBottom: 12, whiteSpace: "pre-wrap" }}>
                {m.message}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11.5, color: "rgba(20,19,43,0.4)" }}>{new Date(m.createdAt).toLocaleString()}</span>
                <button
                  onClick={() => toggleStatus(m.id, m.status)}
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: "1.5px solid rgba(109,74,255,0.25)",
                    background: "#fff",
                    color: "#6D4AFF",
                    cursor: "pointer",
                  }}
                >
                  Mark as {m.status === "OPEN" ? "Resolved" : "Open"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}