"use client";
import { useState, useMemo, useEffect } from "react";
import ChallengeCard from "./ChallengeCard";
import ChallengeModal from "./ChallengeModal";


const STATUS_FILTERS = ["ALL", "LIVE", "CLOSED"];
const STATUS_LABELS: Record<string, string> = {
  ALL: "All",
  LIVE: "Live",
  CLOSED: "Closed",
};

const STUDENT_STATUS_FILTERS = ["ALL", "OPEN", "CLOSING_SOON", "CLOSED"];
const STUDENT_STATUS_LABELS: Record<string, string> = {
  ALL: "All",
  OPEN: "Open",
  CLOSING_SOON: "Closing Soon",
  CLOSED: "Closed",
};

function getEffectiveStatus(c: any): "LIVE" | "CLOSED" {
  const isPastDeadline = new Date(c.deadline).getTime() < Date.now();
  const dbClosed = c.status === "CLOSED" || c.status === "COMPLETED";
  return isPastDeadline || dbClosed ? "CLOSED" : "LIVE";
}

function getStudentStatus(c: any): "OPEN" | "CLOSING_SOON" | "CLOSED" {
  const diff = new Date(c.deadline).getTime() - Date.now();
  const days = Math.ceil(diff / 86400000);
  const dbClosed = c.status === "CLOSED" || c.status === "COMPLETED";
  if (diff < 0 || dbClosed) return "CLOSED";
  if (days <= 1) return "CLOSING_SOON";
  return "OPEN";
}

export default function MyChallengesList({
  challenges,
  role,
  joinedIds,
  currentUserId,
  organizers = [],
}: {
  challenges: any[];
  role: string;
  joinedIds: string[];
  currentUserId?: string;
  organizers?: { id: string; orgName: string; isVerified: boolean }[];
}) {


const [active, setActive] = useState<any>(null);
  const [filterOrgId, setFilterOrgId] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [studentStatusFilter, setStudentStatusFilter] = useState<string>("ALL");
  const [joinedOnly, setJoinedOnly] = useState(false);
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/bookmarks")
      .then((r) => r.json())
      .then((d) => setBookmarkedIds(d.challengeIds || []));
  }, []);

  async function toggleBookmark(challengeId: string) {
    setBookmarkedIds((prev) =>
      prev.includes(challengeId) ? prev.filter((id) => id !== challengeId) : [...prev, challengeId]
    );
    const res = await fetch("/api/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId }),
    });
    if (!res.ok) {
      setBookmarkedIds((prev) =>
        prev.includes(challengeId) ? prev.filter((id) => id !== challengeId) : [...prev, challengeId]
      );
    }
  }
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "deadline" | "submissions">("newest");

  const isOrganizer = role === "ORGANIZER";

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: challenges.length, LIVE: 0, CLOSED: 0 };
    challenges.forEach((c) => {
      const eff = getEffectiveStatus(c);
      counts[eff] = (counts[eff] || 0) + 1;
    });
    return counts;
  }, [challenges]);


const filteredChallenges = useMemo(() => {
    let list = challenges;

    if (!isOrganizer && filterOrgId !== "ALL") {
      list = list.filter((c) => c.organizer?.id === filterOrgId);
    }

    if (isOrganizer && statusFilter !== "ALL") {
      list = list.filter((c) => getEffectiveStatus(c) === statusFilter);
    }

    if (!isOrganizer && studentStatusFilter !== "ALL") {
      list = list.filter((c) => getStudentStatus(c) === studentStatusFilter);
    }

    if (!isOrganizer && joinedOnly) {
      list = list.filter((c) => joinedIds.includes(c.id) || !!c.myTeamForThisChallenge);
    }

    if (!isOrganizer && bookmarkedOnly) {
      list = list.filter((c) => bookmarkedIds.includes(c.id));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(q));
    }

    list = [...list].sort((a, b) => {
      if (sortBy === "deadline") {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sortBy === "submissions") {
        return (b._count?.submissions || 0) - (a._count?.submissions || 0);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return list;
}, [challenges, filterOrgId, statusFilter, studentStatusFilter, joinedOnly, bookmarkedOnly, bookmarkedIds, search, sortBy, isOrganizer, joinedIds]);

  return (
    <>
      <style>{`
        @keyframes mcGridIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
        @keyframes mcFilterPop { 0% { transform: scale(0.9); } 60% { transform: scale(1.05); } 100% { transform: scale(1); } }
        .mc-search:focus { border-color: rgba(109,74,255,0.4) !important; box-shadow: 0 0 0 3px rgba(109,74,255,0.08); }
        .mc-sort:focus { border-color: rgba(109,74,255,0.4) !important; }
        .mc-pill { transition: all 0.2s ease; }
        .mc-pill:active { animation: mcFilterPop 0.25s ease; }
        .mc-pill:hover:not(.mc-pill-active) { background: rgba(109,74,255,0.08) !important; color: #6D4AFF !important; }
        .mc-grid-item { animation: mcGridIn 0.35s cubic-bezier(.2,.8,.2,1) both; }
        .mc-count-badge { font-size: 10.5px; font-weight: 700; opacity: 0.7; margin-left: 4px; }
      `}</style>

      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 220px", minWidth: 200 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(20,19,43,0.35)" strokeWidth="2" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
            <circle cx="11" cy="11" r="6.5" />
            <path d="m20 20-4-4" strokeLinecap="round" />
          </svg>
          <input
            className="mc-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search challenges..."
            style={{
              width: "100%",
              padding: "9px 14px 9px 34px",
              borderRadius: 10,
              border: "1px solid rgba(15,23,42,0.08)",
              background: "#fff",
              fontSize: 13,
              outline: "none",
              color: "#14132B",
              boxSizing: "border-box",
              transition: "all 0.2s ease",
            }}
          />
        </div>

        <select
          className="mc-sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          style={{
            padding: "9px 14px",
            borderRadius: 10,
            border: "1px solid rgba(15,23,42,0.08)",
            background: "#fff",
            fontSize: 13,
            fontWeight: 600,
            color: "#14132B",
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option value="newest">Newest first</option>
          <option value="deadline">Deadline soonest</option>
          {isOrganizer && <option value="submissions">Most submissions</option>}
        </select>
      </div>

      {isOrganizer && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              className={"mc-pill" + (statusFilter === s ? " mc-pill-active" : "")}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                border: "none",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                background: statusFilter === s ? "linear-gradient(135deg,#6D4AFF,#8B5CF6)" : "rgba(20,19,43,0.05)",
                color: statusFilter === s ? "#fff" : "rgba(20,19,43,0.6)",
              }}
            >
              {STATUS_LABELS[s]}
              <span className="mc-count-badge">{statusCounts[s] || 0}</span>
            </button>
          ))}
        </div>
      )}

     {!isOrganizer && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12, alignItems: "center" }}>
          {STUDENT_STATUS_FILTERS.map((s) => (
            <button
              key={s}
              className={"mc-pill" + (studentStatusFilter === s ? " mc-pill-active" : "")}
              onClick={() => setStudentStatusFilter(s)}
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                border: "none",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                background: studentStatusFilter === s ? "linear-gradient(135deg,#6D4AFF,#8B5CF6)" : "rgba(20,19,43,0.05)",
                color: studentStatusFilter === s ? "#fff" : "rgba(20,19,43,0.6)",
              }}
            >
              {STUDENT_STATUS_LABELS[s]}
            </button>
          ))}



<button
            onClick={() => setJoinedOnly(!joinedOnly)}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              border: joinedOnly ? "none" : "1px solid rgba(109,74,255,0.25)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: joinedOnly ? "linear-gradient(135deg,#16A34A,#15803D)" : "transparent",
              color: joinedOnly ? "#fff" : "#6D4AFF",
              marginLeft: "auto",
            }}
          >
            {joinedOnly ? "✓" : ""} My Joined Only
          </button>
          <button
            onClick={() => setBookmarkedOnly(!bookmarkedOnly)}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              border: bookmarkedOnly ? "none" : "1px solid rgba(217,119,6,0.25)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: bookmarkedOnly ? "linear-gradient(135deg,#D97706,#B45309)" : "transparent",
              color: bookmarkedOnly ? "#fff" : "#B45309",
            }}
          >
            {bookmarkedOnly ? "🔖" : "🔖"} Bookmarked
          </button>
        </div>
      )}

      {!isOrganizer && organizers.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          <button
            className={"mc-pill" + (filterOrgId === "ALL" ? " mc-pill-active" : "")}
            onClick={() => setFilterOrgId("ALL")}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              border: "none",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              background: filterOrgId === "ALL" ? "linear-gradient(135deg,#6D4AFF,#8B5CF6)" : "rgba(20,19,43,0.05)",
              color: filterOrgId === "ALL" ? "#fff" : "rgba(20,19,43,0.6)",
            }}
          >
            All Organizers
          </button>
          {organizers.map((o) => (
            <button
              key={o.id}
              className={"mc-pill" + (filterOrgId === o.id ? " mc-pill-active" : "")}
              onClick={() => setFilterOrgId(o.id)}
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                border: "none",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: filterOrgId === o.id ? "linear-gradient(135deg,#6D4AFF,#8B5CF6)" : "rgba(20,19,43,0.05)",
                color: filterOrgId === o.id ? "#fff" : "rgba(20,19,43,0.6)",
              }}
            >
              {o.orgName}
              {o.isVerified && (
                <span style={{ display: "inline-flex", color: filterOrgId === o.id ? "#fff" : "#2563EB" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l2.4 2.2 3.2-.6.8 3.2 3 1.5-1.2 3.1 1.2 3.1-3 1.5-.8 3.2-3.2-.6L12 22l-2.4-2.2-3.2.6-.8-3.2-3-1.5 1.2-3.1L2.6 9.5l3-1.5.8-3.2 3.2.6L12 2z" />
                    <path d="M9 12l2 2 4-4" stroke={filterOrgId === o.id ? "#6D4AFF" : "#fff"} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {filteredChallenges.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.07)", padding: 40, textAlign: "center" }}>
          <p style={{ color: "rgba(20,19,43,0.4)", fontSize: 14 }}>No challenges match this filter.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
          {filteredChallenges.map((c, i) => (
            <div key={c.id} className="mc-grid-item" style={{ animationDelay: `${Math.min(i * 0.04, 0.3)}s` }}>
             <ChallengeCard
                challenge={c}
                onClick={() => setActive(c)}
                isOrganizer={isOrganizer}
                isJoined={joinedIds.includes(c.id) || !!c.myTeamForThisChallenge}
                isBookmarked={bookmarkedIds.includes(c.id)}
                onToggleBookmark={toggleBookmark}
              />
            </div>
          ))}
        </div>
      )}
      {active && (
        <ChallengeModal
          challenge={active}
          onClose={() => setActive(null)}
          joined={joinedIds.includes(active.id) || !!active.myTeamForThisChallenge}
          alreadySubmitted={!!active.hasSubmitted}
          myTeam={active.myTeamForThisChallenge}
          currentUserId={currentUserId}
          isOrganizer={isOrganizer}
        />
      )}
    </>
  );
}