"use client";

import { useState, useEffect, useRef } from "react";
import ProfileModal from "./ProfileModal";

function VerifiedTick() {
  return (
    <span title="Verified Organizer" style={{ color: "#2563EB", display: "inline-flex", flexShrink: 0 }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.4 2.2 3.2-.6.8 3.2 3 1.5-1.2 3.1 1.2 3.1-3 1.5-.8 3.2-3.2-.6L12 22l-2.4-2.2-3.2.6-.8-3.2-3-1.5 1.2-3.1L2.6 9.5l3-1.5.8-3.2 3.2.6L12 2z" />
        <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function ReadTick({ read }: { read: boolean }) {
  return (
    <svg width="13" height="9" viewBox="0 0 16 10" style={{ display: "inline-block" }}>
      <path d="M0.5 5 L4 8.5 L9.5 1" fill="none" stroke={read ? "#fff" : "rgba(255,255,255,0.5)"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 5 L9 8.5 L14.5 1" fill="none" stroke={read ? "#fff" : "rgba(255,255,255,0.5)"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

function formatMsgTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function dateLabel(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined });
}

export default function MessagesApp({ currentUserId }: { currentUserId: string }) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeUsername, setActiveUsername] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<string | null>(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
    const poll = setInterval(loadConversations, 5000);
    return () => clearInterval(poll);
  }, []);

  useEffect(() => {
    if (activeUsername) loadThread(activeUsername);
  }, [activeUsername]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(() => {
      fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`)
        .then((r) => r.json())
        .then((d) => {
          setSearchResults(d.users || []);
          setSearching(false);
        });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  function loadConversations() {
    fetch("/api/messages/conversations")
      .then((r) => r.json())
      .then((d) => setConversations(d.conversations || []));
  }

  function loadThread(username: string) {
    setThreadLoading(true);
    fetch(`/api/messages/${username}`)
      .then((r) => r.json())
      .then((d) => {
        setMessages(d.messages || []);
        setOtherUser(d.otherUser || null);
        setThreadLoading(false);
      });
  }

  async function sendMessage() {
    if (!input.trim() || !activeUsername) return;
    const content = input;
    setInput("");
    setSending(true);
    const res = await fetch(`/api/messages/${activeUsername}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setSending(false);
    if (res.ok) {
      loadThread(activeUsername);
      loadConversations();
    } else {
      setInput(content);
    }
  }

  const groupedMessages: { date: string; items: any[] }[] = [];
  messages.forEach((m) => {
    const label = dateLabel(m.createdAt);
    let group = groupedMessages.find((g) => g.date === label);
    if (!group) {
      group = { date: label, items: [] };
      groupedMessages.push(group);
    }
    group.items.push(m);
  });

  return (
    <div>
      <style>{`
        @keyframes msgSlideIn { from { opacity:0; transform: translateY(8px) scale(0.98); } to { opacity:1; transform: translateY(0) scale(1); } }
        @keyframes convoFade { from { opacity:0; transform: translateX(-10px); } to { opacity:1; transform: translateX(0); } }
        @keyframes panelFade { from { opacity:0; transform: translateY(4px); } to { opacity:1; transform: translateY(0); } }
        @keyframes dotBounce { 0%,60%,100% { transform: translateY(0); opacity:0.4; } 30% { transform: translateY(-4px); opacity:1; } }
        @keyframes searchSpin { to { transform: rotate(360deg); } }
        @keyframes unreadPulse { 0%,100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(109,74,255,0.4); } 70% { transform: scale(1); box-shadow: 0 0 0 5px rgba(109,74,255,0); } }
        @keyframes headerShine { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }

        .msg-bubble { animation: msgSlideIn 0.28s cubic-bezier(.2,.8,.2,1) both; }
        .convo-item { animation: convoFade 0.3s ease both; transition: all 0.2s ease; }
        .chat-panel { animation: panelFade 0.3s ease; }
        .search-spinner { animation: searchSpin 0.6s linear infinite; }

        .send-btn { transition: transform 0.15s ease, box-shadow 0.2s ease; }
        .send-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(109,74,255,0.4); }
        .send-btn:active:not(:disabled) { transform: scale(0.95); }

        .msg-input:focus { border-color: rgba(109,74,255,0.5) !important; background: #fff !important; box-shadow: 0 0 0 4px rgba(109,74,255,0.1); }

        .unread-dot { animation: unreadPulse 1.8s ease infinite; }
        .msg-bubble-inner { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .msg-bubble-inner:hover { transform: translateY(-2px); }

        .convo-avatar { transition: transform 0.25s cubic-bezier(.34,1.56,.64,1); box-shadow: 0 2px 8px rgba(109,74,255,0.25); }
        .convo-item:hover .convo-avatar { transform: scale(1.1) rotate(-4deg); }
        .convo-item.active { background: linear-gradient(135deg, rgba(109,74,255,0.1), rgba(139,92,246,0.05)) !important; box-shadow: inset 0 0 0 1.5px rgba(109,74,255,0.25); }
        .convo-item:not(.active):hover { background: #F6F5FB !important; transform: translateX(2px); }

        .thread-header-shine { position: absolute; inset: 0; background: linear-gradient(100deg, transparent, rgba(255,255,255,0.15), transparent); animation: headerShine 3s ease-in-out infinite; }

        .sidebar-panel::-webkit-scrollbar, .thread-panel::-webkit-scrollbar { width: 6px; }
        .sidebar-panel::-webkit-scrollbar-thumb, .thread-panel::-webkit-scrollbar-thumb { background: rgba(109,74,255,0.15); border-radius: 10px; }
      `}</style>

      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 27, fontWeight: 700, color: "#14132B", marginBottom: 6, letterSpacing: -0.5 }}>
          Messages
        </h1>
        <p style={{ color: "rgba(20,19,43,0.5)", fontSize: 14 }}>Chat with organizers, teammates, and fellow students.</p>
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 210px)", background: "#F6F5FB", borderRadius: 22, border: "1px solid rgba(15,23,42,0.06)", overflow: "hidden", boxShadow: "0 10px 40px rgba(109,74,255,0.08)" }}>
        {/* Sidebar */}
        <div style={{ width: 320, background: "#fff", borderRight: "1px solid rgba(15,23,42,0.06)", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid rgba(15,23,42,0.05)" }}>
            <div style={{ position: "relative" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(109,74,255,0.5)" strokeWidth="2" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
                <circle cx="11" cy="11" r="6.5" />
                <path d="m20 20-4-4" strokeLinecap="round" />
              </svg>
              <input
                className="msg-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by username"
                style={{
                  width: "100%",
                  padding: "11px 36px 11px 38px",
                  borderRadius: 14,
                  border: "1.5px solid rgba(109,74,255,0.12)",
                  background: "#F6F5FB",
                  fontSize: 13.5,
                  outline: "none",
                  color: "#14132B",
                  boxSizing: "border-box",
                  transition: "all 0.2s ease",
                }}
              />
              {searching && (
                <div className="search-spinner" style={{ position: "absolute", right: 12, top: "50%", marginTop: -7, width: 14, height: 14, border: "2px solid rgba(109,74,255,0.2)", borderTop: "2px solid #6D4AFF", borderRadius: "50%" }} />
              )}
              {searchQuery && !searching && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(109,74,255,0.1)", border: "none", borderRadius: "50%", width: 20, height: 20, fontSize: 10, color: "#6D4AFF", cursor: "pointer" }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="sidebar-panel" style={{ flex: 1, overflowY: "auto", padding: "10px 0" }}>
            {searchQuery.length >= 2 ? (
              <>
                <div style={{ padding: "8px 20px", fontSize: 10.5, fontWeight: 800, color: "#6D4AFF", textTransform: "uppercase", letterSpacing: 0.6 }}>
                  Search Results
                </div>
                {searchResults.length === 0 && !searching ? (
                  <div style={{ padding: "36px 20px", textAlign: "center" }}>
                    <p style={{ fontSize: 12.5, color: "rgba(20,19,43,0.4)" }}>No users found</p>
                  </div>
                ) : (
                  searchResults.map((u, i) => (
                    <div
                      key={u.id}
                      className="convo-item"
                      style={{ animationDelay: `${i * 0.03}s`, display: "flex", alignItems: "center", gap: 12, padding: "11px 20px", cursor: "pointer", borderRadius: 14, margin: "2px 8px" }}
                      onClick={() => {
                        setActiveUsername(u.username);
                        setSearchQuery("");
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#F6F5FB")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <div className="convo-avatar" style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                        {u.name[0]?.toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ fontSize: 13.5, fontWeight: 700, color: "#14132B" }}>{u.name}</span>
                          {u.isVerified && <VerifiedTick />}
                        </div>
                        <div style={{ fontSize: 11.5, color: "rgba(20,19,43,0.4)" }}>@{u.username}</div>
                      </div>
                    </div>
                  ))
                )}
              </>
            ) : conversations.length === 0 ? (
              <div style={{ padding: "70px 26px", textAlign: "center" }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg, rgba(109,74,255,0.12), rgba(139,92,246,0.06))", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6D4AFF" strokeWidth="1.6"><path d="M3 12h4.5l1.5 3h6l1.5-3H21" strokeLinecap="round" strokeLinejoin="round" /><path d="M5 5h14l2 7v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-7l2-7Z" strokeLinejoin="round" /></svg>
                </div>
                <p style={{ fontSize: 13.5, color: "rgba(20,19,43,0.45)", lineHeight: 1.6, fontWeight: 500 }}>
                  No conversations yet.<br />Search a username above to start.
                </p>
              </div>
            ) : (
              conversations.map((c, i) => (
                <div
                  key={c.userId}
                  className={"convo-item" + (activeUsername === c.username ? " active" : "")}
                  style={{
                    animationDelay: `${i * 0.04}s`,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "13px 16px",
                    margin: "3px 8px",
                    borderRadius: 16,
                    cursor: "pointer",
                    position: "relative",
                  }}
                  onClick={() => setActiveUsername(c.username)}
                >
                  <div className="convo-avatar" style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, flexShrink: 0 }}>
                    {c.name[0]?.toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0 }}>
                        <span style={{ fontSize: 14, fontWeight: c.unread ? 800 : 700, color: "#14132B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {c.name}
                        </span>
                        {c.isVerified && <VerifiedTick />}
                      </div>
                      <span style={{ fontSize: 10.5, color: c.unread ? "#6D4AFF" : "rgba(20,19,43,0.35)", fontWeight: c.unread ? 700 : 400, flexShrink: 0, marginLeft: 6 }}>
                        {timeAgo(c.lastAt)}
                      </span>
                    </div>
                    <p style={{ fontSize: 12.5, color: c.unread ? "rgba(20,19,43,0.75)" : "rgba(20,19,43,0.42)", fontWeight: c.unread ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {c.lastMessage}
                    </p>
                  </div>
                  {c.unread && <div className="unread-dot" style={{ width: 9, height: 9, borderRadius: "50%", background: "#6D4AFF", flexShrink: 0 }} />}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat panel */}
        <div key={activeUsername || "empty"} className="chat-panel" style={{ flex: 1, display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #FBFAFF, #F6F5FB)" }}>
          {!activeUsername ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 76, height: 76, borderRadius: 22, background: "linear-gradient(135deg, rgba(109,74,255,0.14), rgba(139,92,246,0.06))", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#6D4AFF" strokeWidth="1.6">
                  <path d="M3 12h4.5l1.5 3h6l1.5-3H21" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 5h14l2 7v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-7l2-7Z" strokeLinejoin="round" />
                </svg>
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "rgba(20,19,43,0.55)" }}>Select a conversation</p>
              <p style={{ fontSize: 12.5, color: "rgba(20,19,43,0.35)", marginTop: 4 }}>Choose from your existing chats or start a new one</p>
            </div>
          ) : (
            <>
              <div
                onClick={() => otherUser && setViewingProfile(otherUser.username)}
                style={{ position: "relative", overflow: "hidden", padding: "18px 26px", display: "flex", alignItems: "center", gap: 13, cursor: "pointer", background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)", color: "#fff" }}
              >
                <div className="thread-header-shine" />
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, position: "relative" }}>
                  {otherUser?.name?.[0]?.toUpperCase()}
                </div>
                <div style={{ position: "relative" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontSize: 15.5, fontWeight: 700 }}>{otherUser?.name}</span>
                    {otherUser?.isVerified && (
                      <span style={{ color: "#fff", display: "inline-flex" }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 2.2 3.2-.6.8 3.2 3 1.5-1.2 3.1 1.2 3.1-3 1.5-.8 3.2-3.2-.6L12 22l-2.4-2.2-3.2.6-.8-3.2-3-1.5 1.2-3.1L2.6 9.5l3-1.5.8-3.2 3.2.6L12 2z" /><path d="M9 12l2 2 4-4" stroke="#6D4AFF" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>@{otherUser?.username}</div>
                </div>
              </div>

              <div className="thread-panel" style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
                {threadLoading ? (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", gap: 5 }}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#6D4AFF", animation: `dotBounce 1s ease-in-out ${i * 0.15}s infinite` }} />
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "rgba(20,19,43,0.35)", fontSize: 13 }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>👋</div>
                    No messages yet — say hello
                  </div>
                ) : (
                  groupedMessages.map((group, gi) => (
                    <div key={gi}>
                      <div style={{ display: "flex", justifyContent: "center", margin: "20px 0 16px" }}>
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: "#6D4AFF", background: "rgba(109,74,255,0.08)", padding: "5px 14px", borderRadius: 20, textTransform: "uppercase", letterSpacing: 0.5 }}>
                          {group.date}
                        </span>
                      </div>

                      {group.items.map((m, i) => {
                        const isMine = m.senderId === currentUserId;
                        const prev = group.items[i - 1];
                        const isNewRun = !prev || prev.senderId !== m.senderId;
                        const next = group.items[i + 1];
                        const isLastInRun = !next || next.senderId !== m.senderId;

                        return (
                          <div
                            key={m.id}
                            className="msg-bubble"
                            style={{
                              display: "flex",
                              justifyContent: isMine ? "flex-end" : "flex-start",
                              alignItems: "flex-end",
                              gap: 8,
                              marginTop: isNewRun ? 14 : 3,
                            }}
                          >
                            {!isMine && (
                              <div style={{ width: 24, visibility: isLastInRun ? "visible" : "hidden", flexShrink: 0 }}>
                                {isLastInRun && (
                                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, boxShadow: "0 2px 6px rgba(109,74,255,0.3)" }}>
                                    {otherUser?.name?.[0]?.toUpperCase()}
                                  </div>
                                )}
                              </div>
                            )}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start", maxWidth: "62%" }}>
                              <div
                                className="msg-bubble-inner"
                                style={{
                                  padding: "10px 15px",
                                  borderRadius: 16,
                                  fontSize: 14,
                                  lineHeight: 1.5,
                                  background: isMine ? "linear-gradient(135deg,#6D4AFF,#8B5CF6)" : "#fff",
                                  color: isMine ? "#fff" : "#14132B",
                                  border: isMine ? "none" : "1px solid rgba(15,23,42,0.06)",
                                  borderBottomRightRadius: isMine && isLastInRun ? 4 : 16,
                                  borderBottomLeftRadius: !isMine && isLastInRun ? 4 : 16,
                                  boxShadow: isMine ? "0 6px 16px rgba(109,74,255,0.25)" : "0 2px 6px rgba(15,23,42,0.04)",
                                }}
                              >
                                {m.content}
                              </div>
                              {isLastInRun && (
                                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, padding: "0 3px" }}>
                                  <span style={{ fontSize: 10, color: "rgba(20,19,43,0.32)" }}>{formatMsgTime(m.createdAt)}</span>
                                  {isMine && <ReadTick read={!!m.read} />}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              <div style={{ padding: "18px 26px", borderTop: "1px solid rgba(15,23,42,0.06)", display: "flex", gap: 12, background: "#fff" }}>
                <input
                  className="msg-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Type a message"
                  style={{
                    flex: 1,
                    padding: "13px 18px",
                    borderRadius: 16,
                    border: "1.5px solid rgba(109,74,255,0.1)",
                    background: "#F6F5FB",
                    fontSize: 14,
                    outline: "none",
                    color: "#14132B",
                    transition: "all 0.2s ease",
                  }}
                />
                <button
                  className="send-btn"
                  onClick={sendMessage}
                  disabled={sending || !input.trim()}
                  style={{
                    background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 16,
                    padding: "0 26px",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    opacity: sending || !input.trim() ? 0.5 : 1,
                    boxShadow: "0 4px 14px rgba(109,74,255,0.3)",
                  }}
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {viewingProfile && <ProfileModal username={viewingProfile} onClose={() => setViewingProfile(null)} />}
    </div>
  );
}