"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
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

function Avatar({ src, name, size, fontSize, className, style }: { src?: string | null; name: string; size: number; fontSize: number; className?: string; style?: React.CSSProperties }) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;
  return (
    <div
      className={className}
      style={{
        width: size, height: size, borderRadius: "50%",
        background: showImage ? undefined : "linear-gradient(135deg,#6D4AFF,#8B5CF6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize, fontWeight: 700, color: "#fff", overflow: "hidden", flexShrink: 0, ...style,
      }}
    >
      {showImage ? (
        <img src={src} onError={() => setFailed(true)} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        name[0]?.toUpperCase()
      )}
    </div>
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
  const [msgSearchOpen, setMsgSearchOpen] = useState(false);
  const [msgSearchQuery, setMsgSearchQuery] = useState("");
  const [otherTyping, setOtherTyping] = useState(false);
    const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    loadConversations();
    const poll = setInterval(loadConversations, 5000);
    return () => clearInterval(poll);
  }, []);

  useEffect(() => {
    const toUsername = searchParams.get("to");
    if (toUsername) setActiveUsername(toUsername);
  }, [searchParams]);

  useEffect(() => {
    if (activeUsername) {
      loadThread(activeUsername);
      setMobileView("chat");
    }
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

  // Poll for typing indicator
   useEffect(() => {
    if (!otherUser?.id || otherUser?.status === "DELETED") return;
    const poll = setInterval(() => {
      fetch(`/api/messages/typing?otherUserId=${otherUser.id}`)
        .then((r) => r.json())
        .then((d) => setOtherTyping(!!d.typing))
        .catch(() => {});
    }, 2000);
    return () => clearInterval(poll);
  }, [otherUser?.id, otherUser?.status]);

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

  function handleTyping() {
    if (!otherUser?.id) return;
    fetch("/api/messages/typing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId: otherUser.id }),
    }).catch(() => {});
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

  async function deleteMessage(id: string) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, content: "This message was deleted" } : m)));
    await fetch(`/api/messages/delete/${id}`, { method: "DELETE" }).catch(() => {});
  }

  function goBackToList() {
    setMobileView("list");
  }

   const otherUserDeleted = otherUser?.status === "DELETED";

  const filteredMessages = msgSearchQuery.trim()
    ? messages.filter((m) => m.content.toLowerCase().includes(msgSearchQuery.toLowerCase()))
    : messages;

  const groupedMessages: { date: string; items: any[] }[] = [];
  filteredMessages.forEach((m) => {
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
        @keyframes headIn { from { opacity:0; transform: translateX(-8px); } to { opacity:1; transform: translateX(0); } }
        @keyframes typingBounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-3px); } }
        @keyframes slideInPanel { from { opacity:0; transform: translateX(20px); } to { opacity:1; transform: translateX(0); } }

        .head-anim { animation: headIn 0.5s cubic-bezier(.2,.8,.2,1) both; }
        .msg-bubble { animation: msgSlideIn 0.28s cubic-bezier(.2,.8,.2,1) both; }
        .convo-item { animation: convoFade 0.3s ease both; transition: all 0.2s ease; }
        .chat-panel { animation: panelFade 0.3s ease; }
        .search-spinner { animation: searchSpin 0.6s linear infinite; }

        .send-btn { transition: transform 0.15s ease, box-shadow 0.2s ease; }
        .send-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(109,74,255,0.42); }
        .send-btn:active:not(:disabled) { transform: scale(0.95); }

        .msg-input:focus { border-color: rgba(109,74,255,0.5) !important; background: #fff !important; box-shadow: 0 0 0 4px rgba(109,74,255,0.1); }

        .unread-dot { animation: unreadPulse 1.8s ease infinite; }
        .msg-bubble-inner { transition: transform 0.15s ease, box-shadow 0.15s ease; position: relative; }
        .msg-bubble-inner:hover { transform: translateY(-2px); }
        .msg-bubble-inner:hover .msg-delete-btn { opacity: 1; }
        .msg-delete-btn { opacity: 0; transition: opacity 0.15s ease, transform 0.15s ease; cursor: pointer; }
        .msg-delete-btn:hover { transform: scale(1.15); }
        .msg-delete-btn:active { transform: scale(0.9); }

        .convo-avatar { transition: transform 0.25s cubic-bezier(.34,1.56,.64,1); box-shadow: 0 2px 8px rgba(109,74,255,0.25); }
        .convo-item:hover .convo-avatar { transform: scale(1.1) rotate(-4deg); }
        .convo-item.active { background: linear-gradient(135deg, rgba(109,74,255,0.1), rgba(139,92,246,0.05)) !important; box-shadow: inset 0 0 0 1.5px rgba(109,74,255,0.25); }
        .convo-item:not(.active):hover { background: #F6F5FB !important; transform: translateX(2px); }

        .thread-header-shine { position: absolute; inset: 0; background: linear-gradient(100deg, transparent, rgba(255,255,255,0.15), transparent); animation: headerShine 3s ease-in-out infinite; }

        .sidebar-panel::-webkit-scrollbar, .thread-panel::-webkit-scrollbar { width: 6px; }
        .sidebar-panel::-webkit-scrollbar-thumb, .thread-panel::-webkit-scrollbar-thumb { background: rgba(109,74,255,0.15); border-radius: 10px; }

        .clear-search-btn { transition: background 0.15s ease, transform 0.15s ease; }
        .clear-search-btn:hover { background: rgba(109,74,255,0.18) !important; transform: translateY(-50%) scale(1.08); }

        .profile-trigger { transition: opacity 0.15s ease; }
        .profile-trigger:hover { opacity: 0.9; }

        .icon-btn { transition: background 0.15s ease, transform 0.15s ease; cursor: pointer; -webkit-tap-highlight-color: transparent; }
        .icon-btn:hover, .icon-btn:active { background: rgba(255,255,255,0.2); transform: scale(0.96); }

        .typing-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(20,19,43,0.4); display: inline-block; animation: typingBounce 1.2s ease-in-out infinite; }

        .msg-search-panel { animation: slideInPanel 0.2s ease both; }

        /* Mobile responsive: stack list/chat, show one at a time */
        @media (max-width: 820px) {
          .messages-shell { height: calc(100vh - 170px) !important; }
          .messages-sidebar { display: none !important; }
          .messages-sidebar.mobile-show { display: flex !important; width: 100% !important; border-right: none !important; }
          .messages-chatpanel { display: none !important; }
          .messages-chatpanel.mobile-show { display: flex !important; width: 100% !important; }
          .mobile-back-btn { display: flex !important; }
        }
      `}</style>

      <div className="head-anim" style={{ marginBottom: 22, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 13, background: "linear-gradient(135deg, rgba(109,74,255,0.14), rgba(139,92,246,0.07))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#6D4AFF" strokeWidth="1.7">
            <path d="M3 12h4.5l1.5 3h6l1.5-3H21" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 5h14l2 7v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-7l2-7Z" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 27, fontWeight: 700, color: "#14132B", letterSpacing: -0.5, marginBottom: 2 }}>
            Messages
          </h1>
          <p style={{ color: "rgba(20,19,43,0.5)", fontSize: 13.5 }}>Chat with organizers, teammates, and fellow students.</p>
        </div>
      </div>

      <div className="messages-shell" style={{ display: "flex", height: "calc(100vh - 210px)", background: "#F6F5FB", borderRadius: 22, border: "1px solid rgba(15,23,42,0.06)", overflow: "hidden", boxShadow: "0 12px 44px rgba(109,74,255,0.1)" }}>
        {/* Sidebar */}
        <div className={"messages-sidebar" + (mobileView === "list" ? " mobile-show" : "")} style={{ width: 320, background: "#fff", borderRight: "1px solid rgba(15,23,42,0.06)", display: "flex", flexDirection: "column" }}>
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
                  width: "100%", padding: "12px 36px 12px 38px", borderRadius: 14,
                  border: "1.5px solid rgba(109,74,255,0.12)", background: "#F6F5FB", fontSize: 14,
                  outline: "none", color: "#14132B", boxSizing: "border-box", transition: "all 0.2s ease",
                }}
              />
              {searching && (
                <div className="search-spinner" style={{ position: "absolute", right: 12, top: "50%", marginTop: -7, width: 14, height: 14, border: "2px solid rgba(109,74,255,0.2)", borderTop: "2px solid #6D4AFF", borderRadius: "50%" }} />
              )}
              {searchQuery && !searching && (
                <button onClick={() => setSearchQuery("")} className="clear-search-btn" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(109,74,255,0.1)", border: "none", borderRadius: "50%", width: 22, height: 22, fontSize: 11, color: "#6D4AFF", cursor: "pointer" }}>
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="sidebar-panel" style={{ flex: 1, overflowY: "auto", padding: "10px 0" }}>
            {searchQuery.length >= 2 ? (
              <>
                <div style={{ padding: "8px 20px", fontSize: 10.5, fontWeight: 800, color: "#6D4AFF", textTransform: "uppercase", letterSpacing: 0.6 }}>Search Results</div>
                {searchResults.length === 0 && !searching ? (
                  <div style={{ padding: "36px 20px", textAlign: "center" }}>
                    <p style={{ fontSize: 12.5, color: "rgba(20,19,43,0.4)" }}>No users found</p>
                  </div>
                ) : (
                  searchResults.map((u, i) => (
                    <div
                      key={u.id}
                      className="convo-item"
                      style={{ animationDelay: `${i * 0.03}s`, display: "flex", alignItems: "center", gap: 12, padding: "13px 20px", cursor: "pointer", borderRadius: 14, margin: "2px 8px", minHeight: 44 }}
                      onClick={() => { setActiveUsername(u.username); setSearchQuery(""); }}
                    >
                      <Avatar src={u.image} name={u.name} size={36} fontSize={13} className="convo-avatar" />
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
                <div style={{ width: 56, height: 56, borderRadius: 18, background: "linear-gradient(135deg, rgba(109,74,255,0.14), rgba(139,92,246,0.07))", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 6px 18px rgba(109,74,255,0.12)" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6D4AFF" strokeWidth="1.6"><path d="M3 12h4.5l1.5 3h6l1.5-3H21" strokeLinecap="round" strokeLinejoin="round" /><path d="M5 5h14l2 7v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-7l2-7Z" strokeLinejoin="round" /></svg>
                </div>
                <p style={{ fontSize: 13.5, color: "rgba(20,19,43,0.45)", lineHeight: 1.6, fontWeight: 500 }}>No conversations yet.<br />Search a username above to start.</p>
              </div>
            ) : (
              <>
                <div style={{ padding: "6px 20px 10px", fontSize: 10.5, fontWeight: 800, color: "rgba(20,19,43,0.35)", textTransform: "uppercase", letterSpacing: 0.6 }}>Conversations</div>
               

                {conversations.map((c, i) => {
                  const isDeleted = c.status === "DELETED";
                  const displayName = isDeleted ? "Deleted account" : c.name;
                  return (
                    <div
                      key={c.userId}
                      className={"convo-item" + (activeUsername === c.username ? " active" : "")}
                      style={{ animationDelay: `${i * 0.04}s`, display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", margin: "3px 8px", borderRadius: 16, cursor: isDeleted ? "default" : "pointer", position: "relative", minHeight: 48, opacity: isDeleted ? 0.55 : 1 }}
                      onClick={() => !isDeleted && setActiveUsername(c.username)}
                    >
                      <Avatar src={isDeleted ? null : c.image} name={displayName} size={46} fontSize={16} className="convo-avatar" />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0 }}>
                            <span style={{ fontSize: 14, fontWeight: c.unread ? 800 : 700, color: isDeleted ? "rgba(20,19,43,0.5)" : "#14132B", fontStyle: isDeleted ? "italic" : "normal", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{displayName}</span>
                            {!isDeleted && c.isVerified && <VerifiedTick />}
                          </div>
                          <span style={{ fontSize: 10.5, color: c.unread ? "#6D4AFF" : "rgba(20,19,43,0.35)", fontWeight: c.unread ? 700 : 400, flexShrink: 0, marginLeft: 6 }}>{timeAgo(c.lastAt)}</span>
                        </div>
                        <p style={{ fontSize: 12.5, color: c.unread ? "rgba(20,19,43,0.75)" : "rgba(20,19,43,0.42)", fontWeight: c.unread ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.lastMessage}</p>
                      </div>
                      {c.unread && !isDeleted && <div className="unread-dot" style={{ width: 9, height: 9, borderRadius: "50%", background: "#6D4AFF", flexShrink: 0 }} />}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* Chat panel */}
        <div className={"messages-chatpanel" + (mobileView === "chat" ? " mobile-show" : "")} key={activeUsername || "empty"} style={{ flex: 1, display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #FBFAFF, #F6F5FB)" }}>
          {!activeUsername ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 84, height: 84, borderRadius: 24, background: "linear-gradient(135deg, rgba(109,74,255,0.16), rgba(139,92,246,0.07))", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, boxShadow: "0 10px 30px rgba(109,74,255,0.14)" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6D4AFF" strokeWidth="1.6">
                  <path d="M3 12h4.5l1.5 3h6l1.5-3H21" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 5h14l2 7v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-7l2-7Z" strokeLinejoin="round" />
                </svg>
              </div>
              <p style={{ fontSize: 15.5, fontWeight: 700, color: "rgba(20,19,43,0.6)", fontFamily: "'Sora', sans-serif" }}>Select a conversation</p>
              <p style={{ fontSize: 12.5, color: "rgba(20,19,43,0.35)", marginTop: 5 }}>Choose from your existing chats or start a new one</p>
            </div>
          ) : (
            <>
              <div className="chat-panel" style={{ position: "relative", overflow: "hidden", padding: "16px 20px", display: "flex", alignItems: "center", gap: 10, background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)", color: "#fff", boxShadow: "0 4px 14px rgba(109,74,255,0.2)" }}>
                <div className="thread-header-shine" />
                <button className="icon-btn mobile-back-btn" onClick={goBackToList} style={{ display: "none", background: "none", border: "none", color: "#fff", width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                           <div onClick={() => otherUser && !otherUserDeleted && setViewingProfile(otherUser.username)} className="profile-trigger" style={{ display: "flex", alignItems: "center", gap: 13, cursor: otherUserDeleted ? "default" : "pointer", position: "relative", flex: 1, minWidth: 0 }}>
                  <Avatar src={otherUserDeleted ? null : otherUser?.image} name={otherUserDeleted ? "Deleted account" : (otherUser?.name || "?")} size={42} fontSize={16} style={{ border: "2px solid rgba(255,255,255,0.3)" }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ fontSize: 15.5, fontWeight: 700, fontFamily: "'Sora', sans-serif", fontStyle: otherUserDeleted ? "italic" : "normal", opacity: otherUserDeleted ? 0.75 : 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {otherUserDeleted ? "Deleted account" : otherUser?.name}
                      </span>
                      {!otherUserDeleted && otherUser?.isVerified && (
                        <span style={{ color: "#fff", display: "inline-flex", flexShrink: 0 }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 2.2 3.2-.6.8 3.2 3 1.5-1.2 3.1 1.2 3.1-3 1.5-.8 3.2-3.2-.6L12 22l-2.4-2.2-3.2.6-.8-3.2-3-1.5 1.2-3.1L2.6 9.5l3-1.5.8-3.2 3.2.6L12 2z" /><path d="M9 12l2 2 4-4" stroke="#6D4AFF" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.85 }}>
                      {otherUserDeleted ? (
                        "This account no longer exists"
                      ) : otherTyping ? (
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          typing
                          <span className="typing-dot" style={{ background: "rgba(255,255,255,0.7)" }} />
                          <span className="typing-dot" style={{ background: "rgba(255,255,255,0.7)", animationDelay: "0.15s" }} />
                          <span className="typing-dot" style={{ background: "rgba(255,255,255,0.7)", animationDelay: "0.3s" }} />
                        </span>
                      ) : (
                        `@${otherUser?.username}`
                      )}
                    </div>
                  </div>
                </div>
                <button className="icon-btn" onClick={() => setMsgSearchOpen((v) => !v)} style={{ background: msgSearchOpen ? "rgba(255,255,255,0.2)" : "none", border: "none", color: "#fff", width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" strokeLinecap="round" /></svg>
                </button>
              </div>

              {msgSearchOpen && (
                <div className="msg-search-panel" style={{ padding: "10px 18px", background: "#fff", borderBottom: "1px solid rgba(15,23,42,0.06)" }}>
                  <input
                    autoFocus
                    value={msgSearchQuery}
                    onChange={(e) => setMsgSearchQuery(e.target.value)}
                    placeholder="Search in this conversation..."
                    style={{ width: "100%", padding: "9px 14px", borderRadius: 10, border: "1.5px solid rgba(109,74,255,0.15)", fontSize: 13.5, outline: "none", boxSizing: "border-box" }}
                  />
                  {msgSearchQuery && <p style={{ fontSize: 11.5, color: "rgba(20,19,43,0.4)", marginTop: 6 }}>{filteredMessages.length} result{filteredMessages.length !== 1 ? "s" : ""}</p>}
                </div>
              )}

              <div className="thread-panel" style={{ flex: 1, overflowY: "auto", padding: "24px 20px" }}>
                {threadLoading ? (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", gap: 5 }}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#6D4AFF", animation: `dotBounce 1s ease-in-out ${i * 0.15}s infinite` }} />
                    ))}
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "rgba(20,19,43,0.35)", fontSize: 13 }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{msgSearchQuery ? "🔍" : "👋"}</div>
                    {msgSearchQuery ? "No messages match your search" : "No messages yet — say hello"}
                  </div>
                ) : (
                  groupedMessages.map((group, gi) => (
                    <div key={gi}>
                      <div style={{ display: "flex", justifyContent: "center", margin: "20px 0 16px" }}>
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: "#6D4AFF", background: "rgba(109,74,255,0.08)", padding: "5px 14px", borderRadius: 20, textTransform: "uppercase", letterSpacing: 0.5 }}>{group.date}</span>
                      </div>

                      {group.items.map((m, i) => {
                        const isMine = m.senderId === currentUserId;
                        const prev = group.items[i - 1];
                        const isNewRun = !prev || prev.senderId !== m.senderId;
                        const next = group.items[i + 1];
                        const isLastInRun = !next || next.senderId !== m.senderId;
                        const isDeleted = m.content === "This message was deleted";

                        return (
                          <div key={m.id} className="msg-bubble" style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8, marginTop: isNewRun ? 14 : 3 }}>
                            {!isMine && (
                              <div style={{ width: 24, visibility: isLastInRun ? "visible" : "hidden", flexShrink: 0 }}>
                                {isLastInRun && <Avatar src={otherUser?.image} name={otherUser?.name || "?"} size={24} fontSize={10} style={{ boxShadow: "0 2px 6px rgba(109,74,255,0.3)" }} />}
                              </div>
                            )}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start", maxWidth: "72%" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                {isMine && !isDeleted && (
                                  <span className="msg-delete-btn" onClick={() => deleteMessage(m.id)} title="Delete message" style={{ fontSize: 11, color: "rgba(20,19,43,0.35)", order: -1 }}>
                                    🗑
                                  </span>
                                )}
                                <div
                                  className="msg-bubble-inner"
                                  style={{
                                    padding: "11px 15px", borderRadius: 16, fontSize: 14.5, lineHeight: 1.5,
                                    background: isMine ? (isDeleted ? "rgba(109,74,255,0.35)" : "linear-gradient(135deg,#6D4AFF,#8B5CF6)") : (isDeleted ? "#F0EFF5" : "#fff"),
                                    color: isMine ? "#fff" : "#14132B",
                                    fontStyle: isDeleted ? "italic" : "normal",
                                    opacity: isDeleted ? 0.7 : 1,
                                    border: isMine ? "none" : "1px solid rgba(15,23,42,0.06)",
                                    borderBottomRightRadius: isMine && isLastInRun ? 4 : 16,
                                    borderBottomLeftRadius: !isMine && isLastInRun ? 4 : 16,
                                    boxShadow: isMine ? "0 6px 16px rgba(109,74,255,0.25)" : "0 2px 6px rgba(15,23,42,0.04)",
                                  }}
                                >
                                  {m.content}
                                </div>
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

              <div style={{ padding: "16px 18px", borderTop: "1px solid rgba(15,23,42,0.06)", display: "flex", gap: 10, background: "#fff" }}>
                <input
                  className="msg-input"
                  value={input}
                  onChange={(e) => { setInput(e.target.value); handleTyping(); }}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Type a message"
                  style={{ flex: 1, padding: "14px 18px", borderRadius: 16, border: "1.5px solid rgba(109,74,255,0.1)", background: "#F6F5FB", fontSize: 15, outline: "none", color: "#14132B", transition: "all 0.2s ease", minHeight: 48, boxSizing: "border-box" }}
                />
                <button
                  className="send-btn"
                  onClick={sendMessage}
                  disabled={sending || !input.trim()}
                  style={{ background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)", color: "#fff", border: "none", borderRadius: 16, padding: "0 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: sending || !input.trim() ? 0.5 : 1, boxShadow: "0 4px 14px rgba(109,74,255,0.3)", minWidth: 48 }}
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