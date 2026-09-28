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
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "OPEN" | "RESOLVED">("OPEN");

  useEffect(() => {
    fetch("/api/support/list")
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data.error || "Could not load support messages.");
        setMessages(data.messages || []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load support messages."))
      .finally(() => setLoading(false));
  }, []);

  async function toggleStatus(id: string, current: string) {
    const next = current === "OPEN" ? "RESOLVED" : "OPEN";
    const previous = messages.find((message) => message.id === id);
    if (!previous) return;
    setUpdatingId(id);
    setError("");
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status: next } : m)));
    try {
      const response = await fetch(`/api/support/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not update this message.");
    } catch (err) {
      setMessages((prev) => prev.map((m) => (m.id === id ? previous : m)));
      setError(err instanceof Error ? err.message : "Could not update this message.");
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = messages.filter((m) => filter === "ALL" || m.status === filter);

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", fontFamily: "'Inter', sans-serif", minWidth: 0 }}>
      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 700, color: "#14132B", marginBottom: 6 }}>
        Support Messages
      </h1>
      <p style={{ color: "rgba(20,19,43,0.5)", fontSize: 14, marginBottom: 20 }}>
        Messages submitted through the Help Center contact form.
      </p>

      {error && <p role="alert" style={{ color: "#B42318", background: "#FEF3F2", border: "1px solid #FECDCA", borderRadius: 12, padding: "11px 14px", marginBottom: 16, fontSize: 13 }}>{error}</p>}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 2 }}>
        {(["OPEN", "RESOLVED", "ALL"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
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
        error ? <div role="status" style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(15,23,42,0.07)", padding: 32, textAlign: "center", color: "rgba(20,19,43,0.6)" }}>Support messages could not be loaded. Try again later.</div> : <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(15,23,42,0.07)", padding: "clamp(24px, 6vw, 40px)", textAlign: "center" }}>
          <p style={{ color: "rgba(20,19,43,0.4)", fontSize: 13.5 }}>No messages here.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((m) => (
            <div key={m.id} style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(15,23,42,0.07)", padding: "clamp(14px, 3vw, 20px)", minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", marginBottom: 8, gap: 12 }}>
                <div style={{ minWidth: 0, overflowWrap: "anywhere" }}>
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <span style={{ fontSize: 11.5, color: "rgba(20,19,43,0.4)" }}>{new Date(m.createdAt).toLocaleString()}</span>
                <button
                  onClick={() => toggleStatus(m.id, m.status)}
                  disabled={updatingId === m.id}
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: "1.5px solid rgba(109,74,255,0.25)",
                    background: "#fff",
                    color: "#6D4AFF",
                    cursor: updatingId === m.id ? "wait" : "pointer",
                    opacity: updatingId === m.id ? 0.65 : 1,
                  }}
                >
                  {updatingId === m.id ? "Updating…" : `Mark as ${m.status === "OPEN" ? "Resolved" : "Open"}`}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
