"use client";

import { useState, useEffect } from "react";

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

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function ChallengeComments({ challengeId, currentUserId }: { challengeId: string; currentUserId: string }) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [posting, setPosting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState("");

  useEffect(() => {
    load();
  }, [challengeId]);

  function load() {
    setLoading(true);
    fetch(`/api/challenges/${challengeId}/comments`)
      .then((r) => r.json())
      .then((d) => {
        setComments(d.comments || []);
        setLoading(false);
      });
  }

  async function post(content: string, parentId: string | null) {
    if (!content.trim()) return;
    setPosting(true);
    await fetch(`/api/challenges/${challengeId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, parentId }),
    });
    setPosting(false);
    setInput("");
    setReplyInput("");
    setReplyingTo(null);
    load();
  }

  const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid rgba(15,23,42,0.08)",
    background: "#F6F5FB",
    fontSize: 13.5,
    outline: "none",
    color: "#14132B",
  };

  return (
    <div>
      <style>{`
        @keyframes commentIn { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }
        .comment-item { animation: commentIn 0.3s ease both; }
        .comment-input:focus { border-color: #6D4AFF !important; box-shadow: 0 0 0 3px rgba(109,74,255,0.08); }
        .reply-toggle { transition: color 0.15s ease; cursor: pointer; }
        .reply-toggle:hover { color: #6D4AFF !important; }
        .post-comment-btn { transition: transform 0.15s ease; }
        .post-comment-btn:hover:not(:disabled) { transform: translateY(-1px); }
      `}</style>

      <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "#14132B", marginBottom: 14 }}>
        💬 Questions & Discussion
      </h2>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          className="comment-input"
          style={inputStyle}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && post(input, null)}
          placeholder="Ask a question about this challenge..."
        />
        <button
          className="post-comment-btn"
          onClick={() => post(input, null)}
          disabled={posting || !input.trim()}
          style={{
            background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "0 18px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            opacity: posting || !input.trim() ? 0.6 : 1,
          }}
        >
          Post
        </button>
      </div>

      {loading ? (
        <p style={{ fontSize: 13, color: "rgba(20,19,43,0.4)" }}>Loading comments...</p>
      ) : comments.length === 0 ? (
        <p style={{ fontSize: 13, color: "rgba(20,19,43,0.4)", textAlign: "center", padding: "20px 0" }}>
          No questions yet — be the first to ask!
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {comments.map((c, i) => (
            <div key={c.id} className="comment-item" style={{ animationDelay: `${i * 0.04}s` }}>
              <CommentRow comment={c} />
              <div style={{ marginLeft: 38 }}>
                {c.replies?.map((r: any) => (
                  <div key={r.id} style={{ marginTop: 10 }}>
                    <CommentRow comment={r} isReply />
                  </div>
                ))}
                {replyingTo === c.id ? (
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <input
                      className="comment-input"
                      style={inputStyle}
                      value={replyInput}
                      onChange={(e) => setReplyInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && post(replyInput, c.id)}
                      placeholder="Write a reply..."
                      autoFocus
                    />
                    <button
                      onClick={() => post(replyInput, c.id)}
                      disabled={posting || !replyInput.trim()}
                      style={{ background: "#14132B", color: "#fff", border: "none", borderRadius: 10, padding: "0 14px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}
                    >
                      Reply
                    </button>
                  </div>
                ) : (
                  <span
                    className="reply-toggle"
                    onClick={() => setReplyingTo(c.id)}
                    style={{ fontSize: 12, color: "rgba(20,19,43,0.4)", fontWeight: 600, display: "inline-block", marginTop: 6 }}
                  >
                    Reply
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  function CommentRow({ comment, isReply }: { comment: any; isReply?: boolean }) {
    const isOrganizer = comment.user.role === "ORGANIZER";
    return (
      <div style={{ display: "flex", gap: 10 }}>
        <div
          style={{
            width: isReply ? 26 : 32,
            height: isReply ? 26 : 32,
            borderRadius: "50%",
            background: isOrganizer ? "linear-gradient(135deg,#D97706,#F59E0B)" : "linear-gradient(135deg,#6D4AFF,#8B5CF6)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: isReply ? 11 : 13,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {comment.user.name[0]?.toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#14132B" }}>{comment.user.name}</span>
            {isOrganizer && (
              <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(217,119,6,0.1)", color: "#B45309", padding: "2px 8px", borderRadius: 20 }}>
                Organizer
              </span>
            )}
            <span style={{ fontSize: 11, color: "rgba(20,19,43,0.35)" }}>{timeAgo(comment.createdAt)}</span>
          </div>
          <p style={{ fontSize: 13, color: "rgba(20,19,43,0.7)", marginTop: 3, lineHeight: 1.5 }}>{comment.content}</p>
        </div>
      </div>
    );
  }
}