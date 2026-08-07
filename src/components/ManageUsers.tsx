"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type SortKey = "date_desc" | "date_asc" | "name_asc" | "name_desc";

function AnimatedCount({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    const from = prevValue.current;
    const to = value;
    prevValue.current = value;
    if (from === to) {
      setDisplay(to);
      return;
    }
    const start = performance.now();
    const duration = 700;
    function tick(now: number) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [value]);

  return <>{display}</>;
}

function Avatar({ user, size = 42 }: { user: any; size?: number }) {
  const rc: Record<string, string> = { STUDENT: "#2563EB", ORGANIZER: "#D97706", ADMIN: "#6D4AFF" };
  return (
    <div
      className="mu-avatar"
      title={user.name}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: user.image ? "transparent" : "linear-gradient(135deg,#6D4AFF,#8B5CF6)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.36,
        fontWeight: 700,
        flexShrink: 0,
        overflow: "hidden",
        boxShadow: `0 3px 10px ${(rc[user.role] || "#6D4AFF")}33`,
      }}
    >
      {user.image ? (
        <img src={user.image} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        user.name[0]?.toUpperCase()
      )}
    </div>
  );
}

function useEscapeKey(onEscape: () => void, active: boolean) {
  useEffect(() => {
    if (!active) return;
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onEscape();
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active, onEscape]);
}

export default function ManageUsers({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "STUDENT" | "ORGANIZER">("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("date_desc");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<any>(null);
  const [confirmText, setConfirmText] = useState("");
  const [bulkConfirm, setBulkConfirm] = useState<string[] | null>(null);
  const [bulkConfirmText, setBulkConfirmText] = useState("");
  const [toast, setToast] = useState<{ msg: string; tone: string } | null>(null);
  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, sortKey]);

  function load() {
    setLoading(true);
    setLoadError(false);
    fetch("/api/admin/users")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then((d) => {
        setUsers(d.users || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setLoadError(true);
      });
  }

  async function loadSilently() {
    try {
      const r = await fetch("/api/admin/users");
      const d = await r.json();
      setUsers(d.users || []);
    } catch {
      // keep the current list on screen if a background refresh fails
    }
  }

  function showToast(msg: string, tone: string = "#14132B") {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 3000);
  }

  async function deleteUser(id: string, name: string) {
    setBusyId(id);
    try {
      const r = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      setConfirmDelete(null);
      setConfirmText("");
      setSelected((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
      await loadSilently();
      showToast(`${name} has been permanently removed`, "#B91C1C");
    } catch {
      showToast(`Couldn't remove ${name} — try again`, "#B91C1C");
    } finally {
      setBusyId(null);
    }
  }

  async function setStatus(id: string, status: "ACTIVE" | "SUSPENDED", name: string) {
    setBusyId(id);
    try {
      const r = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!r.ok) throw new Error();
      await loadSilently();
      showToast(status === "SUSPENDED" ? `${name} placed on hold` : `${name} is active again`, status === "SUSPENDED" ? "#B45309" : "#15803D");
    } catch {
      showToast(`Couldn't update ${name} — try again`, "#B91C1C");
    } finally {
      setBusyId(null);
    }
  }

  async function bulkSetStatus(ids: string[], status: "ACTIVE" | "SUSPENDED") {
    setBulkBusy(true);
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/users/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          })
        )
      );
      await loadSilently();
      setSelected(new Set());
      showToast(
        status === "SUSPENDED" ? `${ids.length} user${ids.length > 1 ? "s" : ""} placed on hold` : `${ids.length} user${ids.length > 1 ? "s" : ""} active again`,
        status === "SUSPENDED" ? "#B45309" : "#15803D"
      );
    } catch {
      showToast("Some updates failed — try again", "#B91C1C");
    } finally {
      setBulkBusy(false);
    }
  }

  async function bulkDelete(ids: string[]) {
    setBulkBusy(true);
    try {
      await Promise.all(ids.map((id) => fetch(`/api/admin/users/${id}`, { method: "DELETE" })));
      await loadSilently();
      setSelected(new Set());
      setBulkConfirm(null);
      setBulkConfirmText("");
      showToast(`${ids.length} user${ids.length > 1 ? "s" : ""} permanently removed`, "#B91C1C");
    } catch {
      showToast("Some deletions failed — try again", "#B91C1C");
    } finally {
      setBulkBusy(false);
    }
  }

  const visible = users.filter((u) => u.status !== "DELETED" && u.role !== "ADMIN");
  const searched = visible.filter((u) => {
    if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.username?.toLowerCase().includes(q);
    }
    return true;
  });

  const sorted = [...searched].sort((a, b) => {
    switch (sortKey) {
      case "date_asc":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "name_asc":
        return a.name.localeCompare(b.name);
      case "name_desc":
        return b.name.localeCompare(a.name);
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const counts = {
    ALL: visible.length,
    STUDENT: visible.filter((u) => u.role === "STUDENT").length,
    ORGANIZER: visible.filter((u) => u.role === "ORGANIZER").length,
  };

  const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
    STUDENT: { bg: "rgba(37,99,235,0.08)", color: "#2563EB" },
    ORGANIZER: { bg: "rgba(217,119,6,0.08)", color: "#D97706" },
  };

  const pageIds = pageItems.map((u) => u.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const somePageSelected = pageIds.some((id) => selected.has(id));

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = somePageSelected && !allPageSelected;
    }
  }, [somePageSelected, allPageSelected, pageItems.length]);

  const toggleSelectAll = useCallback(() => {
    setSelected((s) => {
      const n = new Set(s);
      if (allPageSelected) {
        pageIds.forEach((id) => n.delete(id));
      } else {
        pageIds.forEach((id) => n.add(id));
      }
      return n;
    });
  }, [allPageSelected, pageIds]);

  function toggleSelect(id: string) {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  const closeModals = useCallback(() => {
    setConfirmDelete(null);
    setConfirmText("");
    setBulkConfirm(null);
    setBulkConfirmText("");
  }, []);

  useEscapeKey(closeModals, !!confirmDelete || !!bulkConfirm);

  const hasFilters = search.trim().length > 0 || roleFilter !== "ALL";

  return (
    <div>
      <style>{`
        @keyframes muHeadIn { from { opacity:0; transform: translateX(-10px); } to { opacity:1; transform: translateX(0); } }
        @keyframes muRowIn { from { opacity:0; transform: translateY(14px) scale(0.98); } to { opacity:1; transform: translateY(0) scale(1); } }
        @keyframes muToastIn { from { opacity:0; transform: translate(-50%, -14px) scale(0.95); } to { opacity:1; transform: translate(-50%, 0) scale(1); } }
        @keyframes muShimmer { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }
        @keyframes muSpin { to { transform: rotate(360deg); } }
        @keyframes muOrbFloat { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(8px,-8px) scale(1.06); } }
        @keyframes muBarIn { from { opacity:0; transform: translateY(-8px); } to { opacity:1; transform: translateY(0); } }
        .mu-head { animation: muHeadIn 0.45s cubic-bezier(.2,.8,.2,1) both; }
        .mu-row { animation: muRowIn 0.4s cubic-bezier(.2,.8,.2,1) both; transition: transform 0.2s ease, box-shadow 0.25s ease, border-color 0.25s ease; }
        .mu-row:hover { transform: translateY(-2px); box-shadow: 0 14px 30px rgba(15,23,42,0.08); border-color: rgba(109,74,255,0.15) !important; }
        .mu-avatar { transition: transform 0.25s cubic-bezier(.34,1.56,.64,1); }
        .mu-row:hover .mu-avatar { transform: scale(1.08) rotate(-3deg); }
        .mu-stat-card { transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; position: relative; overflow: hidden; }
        .mu-stat-card:hover { transform: translateY(-4px); box-shadow: 0 16px 32px rgba(15,23,42,0.12); }
        .mu-stat-card.active { box-shadow: 0 0 0 2px currentColor inset; }
        .mu-stat-icon { transition: transform 0.3s cubic-bezier(.34,1.56,.64,1); }
        .mu-stat-card:hover .mu-stat-icon { transform: scale(1.15) rotate(-8deg); }
        .mu-stat-orb { position: absolute; top: -30%; right: -15%; width: 100px; height: 100px; border-radius: 50%; animation: muOrbFloat 6s ease-in-out infinite; pointer-events: none; }
        .mu-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 22px; }
        .mu-search:focus { border-color: rgba(109,74,255,0.4) !important; box-shadow: 0 0 0 3px rgba(109,74,255,0.08); }
        .mu-btn { transition: transform 0.15s ease, box-shadow 0.2s ease; }
        .mu-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 14px rgba(15,23,42,0.12); }
        .mu-btn:active:not(:disabled) { transform: scale(0.96); }
        .mu-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .mu-spinner { animation: muSpin 0.6s linear infinite; }
        .mu-toast { animation: muToastIn 0.3s cubic-bezier(.2,.8,.2,1); }
        .mu-modal-btn { transition: transform 0.15s ease; }
        .mu-modal-btn:hover { transform: translateY(-1px); }
        .mu-skeleton { background: linear-gradient(90deg, #F0EEFA 25%, #E6E2F5 37%, #F0EEFA 63%); background-size: 400% 100%; animation: muShimmer 1.4s ease infinite; }
        .mu-bulkbar { animation: muBarIn 0.25s cubic-bezier(.2,.8,.2,1) both; }
        .mu-toolbar-row { display: flex; gap: 10px; align-items: center; }
        .mu-row-inner { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
        .mu-row-left { display: flex; align-items: center; gap: 14px; min-width: 0; }
        .mu-row-actions { display: flex; gap: 8px; flex-shrink: 0; }
        .mu-check { width: 16px; height: 16px; accent-color: #6D4AFF; cursor: pointer; flex-shrink: 0; }
        .mu-btn:focus-visible, .mu-modal-btn:focus-visible, .mu-search:focus-visible, .mu-check:focus-visible, .mu-sort:focus-visible {
          outline: 2px solid #6D4AFF; outline-offset: 2px;
        }
        @media (max-width: 640px) {
          .mu-stats-grid { grid-template-columns: 1fr 1fr; }
          .mu-stats-grid > div:first-child { grid-column: 1 / -1; }
          .mu-toolbar-row { flex-wrap: wrap; }
          .mu-row-inner { flex-direction: column; align-items: flex-start; }
          .mu-row-actions { width: 100%; }
          .mu-row-actions button { flex: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .mu-head, .mu-row, .mu-toast, .mu-stat-card, .mu-avatar, .mu-spinner, .mu-bulkbar, .mu-stat-orb, .mu-stat-icon {
            animation: none !important; transition: none !important;
          }
        }
      `}</style>

      {toast && (
        <div className="mu-toast" role="status" style={{ position: "fixed", top: 24, left: "50%", background: toast.tone, color: "#fff", padding: "12px 24px", borderRadius: 14, fontSize: 13.5, fontWeight: 700, zIndex: 300, boxShadow: "0 12px 30px rgba(20,19,43,0.3)" }}>
          {toast.msg}
        </div>
      )}

      <div className="mu-head" style={{ marginBottom: 22 }}>
        <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase", background: "#14132B", color: "#fff", padding: "4px 10px", borderRadius: 20, marginBottom: 10, display: "inline-block" }}>
          Admin
        </span>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 27, fontWeight: 700, color: "#14132B", letterSpacing: -0.5, marginBottom: 6 }}>
          Manage Users
        </h1>
        <p style={{ color: "rgba(20,19,43,0.5)", fontSize: 14 }}>
          View, hold, or remove student and organizer accounts.
        </p>
      </div>

      <div className="mu-head mu-stats-grid">
        {[
          { key: "ALL", label: "All Users", tone: "#14132B", bg: "linear-gradient(150deg,#F6F5FB 0%,#EDECF7 100%)", orb: "rgba(20,19,43,0.06)", icon: "👥" },
          { key: "STUDENT", label: "Students", tone: "#2563EB", bg: "linear-gradient(150deg,#DBEAFE 0%,#EFF6FF 100%)", orb: "rgba(37,99,235,0.15)", icon: "🎓" },
          { key: "ORGANIZER", label: "Organizers", tone: "#D97706", bg: "linear-gradient(150deg,#FEF3C7 0%,#FFFBEB 100%)", orb: "rgba(217,119,6,0.15)", icon: "🚩" },
        ].map((c) => (
          <div
            key={c.key}
            className={"mu-stat-card" + (roleFilter === c.key ? " active" : "")}
            onClick={() => setRoleFilter(c.key as any)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setRoleFilter(c.key as any); } }}
            style={{ background: c.bg, borderRadius: 18, padding: "20px 20px", border: "1px solid rgba(255,255,255,0.6)", color: c.tone }}
          >
            <div className="mu-stat-orb" style={{ background: `radial-gradient(circle, ${c.orb}, transparent 70%)` }} />
            <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: c.tone, opacity: 0.8 }}>{c.label}</p>
              <span className="mu-stat-icon" style={{ fontSize: 20 }}>{c.icon}</span>
            </div>
            <p style={{ position: "relative", fontFamily: "'Sora', sans-serif", fontSize: 32, fontWeight: 800, color: c.tone, fontVariantNumeric: "tabular-nums" }}>
              <AnimatedCount value={counts[c.key as keyof typeof counts]} />
            </p>
          </div>
        ))}
      </div>

      <div className="mu-head mu-toolbar-row" style={{ marginBottom: 14 }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(20,19,43,0.35)" strokeWidth="2" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
            <circle cx="11" cy="11" r="6.5" />
            <path d="m20 20-4-4" strokeLinecap="round" />
          </svg>
          <input
            className="mu-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or username..."
            aria-label="Search users"
            style={{ width: "100%", padding: "11px 16px 11px 38px", borderRadius: 12, border: "1px solid rgba(15,23,42,0.08)", background: "#fff", fontSize: 13.5, outline: "none", color: "#14132B", boxSizing: "border-box", transition: "all 0.2s ease" }}
          />
        </div>
        <select
          className="mu-sort"
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          aria-label="Sort users"
          style={{ padding: "11px 14px", borderRadius: 12, border: "1px solid rgba(15,23,42,0.08)", background: "#fff", fontSize: 13, color: "#14132B", outline: "none", cursor: "pointer", flexShrink: 0 }}
        >
          <option value="date_desc">Newest first</option>
          <option value="date_asc">Oldest first</option>
          <option value="name_asc">Name A–Z</option>
          <option value="name_desc">Name Z–A</option>
        </select>
      </div>

      {selected.size > 0 && (
        <div className="mu-bulkbar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "#14132B", borderRadius: 14, padding: "12px 18px", marginBottom: 14, flexWrap: "wrap" }}>
          <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{selected.size} selected</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="mu-btn" disabled={bulkBusy} onClick={() => bulkSetStatus(Array.from(selected), "SUSPENDED")} style={{ background: "rgba(245,158,11,0.15)", color: "#FBBF24", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 9, padding: "7px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
              Hold
            </button>
            <button className="mu-btn" disabled={bulkBusy} onClick={() => bulkSetStatus(Array.from(selected), "ACTIVE")} style={{ background: "rgba(22,163,74,0.15)", color: "#4ADE80", border: "1px solid rgba(22,163,74,0.3)", borderRadius: 9, padding: "7px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
              Unhold
            </button>
            <button className="mu-btn" disabled={bulkBusy} onClick={() => setBulkConfirm(Array.from(selected))} style={{ background: "rgba(220,38,38,0.15)", color: "#F87171", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 9, padding: "7px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
              Delete
            </button>
            <button className="mu-btn" disabled={bulkBusy} onClick={() => setSelected(new Set())} style={{ background: "transparent", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 9, padding: "7px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
              Clear
            </button>
          </div>
        </div>
      )}

      {!loading && !loadError && pageItems.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 4px 10px" }}>
          <input ref={selectAllRef} type="checkbox" className="mu-check" checked={allPageSelected} onChange={toggleSelectAll} aria-label="Select all users on this page" />
          <span style={{ fontSize: 12, color: "rgba(20,19,43,0.45)" }}>
            {sorted.length} {sorted.length === 1 ? "user" : "users"}{hasFilters ? " match your filters" : ""}
          </span>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="mu-skeleton" style={{ height: 76, borderRadius: 16 }} />
          ))}
        </div>
      ) : loadError ? (
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(220,38,38,0.15)", padding: 50, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.35 }}>⚠️</div>
          <p style={{ color: "rgba(20,19,43,0.55)", fontSize: 14, marginBottom: 16 }}>Couldn't load users.</p>
          <button className="mu-btn" onClick={load} style={{ background: "#14132B", color: "#fff", border: "none", borderRadius: 10, padding: "9px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Try again
          </button>
        </div>
      ) : pageItems.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.07)", padding: 50, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.25 }}>👤</div>
          <p style={{ color: "rgba(20,19,43,0.4)", fontSize: 14, marginBottom: hasFilters ? 16 : 0 }}>No users match this filter.</p>
          {hasFilters && (
            <button className="mu-btn" onClick={() => { setSearch(""); setRoleFilter("ALL"); }} style={{ background: "rgba(109,74,255,0.08)", color: "#6D4AFF", border: "1px solid rgba(109,74,255,0.2)", borderRadius: 10, padding: "9px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {pageItems.map((u, i) => {
            const rc = ROLE_COLORS[u.role] || ROLE_COLORS.STUDENT;
            const isSuspended = u.status === "SUSPENDED";
            return (
              <div
                key={u.id}
                className="mu-row"
                style={{
                  animationDelay: `${Math.min(i * 0.04, 0.4)}s`,
                  background: "#fff",
                  border: isSuspended ? "1px solid rgba(245,158,11,0.25)" : "1px solid rgba(15,23,42,0.07)",
                  borderRadius: 16,
                  padding: "16px 20px",
                }}
              >
                <div className="mu-row-inner">
                  <div className="mu-row-left">
                    <input
                      type="checkbox"
                      className="mu-check"
                      checked={selected.has(u.id)}
                      onChange={() => toggleSelect(u.id)}
                      aria-label={`Select ${u.name}`}
                    />
                    <Avatar user={u} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 14.5, fontWeight: 700, color: "#14132B" }}>{u.name}</span>
                        <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: rc.bg, color: rc.color }}>{u.role}</span>
                        {isSuspended && (
                          <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: "rgba(245,158,11,0.12)", color: "#B45309" }}>
                            ⏸ On Hold
                          </span>
                        )}
                        {u.role === "ORGANIZER" && u.organizerProfile && (
                          <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: u.organizerProfile.isVerified ? "rgba(22,163,74,0.1)" : "rgba(107,114,128,0.1)", color: u.organizerProfile.isVerified ? "#15803D" : "#6B7280" }}>
                            {u.organizerProfile.isVerified ? "✓ Verified" : "Unverified"}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(20,19,43,0.45)", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {u.email} · @{u.username} · joined {new Date(u.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="mu-row-actions">
                    {isSuspended ? (
                      <button
                        className="mu-btn"
                        disabled={busyId === u.id}
                        onClick={() => setStatus(u.id, "ACTIVE", u.name)}
                        style={{ background: "rgba(22,163,74,0.08)", color: "#15803D", border: "1px solid rgba(22,163,74,0.2)", borderRadius: 10, padding: "8px 16px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                      >
                        {busyId === u.id && <span className="mu-spinner" style={{ width: 11, height: 11, border: "2px solid rgba(21,128,61,0.3)", borderTop: "2px solid #15803D", borderRadius: "50%" }} />}
                        Unhold
                      </button>
                    ) : (
                      <button
                        className="mu-btn"
                        disabled={busyId === u.id}
                        onClick={() => setStatus(u.id, "SUSPENDED", u.name)}
                        style={{ background: "rgba(245,158,11,0.08)", color: "#B45309", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, padding: "8px 16px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                      >
                        {busyId === u.id && <span className="mu-spinner" style={{ width: 11, height: 11, border: "2px solid rgba(180,83,9,0.3)", borderTop: "2px solid #B45309", borderRadius: "50%" }} />}
                        Hold
                      </button>
                    )}
                    <button
                      className="mu-btn"
                      disabled={busyId === u.id}
                      onClick={() => setConfirmDelete(u)}
                      style={{ background: "rgba(220,38,38,0.08)", color: "#B91C1C", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 10, padding: "8px 16px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && !loadError && sorted.length > 0 && totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginTop: 20 }}>
          <button className="mu-btn" disabled={currentPage <= 1} onClick={() => setPage((p) => p - 1)} style={{ background: "#fff", color: "#14132B", border: "1px solid rgba(15,23,42,0.1)", borderRadius: 10, padding: "8px 16px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
            Prev
          </button>
          <span style={{ fontSize: 12.5, color: "rgba(20,19,43,0.5)", fontWeight: 600 }}>
            Page {currentPage} of {totalPages}
          </span>
          <button className="mu-btn" disabled={currentPage >= totalPages} onClick={() => setPage((p) => p + 1)} style={{ background: "#fff", color: "#14132B", border: "1px solid rgba(15,23,42,0.1)", borderRadius: 10, padding: "8px 16px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
            Next
          </button>
        </div>
      )}

      {confirmDelete && (
        <div onClick={closeModals} role="presentation" style={{ position: "fixed", inset: 0, background: "rgba(20,19,43,0.55)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Confirm delete" style={{ background: "#fff", borderRadius: 22, padding: 28, width: 400, maxWidth: "100%", boxShadow: "0 30px 60px rgba(20,19,43,0.3)", animation: "muRowIn 0.25s cubic-bezier(.2,.8,.2,1)" }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(220,38,38,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 16 }}>
              🗑️
            </div>
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, color: "#14132B", marginBottom: 10 }}>Delete this user?</h3>
            <p style={{ fontSize: 13.5, color: "rgba(20,19,43,0.6)", marginBottom: 16, lineHeight: 1.6 }}>
              This will permanently remove <strong>{confirmDelete.name}</strong> ({confirmDelete.email}) and log them out everywhere immediately. They will need to register a brand-new account to use SECM again.
            </p>
            <p style={{ fontSize: 12, color: "rgba(20,19,43,0.5)", marginBottom: 8 }}>
              Type <strong>{confirmDelete.username}</strong> to confirm.
            </p>
            <input
              autoFocus
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={confirmDelete.username}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(15,23,42,0.12)", fontSize: 13.5, outline: "none", marginBottom: 22, boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="mu-modal-btn" onClick={closeModals} style={{ background: "rgba(20,19,43,0.05)", color: "#14132B", border: "none", borderRadius: 12, padding: "10px 20px", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
                Cancel
              </button>
              <button
                className="mu-modal-btn"
                disabled={confirmText !== confirmDelete.username || busyId === confirmDelete.id}
                onClick={() => deleteUser(confirmDelete.id, confirmDelete.name)}
                style={{ background: "#B91C1C", color: "#fff", border: "none", borderRadius: 12, padding: "10px 20px", fontSize: 13.5, fontWeight: 700, cursor: confirmText !== confirmDelete.username ? "not-allowed" : "pointer", opacity: confirmText !== confirmDelete.username ? 0.5 : 1 }}
              >
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {bulkConfirm && (
        <div onClick={closeModals} role="presentation" style={{ position: "fixed", inset: 0, background: "rgba(20,19,43,0.55)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Confirm bulk delete" style={{ background: "#fff", borderRadius: 22, padding: 28, width: 400, maxWidth: "100%", boxShadow: "0 30px 60px rgba(20,19,43,0.3)", animation: "muRowIn 0.25s cubic-bezier(.2,.8,.2,1)" }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(220,38,38,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 16 }}>
              🗑️
            </div>
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, color: "#14132B", marginBottom: 10 }}>
              Delete {bulkConfirm.length} user{bulkConfirm.length > 1 ? "s" : ""}?
            </h3>
            <p style={{ fontSize: 13.5, color: "rgba(20,19,43,0.6)", marginBottom: 16, lineHeight: 1.6 }}>
              This permanently removes all selected accounts and logs them out everywhere immediately. This can't be undone.
            </p>
            <p style={{ fontSize: 12, color: "rgba(20,19,43,0.5)", marginBottom: 8 }}>
              Type <strong>DELETE</strong> to confirm.
            </p>
            <input
              autoFocus
              value={bulkConfirmText}
              onChange={(e) => setBulkConfirmText(e.target.value)}
              placeholder="DELETE"
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(15,23,42,0.12)", fontSize: 13.5, outline: "none", marginBottom: 22, boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="mu-modal-btn" onClick={closeModals} style={{ background: "rgba(20,19,43,0.05)", color: "#14132B", border: "none", borderRadius: 12, padding: "10px 20px", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
                Cancel
              </button>
              <button
                className="mu-modal-btn"
                disabled={bulkConfirmText !== "DELETE" || bulkBusy}
                onClick={() => bulkDelete(bulkConfirm)}
                style={{ background: "#B91C1C", color: "#fff", border: "none", borderRadius: 12, padding: "10px 20px", fontSize: 13.5, fontWeight: 700, cursor: bulkConfirmText !== "DELETE" ? "not-allowed" : "pointer", opacity: bulkConfirmText !== "DELETE" ? 0.5 : 1 }}
              >
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}