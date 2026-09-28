"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "How do I join a challenge?",
    a: "Go to Discover, open any challenge, and click 'Join Solo' or create/join a team depending on the challenge type.",
  },
  {
    q: "How do I submit my work?",
    a: "Open the challenge you joined, go to the Submit tab, and upload your file along with a short description before the deadline.",
  },
  {
    q: "How are winners chosen?",
    a: "Organizers review submissions and assign scores. Positions (1st/2nd/3rd) are announced by the organizer once review is complete.",
  },
  {
    q: "I didn't get my prize email, what do I do?",
    a: "Check your spam folder first. If it's still missing, use the contact form below and we'll look into it.",
  },
  {
    q: "How do I change my profile picture or bio?",
    a: "Go to Profile, click 'Edit Profile', update your photo, bio, or other details, then save.",
  },
  {
    q: "How does the Leaderboard work?",
    a: "Points come from review scores plus bonus points for placing 1st, 2nd, or 3rd in a challenge.",
  },
];

export default function HelpCenterView() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to send. Try again.");
        setSending(false);
        return;
      }
      setSent(true);
      setSubject("");
      setMessage("");
      setTimeout(() => setSent(false), 4000);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSending(false);
    }
  }

  const cardBase: React.CSSProperties = {
    background: "#fff",
    borderRadius: 18,
    border: "1px solid rgba(15,23,42,0.07)",
    padding: 22,
  };

  return (
        <div className="help-page" style={{ width: "100%", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .help-contact-grid { display: grid; grid-template-columns: minmax(0,1.3fr) minmax(260px,1fr); gap: 20px; }
        .help-card { min-width: 0; }
        .help-page input:focus, .help-page textarea:focus { border-color: #6D4AFF !important; box-shadow: 0 0 0 3px rgba(109,74,255,0.1); }
        .help-faq-button:focus-visible, .help-submit:focus-visible { outline: 3px solid rgba(109,74,255,0.4); outline-offset: 2px; }
        .help-submit { transition: transform 0.15s ease, box-shadow 0.2s ease; }
        .help-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(109,74,255,0.25); }
        @media (max-width: 760px) { .help-contact-grid { grid-template-columns: minmax(0,1fr); } }
        @media (prefers-reduced-motion: reduce) { .help-submit { transition: none !important; } }
      `}</style>
      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 700, color: "#14132B", marginBottom: 6 }}>
        Help Center
      </h1>
      <p style={{ color: "rgba(20,19,43,0.5)", fontSize: 14, marginBottom: 28 }}>
        Find answers to common questions or reach out to us directly.
      </p>

      <div style={{ ...cardBase, marginBottom: 20 }}>
        <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 19, fontWeight: 700, color: "#14132B", marginBottom: 16 }}>
          Frequently Asked Questions
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {FAQS.map((f, i) => {
            const open = openIdx === i;
            return (
              <div key={i} style={{ borderRadius: 12, border: "1px solid rgba(15,23,42,0.06)", overflow: "hidden" }}>
                <button
                  className="help-faq-button"
                  aria-expanded={open}
                  aria-controls={`help-faq-answer-${i}`}
                  onClick={() => setOpenIdx(open ? null : i)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                                        padding: "16px 18px",
                    background: open ? "#F6F5FB" : "#fff",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                                       fontSize: 15.5,
                    fontWeight: 600,
                    color: "#14132B",
                  }}
                >
                  {f.q}
                  <span aria-hidden="true" style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)", transition: "transform 0.2s ease", fontSize: 20, color: "#6D4AFF" }}>+</span>
                </button>
                {open && (
                  <div id={`help-faq-answer-${i}`} style={{ padding: "0 16px 14px", fontSize: 14.5, color: "rgba(20,19,43,0.6)", lineHeight: 1.65 }}>
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="help-contact-grid">
        <div className="help-card" style={cardBase}>
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 700, color: "#14132B", marginBottom: 14 }}>
            Contact Support
          </h3>
          <form onSubmit={submitForm}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(20,19,43,0.5)", marginBottom: 6, display: "block" }}>
                Subject
              </label>
                <input
                  required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What's this about?"
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: 10,
                  border: "1.5px solid rgba(15,23,42,0.09)",
                  fontSize: 13.5,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(20,19,43,0.5)", marginBottom: 6, display: "block" }}>
                Message
              </label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue or question..."
                style={{
                  width: "100%",
                  minHeight: 110,
                  padding: "11px 14px",
                  borderRadius: 10,
                  border: "1.5px solid rgba(15,23,42,0.09)",
                  fontSize: 13.5,
                  outline: "none",
                  boxSizing: "border-box",
                  resize: "vertical",
                  fontFamily: "'Inter', sans-serif",
                }}
              />
            </div>

            {error && (
              <div style={{ background: "rgba(255,70,70,0.06)", color: "#d32f2f", fontSize: 12.5, padding: "8px 12px", borderRadius: 10, marginBottom: 14 }}>
                ⚠ {error}
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                className="help-submit"
                type="submit"
                disabled={sending}
                style={{
                  background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "11px 22px",
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: sending ? "default" : "pointer",
                  opacity: sending ? 0.6 : 1,
                }}
              >
                {sending ? "Sending..." : "Send Message"}
              </button>
              {sent && <span style={{ fontSize: 13, color: "#15803D", fontWeight: 700 }}>✓ Sent!</span>}
            </div>
          </form>
        </div>

        <div className="help-card" style={{ ...cardBase, background: "linear-gradient(155deg,#EDE9FE,#F5F3FF)", border: "1px solid rgba(109,74,255,0.12)" }}>
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 700, color: "#14132B", marginBottom: 10 }}>
            Need it faster?
          </h3>
          <p style={{ fontSize: 13, color: "rgba(20,19,43,0.6)", marginBottom: 16, lineHeight: 1.6 }}>
            You can also reach the SECM team directly on Telegram:
         

          </p>
          
          <a href="https://t.me/anish159"
            target="_blank"
            rel="noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", borderRadius: 12, padding: "12px 14px", marginBottom: 10, textDecoration: "none" }}
          >
            <span style={{ fontSize: 13.5, fontWeight: 700, color: "#14132B" }}>Telegram: @anish159</span>
          </a>
          
           <a href="https://t.me/pradipmishra123"
            target="_blank"
            rel="noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", borderRadius: 12, padding: "12px 14px", textDecoration: "none" }}
          >
            <span style={{ fontSize: 13.5, fontWeight: 700, color: "#14132B" }}>Telegram: @pradipmishra123</span>
          </a>
        </div>
      </div>
    </div>
  );
}
