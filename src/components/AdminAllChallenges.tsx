"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: "Draft", color: "#6B7280", bg: "rgba(107,114,128,0.1)" },
  PUBLISHED: { label: "Live", color: "#15803D", bg: "rgba(22,163,74,0.1)" },
  CLOSED: { label: "Closed", color: "#B91C1C", bg: "rgba(220,38,38,0.1)" },
  COMPLETED: { label: "Ended", color: "#6B7280", bg: "rgba(107,114,128,0.1)" },
};

const AVATAR_COLORS = ["#6D4AFF", "#D97706", "#059669", "#DC2626", "#2563EB", "#DB2777", "#7C3AED", "#0891B2"];

type SortKey = "deadline-soon" | "deadline-late" | "most-submissions" | "most-participants" | "title-az";
type ViewMode = "cards" | "table";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

function colorFor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function orgName(c: any) {
  return c.organizer?.orgName || "Unknown";
}

function isPastDeadline(c: any) {
  return new Date(c.deadline).getTime() < Date.now();
}

function getEffectiveStatus(c: any): string {
  if (c.status === "PUBLISHED" && isPastDeadline(c)) return "CLOSED";
  return c.status;
}

function AnimatedCount({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const from = prev.current;
    prev.current = value;
    if (from === value) { setDisplay(value); return; }
    const start = performance.now();
    function tick(now: number) {
      const p = Math.min((now - start) / 700, 1);
      setDisplay(Math.round(from + (value - from) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [value]);
  return <>{display}</>;
}

function toCSV(rows: any[]) {
  const header = ["Title", "Organizer", "Verified", "Status", "Submissions", "Participants", "Deadline"];
  const escape = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((c) =>
    [
      c.title || "",
      orgName(c),
      c.organizer?.isVerified ? "Yes" : "No",
      (STATUS_STYLES[c.status] || STATUS_STYLES.DRAFT).label,
      c._count?.submissions || 0,
      c._count?.participations || 0,
      new Date(c.deadline).toISOString(),
    ].map(escape).join(",")
  );
  return [header.map(escape).join(","), ...lines].join("\n");
}

function downloadCSV(rows: any[]) {
  const csv = toCSV(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `challenges-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const PAGE_SIZE = 20;

export default function AdminAllChallenges() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sort, setSort] = useState<SortKey>("deadline-soon");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [view, setView] = useState<ViewMode>("cards");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [selected, setSelected] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);

  function loadChallenges(isRetry?: boolean) {
    if (isRetry) setRefreshing(true);
    setLoadError(false);
    fetch("/api/admin/challenges")
      .then((r) => r.json())
      .then((d) => {
        setChallenges(d.challenges || []);
        setLastUpdated(new Date());
        setLoading(false);
        setRefreshing(false);
      })
      .catch(() => {
        setLoadError(true);
        setLoading(false);
        setRefreshing(false);
      });
  }

  useEffect(() => {
    loadChallenges();
  }, []);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, statusFilter, sort, dateFrom, dateTo, verifiedOnly]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 4);
      setShowTop(window.scrollY > 600);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement !== searchRef.current) {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === "Escape") {
        if (selected) setSelected(null);
        else if (search) setSearch("");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, search]);

  const filtered = useMemo(() => {
   let list = challenges.filter((c) => {
      const effStatus = getEffectiveStatus(c);
      if (statusFilter !== "ALL") {
        if (statusFilter === "CLOSED") {
          if (effStatus !== "CLOSED" && effStatus !== "COMPLETED") return false;
        } else if (effStatus !== statusFilter) return false;
      }
      if (verifiedOnly && !c.organizer?.isVerified) return false;
      if (dateFrom && new Date(c.deadline) < new Date(dateFrom)) return false;
      if (dateTo && new Date(c.deadline) > new Date(dateTo + "T23:59:59")) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return c.title?.toLowerCase().includes(q) || orgName(c).toLowerCase().includes(q);
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "deadline-late":
          return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
        case "most-submissions":
          return (b._count?.submissions || 0) - (a._count?.submissions || 0);
        case "most-participants":
          return (b._count?.participations || 0) - (a._count?.participations || 0);
        case "title-az":
          return (a.title || "").localeCompare(b.title || "");
        case "deadline-soon":
        default:
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
    });

    return list;
  }, [challenges, search, statusFilter, sort, dateFrom, dateTo, verifiedOnly]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const counts = {
    ALL: challenges.length,
    PUBLISHED: challenges.filter((c) => getEffectiveStatus(c) === "PUBLISHED").length,
    DRAFT: challenges.filter((c) => c.status === "DRAFT").length,
    CLOSED: challenges.filter((c) => { const s = getEffectiveStatus(c); return s === "CLOSED" || s === "COMPLETED"; }).length,
  };

  const filtersActive = !!(search || statusFilter !== "ALL" || dateFrom || dateTo || verifiedOnly || sort !== "deadline-soon");

  function clearFilters() {
    setSearch("");
    setStatusFilter("ALL");
    setDateFrom("");
    setDateTo("");
    setVerifiedOnly(false);
    setSort("deadline-soon");
  }

  function copyId(c: any) {
    navigator.clipboard?.writeText(c.id).then(() => {
      setCopiedId(c.id);
      setToast("Copied challenge ID");
      setTimeout(() => setCopiedId((cur) => (cur === c.id ? null : cur)), 1400);
    });
  }

  return (
    <div style={{ position: "relative" }}>
      <style>{`
        @keyframes acHeadIn { from { opacity:0; transform: translateX(-10px); } to { opacity:1; transform: translateX(0); } }
        @keyframes acRise { from { opacity:0; transform: translateY(14px) scale(0.98); } to { opacity:1; transform: translateY(0) scale(1); } }
        @keyframes acShimmer { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }
        @keyframes acOrb { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(8px,-8px) scale(1.06); } }
        @keyframes acBackdropIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes acModalIn { from { opacity: 0; transform: translateY(24px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes acToastIn { from { opacity: 0; transform: translateY(10px) translateX(-50%); } to { opacity: 1; transform: translateY(0) translateX(-50%); } }
        @keyframes acPop { 0% { transform: scale(1); } 40% { transform: scale(1.15); } 100% { transform: scale(1); } }
        @keyframes acSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes acPulse { 0%,100% { opacity: 0.3; } 50% { opacity: 0.7; } }
        @keyframes acDot { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }

        .ac-head { animation: acHeadIn 0.45s cubic-bezier(.2,.8,.2,1) both; }
        .ac-row { animation: acRise 0.4s cubic-bezier(.2,.8,.2,1) both; transition: transform 0.2s ease, box-shadow 0.25s ease, border-color 0.25s ease; cursor: pointer; }
        .ac-row:hover { transform: translateY(-2px); box-shadow: 0 14px 30px rgba(15,23,42,0.08); border-color: rgba(109,74,255,0.15) !important; }
        .ac-row:hover .ac-chevron { opacity: 1; transform: translateX(0); }
        .ac-chevron { opacity: 0; transform: translateX(-4px); transition: all 0.2s ease; color: rgba(20,19,43,0.3); font-size: 14px; }
        .ac-tab { transition: all 0.2s ease; }
        .ac-skeleton { background: linear-gradient(90deg, #F0EEFA 25%, #E6E2F5 37%, #F0EEFA 63%); background-size: 400% 100%; animation: acShimmer 1.4s ease infinite; }
        .ac-stat { position: relative; overflow: hidden; transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; }
        .ac-stat:hover { transform: translateY(-4px); box-shadow: 0 16px 32px rgba(15,23,42,0.1); }
        .ac-stat.active { box-shadow: 0 0 0 2px currentColor inset; }
        .ac-orb { position: absolute; top: -30%; right: -15%; width: 100px; height: 100px; border-radius: 50%; animation: acOrb 6s ease-in-out infinite; pointer-events: none; }
        .ac-search:focus { border-color: rgba(109,74,255,0.4) !important; box-shadow: 0 0 0 3px rgba(109,74,255,0.08); }
        .ac-input:focus, .ac-select:focus { border-color: rgba(109,74,255,0.4) !important; box-shadow: 0 0 0 3px rgba(109,74,255,0.08); }
        .ac-export { transition: all 0.15s ease; cursor: pointer; }
        .ac-export:hover:not(:disabled) { background: #14132B !important; color: #fff !important; transform: translateY(-1px); }
        .ac-export:active:not(:disabled) { transform: translateY(0) scale(0.97); }
        .ac-export:disabled { opacity: 0.4; cursor: not-allowed; }
        .ac-clear { cursor: pointer; transition: opacity 0.15s ease; }
        .ac-clear:hover { opacity: 0.6; }
        .ac-loadmore { cursor: pointer; transition: all 0.15s ease; }
        .ac-loadmore:hover { background: #14132B !important; color: #fff !important; transform: translateY(-1px); }
        .ac-loadmore:active { transform: translateY(0) scale(0.97); }
        .ac-toolbar-sticky { position: sticky; top: 0; z-index: 10; transition: box-shadow 0.25s ease, background 0.25s ease; padding: 10px 0; }
        .ac-toolbar-sticky.scrolled { background: rgba(250,250,252,0.85); backdrop-filter: blur(10px); box-shadow: 0 8px 20px rgba(15,23,42,0.05); }
        .ac-viewtoggle button { transition: all 0.18s ease; cursor: pointer; }
        .ac-copybtn { cursor: pointer; transition: all 0.15s ease; }
        .ac-copybtn:hover { background: rgba(20,19,43,0.06) !important; }
        .ac-copybtn.copied { animation: acPop 0.35s ease; }
        .ac-th { cursor: pointer; user-select: none; transition: color 0.15s ease; }
        .ac-th:hover { color: #14132B !important; }
        .ac-tr { animation: acRise 0.35s cubic-bezier(.2,.8,.2,1) both; transition: background 0.15s ease; cursor: pointer; }
        .ac-tr:hover { background: rgba(109,74,255,0.03); }
        .ac-backdrop { position: fixed; inset: 0; background: rgba(15,15,25,0.45); backdrop-filter: blur(4px); z-index: 50; animation: acBackdropIn 0.2s ease both; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .ac-modal { animation: acModalIn 0.3s cubic-bezier(.2,.8,.2,1) both; background: #fff; border-radius: 22px; max-width: 460px; width: 100%; padding: 28px; box-shadow: 0 30px 60px rgba(15,23,42,0.25); }
        .ac-modal-close { cursor: pointer; transition: all 0.15s ease; }
        .ac-modal-close:hover { background: rgba(20,19,43,0.08) !important; transform: rotate(90deg); }
        .ac-toast { position: fixed; bottom: 28px; left: 50%; background: #14132B; color: #fff; padding: 12px 20px; border-radius: 12px; font-size: 13px; font-weight: 600; z-index: 60; animation: acToastIn 0.25s cubic-bezier(.2,.8,.2,1) both; box-shadow: 0 12px 24px rgba(15,23,42,0.25); display: flex; align-items: center; gap: 8px; }
        .ac-scrolltop { position: fixed; bottom: 28px; right: 28px; width: 44px; height: 44px; border-radius: 50%; background: #14132B; color: #fff; border: none; cursor: pointer; z-index: 40; box-shadow: 0 12px 24px rgba(15,23,42,0.2); transition: all 0.2s ease; animation: acRise 0.3s ease both; }
        .ac-scrolltop:hover { transform: translateY(-3px); }
        .ac-spinner { animation: acSpin 0.8s linear infinite; }
        .ac-loading-icon { animation: acPulse 1.6s ease-in-out infinite; }
        .ac-live-dot { animation: acDot 1.6s ease-in-out infinite; }
        .ac-kbd { font-family: monospace; background: rgba(20,19,43,0.06); border: 1px solid rgba(20,19,43,0.1); padding: 1px 6px; border-radius: 5px; font-size: 11px; }
        .ac-checkbox { cursor: pointer; }

        @media (max-width: 640px) {
          .ac-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .ac-toolbar { flex-direction: column !important; align-items: stretch !important; }
          .ac-row { flex-direction: column !important; align-items: flex-start !important; gap: 10px; }
          .ac-hide-mobile { display: none !important; }
          .ac-scrolltop { bottom: 20px; right: 20px; }
        }
        @media print {
          .ac-toolbar-sticky, .ac-export, .ac-viewtoggle, .ac-scrolltop, .ac-loadmore, .ac-chevron { display: none !important; }
          .ac-row, .ac-tr { animation: none !important; }
        }
      `}</style>

      {/* Header */}
      <div className="ac-head" style={{ marginBottom: 22, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div>
          <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase", background: "#14132B", color: "#fff", padding: "4px 10px", borderRadius: 20, marginBottom: 10, display: "inline-block" }}>Admin</span>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 27, fontWeight: 700, color: "#14132B", letterSpacing: -0.5, marginBottom: 6 }}>All Challenges</h1>
          <p style={{ color: "rgba(20,19,43,0.5)", fontSize: 14 }}>
            Platform-wide oversight of every challenge across all organizers.{" "}
            <span className="ac-hide-mobile" style={{ opacity: 0.7 }}>
              Press <span className="ac-kbd">/</span> to search.
            </span>
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div className="ac-viewtoggle" style={{ display: "flex", background: "#fff", border: "1px solid rgba(15,23,42,0.1)", borderRadius: 12, padding: 3 }}>
            <button
              onClick={() => setView("cards")}
              style={{ border: "none", padding: "7px 12px", borderRadius: 9, fontSize: 12.5, fontWeight: 700, background: view === "cards" ? "#14132B" : "transparent", color: view === "cards" ? "#fff" : "#14132B" }}
            >
              ▦ Cards
            </button>
            <button
              onClick={() => setView("table")}
              style={{ border: "none", padding: "7px 12px", borderRadius: 9, fontSize: 12.5, fontWeight: 700, background: view === "table" ? "#14132B" : "transparent", color: view === "table" ? "#fff" : "#14132B" }}
            >
              ☰ Table
            </button>
          </div>
          <button
            className="ac-export"
            disabled={filtered.length === 0}
            onClick={() => {
              downloadCSV(filtered);
              setToast(`Exported ${filtered.length} challenge${filtered.length !== 1 ? "s" : ""} to CSV`);
            }}
            style={{ border: "1px solid rgba(15,23,42,0.1)", background: "#fff", color: "#14132B", fontSize: 13, fontWeight: 700, padding: "10px 16px", borderRadius: 12, display: "flex", alignItems: "center", gap: 8 }}
          >
            ⬇ Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="ac-head ac-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 22 }}>
        {[
          { key: "ALL", label: "All", tone: "#14132B", bg: "linear-gradient(150deg,#F6F5FB,#EDECF7)", orb: "rgba(20,19,43,0.08)", icon: "📋" },
          { key: "PUBLISHED", label: "Live", tone: "#15803D", bg: "linear-gradient(150deg,#D1FAE5,#F0FDF4)", orb: "rgba(22,163,74,0.15)", icon: "🟢" },
          { key: "DRAFT", label: "Draft", tone: "#6B7280", bg: "linear-gradient(150deg,#F3F4F6,#F9FAFB)", orb: "rgba(107,114,128,0.15)", icon: "📝" },
          { key: "CLOSED", label: "Closed/Ended", tone: "#B91C1C", bg: "linear-gradient(150deg,#FEE2E2,#FEF2F2)", orb: "rgba(220,38,38,0.15)", icon: "🔒" },
        ].map((c) => (
          <div
            key={c.key}
            className={"ac-stat" + (statusFilter === c.key ? " active" : "")}
            onClick={() => setStatusFilter(statusFilter === c.key ? "ALL" : c.key)}
            style={{ background: c.bg, borderRadius: 18, padding: "18px 18px", border: "1px solid rgba(255,255,255,0.6)", color: c.tone }}
          >
            <div className="ac-orb" style={{ background: `radial-gradient(circle, ${c.orb}, transparent 70%)` }} />
            <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <p style={{ fontSize: 11.5, fontWeight: 700, color: c.tone, opacity: 0.8 }}>{c.label}</p>
              <span style={{ fontSize: 18 }}>{c.icon}</span>
            </div>
            <p style={{ position: "relative", fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 800, color: c.tone }}>
              <AnimatedCount value={counts[c.key as keyof typeof counts]} />
            </p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className={"ac-toolbar-sticky" + (scrolled ? " scrolled" : "")}>
        <div className="ac-toolbar" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 220px" }}>
            <input
              ref={searchRef}
              className="ac-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or organizer..."
              style={{ width: "100%", padding: "11px 16px", paddingRight: search ? 36 : 16, borderRadius: 12, border: "1px solid rgba(15,23,42,0.08)", background: "#fff", fontSize: 13.5, outline: "none", color: "#14132B", boxSizing: "border-box", transition: "all 0.2s ease" }}
            />
            {search && (
              <span
                className="ac-clear"
                onClick={() => setSearch("")}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(20,19,43,0.4)", fontSize: 15, fontWeight: 700 }}
              >
                ✕
              </span>
            )}
          </div>

          <input
            type="date"
            className="ac-input"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            title="Deadline from"
            style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(15,23,42,0.08)", background: "#fff", fontSize: 12.5, color: "#14132B", outline: "none" }}
          />
          <span style={{ color: "rgba(20,19,43,0.3)", fontSize: 12 }}>to</span>
          <input
            type="date"
            className="ac-input"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            title="Deadline to"
            style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(15,23,42,0.08)", background: "#fff", fontSize: 12.5, color: "#14132B", outline: "none" }}
          />

          <select
            className="ac-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            style={{ padding: "11px 14px", borderRadius: 12, border: "1px solid rgba(15,23,42,0.08)", background: "#fff", fontSize: 13.5, color: "#14132B", outline: "none", fontWeight: 600 }}
          >
            <option value="deadline-soon">Deadline: soonest</option>
            <option value="deadline-late">Deadline: latest</option>
            <option value="most-submissions">Most submissions</option>
            <option value="most-participants">Most participants</option>
            <option value="title-az">Title: A–Z</option>
          </select>

          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "#14132B", padding: "0 4px" }}>
            <input type="checkbox" className="ac-checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />
            Verified only
          </label>

          {filtersActive && (
            <button
              className="ac-clear"
              onClick={clearFilters}
              style={{ border: "none", background: "none", color: "#6D4AFF", fontSize: 12.5, fontWeight: 700, padding: "8px 6px" }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {!loading && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "14px 0", flexWrap: "wrap", gap: 8 }}>
          <p style={{ fontSize: 12.5, color: "rgba(20,19,43,0.45)" }}>
            Showing {visible.length} of {filtered.length} challenge{filtered.length !== 1 ? "s" : ""}
            {statusFilter !== "ALL" && ` · ${statusFilter === "CLOSED" ? "Closed/Ended" : STATUS_STYLES[statusFilter]?.label}`}
          </p>
          <button
            onClick={() => loadChallenges(true)}
            style={{ border: "none", background: "none", color: "rgba(20,19,43,0.4)", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
          >
            <span className={refreshing ? "ac-spinner" : ""} style={{ display: "inline-block" }}>⟳</span>
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Refresh"}
          </button>
        </div>
      )}

      {/* Body */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, color: "rgba(20,19,43,0.4)", fontSize: 12.5 }}>
            <span className="ac-loading-icon">📋</span> Loading challenges…
          </div>
          {[1, 2, 3, 4].map((i) => <div key={i} className="ac-skeleton" style={{ height: 76, borderRadius: 16, animationDelay: `${i * 0.05}s` }} />)}
        </div>
      ) : loadError ? (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 18, padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>⚠️</div>
          <p style={{ color: "#991B1B", fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Couldn't load challenges.</p>
          <button
            onClick={() => loadChallenges(true)}
            style={{ border: "1px solid #FECACA", background: "#fff", color: "#991B1B", fontSize: 12.5, fontWeight: 700, padding: "8px 18px", borderRadius: 10, cursor: "pointer" }}
          >
            {refreshing ? "Retrying…" : "Try again"}
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="ac-row" style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.07)", padding: 50, textAlign: "center", cursor: "default" }}>
          <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.25 }}>📋</div>
          <p style={{ color: "rgba(20,19,43,0.4)", fontSize: 14, marginBottom: filtersActive ? 12 : 0 }}>No challenges match these filters.</p>
          {filtersActive && (
            <button onClick={clearFilters} style={{ border: "1px solid rgba(15,23,42,0.1)", background: "#fff", color: "#14132B", fontSize: 12.5, fontWeight: 700, padding: "8px 16px", borderRadius: 10, cursor: "pointer" }}>
              Clear filters
            </button>
          )}
        </div>
      ) : view === "cards" ? (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {visible.map((c, i) => {
             const s = STATUS_STYLES[getEffectiveStatus(c)] || STATUS_STYLES.DRAFT;
              const overdue = false;
              return (
                <div
                  key={c.id}
                  className="ac-row"
                  onClick={() => setSelected(c)}
                  style={{ animationDelay: `${Math.min(i * 0.04, 0.4)}s`, background: "#fff", border: "1px solid rgba(15,23,42,0.07)", borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: colorFor(orgName(c)), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, fontWeight: 800, flexShrink: 0 }}>
                      {initials(orgName(c))}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 14.5, fontWeight: 700, color: "#14132B" }}>{c.title}</span>
                        {c.organizer?.isVerified && <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: "rgba(37,99,235,0.08)", color: "#2563EB" }}>Verified Org</span>}
                        {overdue && <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: "rgba(217,119,6,0.1)", color: "#D97706" }}>Past deadline</span>}
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(20,19,43,0.45)", marginTop: 3 }}>
                        by {orgName(c)} · {c._count?.submissions || 0} submission{(c._count?.submissions || 0) !== 1 ? "s" : ""} · {c._count?.participations || 0} participant{(c._count?.participations || 0) !== 1 ? "s" : ""} · deadline {new Date(c.deadline).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {c.status === "PUBLISHED" && <span className="ac-live-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "#15803D" }} />}
                    <span style={{ fontSize: 11.5, fontWeight: 700, padding: "5px 12px", borderRadius: 20, color: s.color, background: s.bg, whiteSpace: "nowrap" }}>{s.label}</span>
                    <span className="ac-chevron">→</span>
                  </div>
                </div>
              );
            })}
          </div>

          {hasMore && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
              <button
                className="ac-loadmore"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                style={{ border: "1px solid rgba(15,23,42,0.1)", background: "#fff", color: "#14132B", fontSize: 13, fontWeight: 700, padding: "10px 22px", borderRadius: 12 }}
              >
                Load more ({filtered.length - visible.length} remaining)
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <div style={{ overflowX: "auto", background: "#fff", border: "1px solid rgba(15,23,42,0.07)", borderRadius: 16 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(15,23,42,0.07)" }}>
                  <th className="ac-th" onClick={() => setSort("title-az")} style={{ textAlign: "left", padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: sort === "title-az" ? "#14132B" : "rgba(20,19,43,0.5)", textTransform: "uppercase", letterSpacing: 0.4 }}>
                    Title {sort === "title-az" && "▲"}
                  </th>
                  <th className="ac-hide-mobile" style={{ textAlign: "left", padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: "rgba(20,19,43,0.5)", textTransform: "uppercase", letterSpacing: 0.4 }}>Organizer</th>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: "rgba(20,19,43,0.5)", textTransform: "uppercase", letterSpacing: 0.4 }}>Status</th>
                  <th className="ac-th" onClick={() => setSort("most-submissions")} style={{ textAlign: "left", padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: sort === "most-submissions" ? "#14132B" : "rgba(20,19,43,0.5)", textTransform: "uppercase", letterSpacing: 0.4 }}>
                    Subs {sort === "most-submissions" && "▼"}
                  </th>
                  <th className="ac-th ac-hide-mobile" onClick={() => setSort("most-participants")} style={{ textAlign: "left", padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: sort === "most-participants" ? "#14132B" : "rgba(20,19,43,0.5)", textTransform: "uppercase", letterSpacing: 0.4 }}>
                    Participants {sort === "most-participants" && "▼"}
                  </th>
                  <th className="ac-th" onClick={() => setSort(sort === "deadline-soon" ? "deadline-late" : "deadline-soon")} style={{ textAlign: "left", padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: sort === "deadline-soon" || sort === "deadline-late" ? "#14132B" : "rgba(20,19,43,0.5)", textTransform: "uppercase", letterSpacing: 0.4 }}>
                    Deadline {sort === "deadline-soon" ? "▲" : sort === "deadline-late" ? "▼" : ""}
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((c, i) => {
                  const s = STATUS_STYLES[getEffectiveStatus(c)] || STATUS_STYLES.DRAFT;
                  return (
                    <tr key={c.id} className="ac-tr" onClick={() => setSelected(c)} style={{ borderBottom: "1px solid rgba(15,23,42,0.05)", animationDelay: `${Math.min(i * 0.03, 0.3)}s` }}>
                      <td style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 26, height: 26, borderRadius: "50%", background: colorFor(orgName(c)), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10.5, fontWeight: 800, flexShrink: 0 }}>
                          {initials(orgName(c))}
                        </div>
                        <span style={{ fontWeight: 700, color: "#14132B" }}>{c.title}</span>
                        {c.organizer?.isVerified && <span style={{ fontSize: 10, color: "#2563EB" }}>✓</span>}
                      </td>
                      <td className="ac-hide-mobile" style={{ padding: "12px 16px", color: "rgba(20,19,43,0.55)" }}>{orgName(c)}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 20, color: s.color, background: s.bg }}>{s.label}</span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "rgba(20,19,43,0.7)" }}>{c._count?.submissions || 0}</td>
                      <td className="ac-hide-mobile" style={{ padding: "12px 16px", color: "rgba(20,19,43,0.7)" }}>{c._count?.participations || 0}</td>
                      <td style={{ padding: "12px 16px", color: "rgba(20,19,43,0.55)", whiteSpace: "nowrap" }}>{new Date(c.deadline).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {hasMore && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
              <button
                className="ac-loadmore"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                style={{ border: "1px solid rgba(15,23,42,0.1)", background: "#fff", color: "#14132B", fontSize: 13, fontWeight: 700, padding: "10px 22px", borderRadius: 12 }}
              >
                Load more ({filtered.length - visible.length} remaining)
              </button>
            </div>
          )}
        </>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="ac-backdrop" onClick={() => setSelected(null)}>
          <div className="ac-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: colorFor(orgName(selected)), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800 }}>
                  {initials(orgName(selected))}
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "#14132B" }}>{selected.title}</div>
                  <div style={{ fontSize: 12.5, color: "rgba(20,19,43,0.45)" }}>
                    by {orgName(selected)} {selected.organizer?.isVerified && "· Verified"}
                  </div>
                </div>
              </div>
              <button className="ac-modal-close" onClick={() => setSelected(null)} style={{ border: "none", background: "rgba(20,19,43,0.05)", width: 32, height: 32, borderRadius: "50%", fontSize: 14, color: "#14132B" }}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {[
                { label: "Status", value: (STATUS_STYLES[getEffectiveStatus(selected)] || STATUS_STYLES.DRAFT).label },
                { label: "Submissions", value: String(selected._count?.submissions || 0) },
                { label: "Participants", value: String(selected._count?.participations || 0) },
                { label: "Deadline", value: new Date(selected.deadline).toLocaleString() },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, borderBottom: "1px solid rgba(15,23,42,0.05)", paddingBottom: 10 }}>
                  <span style={{ color: "rgba(20,19,43,0.5)", fontWeight: 600 }}>{row.label}</span>
                  <span style={{ color: "#14132B", fontWeight: 700, textAlign: "right" }}>{row.value}</span>
                </div>
              ))}
            </div>

            <button
              className={"ac-copybtn" + (copiedId === selected.id ? " copied" : "")}
              onClick={() => copyId(selected)}
              style={{ width: "100%", border: "1px solid rgba(15,23,42,0.1)", background: "#fff", color: "#14132B", fontSize: 13, fontWeight: 700, padding: "11px", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              {copiedId === selected.id ? "✓ Copied challenge ID" : "⧉ Copy challenge ID"}
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="ac-toast">
          ✓ {toast}
        </div>
      )}

      {/* Scroll to top */}
      {showTop && (
        <button className="ac-scrolltop" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Scroll to top">
          ↑
        </button>
      )}
    </div>
  );
}