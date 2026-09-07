"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const MEDAL: Record<number, { label: string; emoji: string; color: string }> = {
  1: { label: "1st", emoji: "🥇", color: "#D4A017" },
  2: { label: "2nd", emoji: "🥈", color: "#9CA3AF" },
  3: { label: "3rd", emoji: "🥉", color: "#B45309" },
};

const AVATAR_COLORS = ["#6D4AFF", "#D97706", "#059669", "#DC2626", "#2563EB", "#DB2777", "#7C3AED", "#0891B2"];

type SortKey = "newest" | "oldest" | "position";
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

function winnerName(w: any) {
  return w.submission?.user?.name || w.submission?.team?.name || "Unknown";
}

function winnerImage(w: any) {
  return w.submission?.user?.image || null;
}

function winnerUsername(w: any) {
  return w.submission?.user?.username || w.submission?.team?.username || w.submission?.user?.email || winnerName(w);
}

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function getMedal(position: number) {
  return MEDAL[position] || { label: ordinal(position), emoji: "🎖️", color: "#6B7280" };
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
  const header = ["Winner", "Username", "Position", "Challenge", "Organizer", "Prize", "Announced At"];
  const escape = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((w) =>
    [
      winnerName(w),
      winnerUsername(w),
      getMedal(w.position).label,
      w.challenge?.title || "",
      w.challenge?.organizer?.orgName || "",
      w.challenge?.prize || "",
      new Date(w.announcedAt).toISOString(),
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
  a.download = `winners-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const PAGE_SIZE = 20;

export default function AdminAllWinners() {
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState<number | "ALL">("ALL");
  const [sort, setSort] = useState<SortKey>("newest");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [view, setView] = useState<ViewMode>("cards");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [selected, setSelected] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);

  function loadWinners(isRetry?: boolean) {
    if (isRetry) setRefreshing(true);
    setLoadError(false);
    fetch("/api/admin/winners")
      .then((r) => r.json())
      .then((d) => {
        setWinners(d.winners || []);
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
    loadWinners();
  }, []);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, positionFilter, sort, dateFrom, dateTo]);

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
    let list = winners.filter((w) => {
      if (positionFilter !== "ALL" && w.position !== positionFilter) return false;
      if (dateFrom && new Date(w.announcedAt) < new Date(dateFrom)) return false;
      if (dateTo && new Date(w.announcedAt) > new Date(dateTo + "T23:59:59")) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        w.challenge?.title?.toLowerCase().includes(q) ||
        winnerName(w).toLowerCase().includes(q) ||
        w.challenge?.organizer?.orgName?.toLowerCase().includes(q)
      );
    });

    list = [...list].sort((a, b) => {
      if (sort === "position") return a.position - b.position;
      const da = new Date(a.announcedAt).getTime();
      const db = new Date(b.announcedAt).getTime();
      return sort === "newest" ? db - da : da - db;
    });

    return list;
  }, [winners, search, positionFilter, sort, dateFrom, dateTo]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const counts = {
    ALL: winners.length,
    1: winners.filter((w) => w.position === 1).length,
    2: winners.filter((w) => w.position === 2).length,
    3: winners.filter((w) => w.position === 3).length,
  };

  const filtersActive = !!(search || positionFilter !== "ALL" || dateFrom || dateTo || sort !== "newest");

  function clearFilters() {
    setSearch("");
    setPositionFilter("ALL");
    setDateFrom("");
    setDateTo("");
    setSort("newest");
  }

  function copyUsername(w: any) {
    navigator.clipboard?.writeText(winnerUsername(w)).then(() => {
      setCopiedId(w.id);
      setToast(`Copied @${winnerUsername(w)}`);
      setTimeout(() => setCopiedId((c) => (c === w.id ? null : c)), 1400);
    });
  }

  function toggleDateSort() {
    setSort((s) => (s === "newest" ? "oldest" : "newest"));
  }

  return (
    <div style={{ position: "relative" }}>
      <style>{`
        @keyframes awHeadIn { from { opacity:0; transform: translateX(-10px); } to { opacity:1; transform: translateX(0); } }
        @keyframes awRise { from { opacity:0; transform: translateY(14px) scale(0.98); } to { opacity:1; transform: translateY(0) scale(1); } }
        @keyframes awShimmer { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }
        @keyframes awOrb { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(8px,-8px) scale(1.06); } }
        @keyframes awMedalFloat { 0%,100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-3px) rotate(-4deg); } }
        @keyframes awBackdropIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes awModalIn { from { opacity: 0; transform: translateY(24px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes awToastIn { from { opacity: 0; transform: translateY(10px) translateX(-50%); } to { opacity: 1; transform: translateY(0) translateX(-50%); } }
        @keyframes awPop { 0% { transform: scale(1); } 40% { transform: scale(1.15); } 100% { transform: scale(1); } }
        @keyframes awSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes awPulse { 0%,100% { opacity: 0.3; } 50% { opacity: 0.7; } }

        .aw-head { animation: awHeadIn 0.45s cubic-bezier(.2,.8,.2,1) both; }
        .aw-row { animation: awRise 0.4s cubic-bezier(.2,.8,.2,1) both; transition: transform 0.2s ease, box-shadow 0.25s ease; cursor: pointer; }
        .aw-row:hover { transform: translateY(-2px); box-shadow: 0 14px 30px rgba(15,23,42,0.08); }
        .aw-row:hover .aw-medal { animation: awMedalFloat 0.8s ease infinite; }
        .aw-row:hover .aw-chevron { opacity: 1; transform: translateX(0); }
        .aw-chevron { opacity: 0; transform: translateX(-4px); transition: all 0.2s ease; color: rgba(20,19,43,0.3); font-size: 14px; }
        .aw-skeleton { background: linear-gradient(90deg, #F0EEFA 25%, #E6E2F5 37%, #F0EEFA 63%); background-size: 400% 100%; animation: awShimmer 1.4s ease infinite; }
        .aw-stat { position: relative; overflow: hidden; transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; }
        .aw-stat:hover { transform: translateY(-4px); box-shadow: 0 16px 32px rgba(15,23,42,0.1); }
        .aw-stat.active { box-shadow: 0 0 0 2px currentColor inset; }
        .aw-orb { position: absolute; top: -30%; right: -15%; width: 90px; height: 90px; border-radius: 50%; animation: awOrb 6s ease-in-out infinite; pointer-events: none; }
        .aw-search:focus { border-color: rgba(109,74,255,0.4) !important; box-shadow: 0 0 0 3px rgba(109,74,255,0.08); }
        .aw-input:focus, .aw-select:focus { border-color: rgba(109,74,255,0.4) !important; box-shadow: 0 0 0 3px rgba(109,74,255,0.08); }
        .aw-export { transition: all 0.15s ease; cursor: pointer; }
        .aw-export:hover:not(:disabled) { background: #14132B !important; color: #fff !important; transform: translateY(-1px); }
        .aw-export:active:not(:disabled) { transform: translateY(0) scale(0.97); }
        .aw-export:disabled { opacity: 0.4; cursor: not-allowed; }
        .aw-clear { cursor: pointer; transition: opacity 0.15s ease; }
        .aw-clear:hover { opacity: 0.6; }
        .aw-loadmore { cursor: pointer; transition: all 0.15s ease; }
        .aw-loadmore:hover { background: #14132B !important; color: #fff !important; transform: translateY(-1px); }
        .aw-loadmore:active { transform: translateY(0) scale(0.97); }
        .aw-toolbar-sticky { position: sticky; top: 0; z-index: 10; transition: box-shadow 0.25s ease, background 0.25s ease; padding: 10px 0; }
        .aw-toolbar-sticky.scrolled { background: rgba(250,250,252,0.85); backdrop-filter: blur(10px); box-shadow: 0 8px 20px rgba(15,23,42,0.05); }
        .aw-viewtoggle button { transition: all 0.18s ease; cursor: pointer; }
        .aw-copybtn { cursor: pointer; transition: all 0.15s ease; }
        .aw-copybtn:hover { background: rgba(20,19,43,0.06) !important; }
        .aw-copybtn.copied { animation: awPop 0.35s ease; }
        .aw-th { cursor: pointer; user-select: none; transition: color 0.15s ease; }
        .aw-th:hover { color: #14132B !important; }
        .aw-tr { animation: awRise 0.35s cubic-bezier(.2,.8,.2,1) both; transition: background 0.15s ease; cursor: pointer; }
        .aw-tr:hover { background: rgba(109,74,255,0.03); }
        .aw-backdrop { position: fixed; inset: 0; background: rgba(15,15,25,0.45); backdrop-filter: blur(4px); z-index: 50; animation: awBackdropIn 0.2s ease both; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .aw-modal { animation: awModalIn 0.3s cubic-bezier(.2,.8,.2,1) both; background: #fff; border-radius: 22px; max-width: 460px; width: 100%; padding: 28px; box-shadow: 0 30px 60px rgba(15,23,42,0.25); }
        .aw-modal-close { cursor: pointer; transition: all 0.15s ease; }
        .aw-modal-close:hover { background: rgba(20,19,43,0.08) !important; transform: rotate(90deg); }
        .aw-toast { position: fixed; bottom: 28px; left: 50%; background: #14132B; color: #fff; padding: 12px 20px; border-radius: 12px; font-size: 13px; font-weight: 600; z-index: 60; animation: awToastIn 0.25s cubic-bezier(.2,.8,.2,1) both; box-shadow: 0 12px 24px rgba(15,23,42,0.25); display: flex; align-items: center; gap: 8px; }
        .aw-scrolltop { position: fixed; bottom: 28px; right: 28px; width: 44px; height: 44px; border-radius: 50%; background: #14132B; color: #fff; border: none; cursor: pointer; z-index: 40; box-shadow: 0 12px 24px rgba(15,23,42,0.2); transition: all 0.2s ease; animation: awRise 0.3s ease both; }
        .aw-scrolltop:hover { transform: translateY(-3px); }
        .aw-spinner { animation: awSpin 0.8s linear infinite; }
        .aw-loading-icon { animation: awPulse 1.6s ease-in-out infinite; }
        .aw-kbd { font-family: monospace; background: rgba(20,19,43,0.06); border: 1px solid rgba(20,19,43,0.1); padding: 1px 6px; border-radius: 5px; font-size: 11px; }

        @media (max-width: 640px) {
          .aw-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .aw-toolbar { flex-direction: column !important; align-items: stretch !important; }
          .aw-row { flex-direction: column !important; align-items: flex-start !important; gap: 10px; }
          .aw-hide-mobile { display: none !important; }
          .aw-scrolltop { bottom: 20px; right: 20px; }
        }
        @media print {
          .aw-toolbar-sticky, .aw-export, .aw-viewtoggle, .aw-scrolltop, .aw-loadmore, .aw-chevron { display: none !important; }
          .aw-row, .aw-tr { animation: none !important; }
        }
      `}</style>

      {/* Header */}
      <div className="aw-head" style={{ marginBottom: 22, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div>
          <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase", background: "#14132B", color: "#fff", padding: "4px 10px", borderRadius: 20, marginBottom: 10, display: "inline-block" }}>Admin</span>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 27, fontWeight: 700, color: "#14132B", letterSpacing: -0.5, marginBottom: 6 }}>All Winners</h1>
          <p style={{ color: "rgba(20,19,43,0.5)", fontSize: 14 }}>
            Platform-wide log of every winner announced across all challenges.{" "}
            <span className="aw-hide-mobile" style={{ opacity: 0.7 }}>
              Press <span className="aw-kbd">/</span> to search.
            </span>
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div className="aw-viewtoggle" style={{ display: "flex", background: "#fff", border: "1px solid rgba(15,23,42,0.1)", borderRadius: 12, padding: 3 }}>
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
            className="aw-export"
            disabled={filtered.length === 0}
            onClick={() => {
              downloadCSV(filtered);
              setToast(`Exported ${filtered.length} winner${filtered.length !== 1 ? "s" : ""} to CSV`);
            }}
            style={{ border: "1px solid rgba(15,23,42,0.1)", background: "#fff", color: "#14132B", fontSize: 13, fontWeight: 700, padding: "10px 16px", borderRadius: 12, display: "flex", alignItems: "center", gap: 8 }}
          >
            ⬇ Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="aw-head aw-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 22 }}>
        {[
          { key: "ALL", label: "Total Winners", tone: "#14132B", bg: "linear-gradient(150deg,#F6F5FB,#EDECF7)", orb: "rgba(20,19,43,0.08)", icon: "🏆", val: counts.ALL },
          { key: 1, label: "1st Place", tone: "#B45309", bg: "linear-gradient(150deg,#FEF3C7,#FFFBEB)", orb: "rgba(212,160,23,0.2)", icon: "🥇", val: counts[1] },
          { key: 2, label: "2nd Place", tone: "#6B7280", bg: "linear-gradient(150deg,#F3F4F6,#F9FAFB)", orb: "rgba(156,163,175,0.2)", icon: "🥈", val: counts[2] },
          { key: 3, label: "3rd Place", tone: "#92400E", bg: "linear-gradient(150deg,#FED7AA,#FFF7ED)", orb: "rgba(180,131,9,0.2)", icon: "🥉", val: counts[3] },
        ].map((c) => (
          <div
            key={c.key}
            className={"aw-stat" + (positionFilter === c.key ? " active" : "")}
            onClick={() => setPositionFilter(positionFilter === c.key ? "ALL" : (c.key as any))}
            style={{ background: c.bg, borderRadius: 18, padding: "18px 18px", border: "1px solid rgba(255,255,255,0.6)", color: c.tone }}
          >
            <div className="aw-orb" style={{ background: `radial-gradient(circle, ${c.orb}, transparent 70%)` }} />
            <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <p style={{ fontSize: 11.5, fontWeight: 700, color: c.tone, opacity: 0.8 }}>{c.label}</p>
              <span style={{ fontSize: 18 }}>{c.icon}</span>
            </div>
            <p style={{ position: "relative", fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 800, color: c.tone }}>
              <AnimatedCount value={c.val} />
            </p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className={"aw-toolbar-sticky" + (scrolled ? " scrolled" : "")}>
        <div className="aw-toolbar" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 220px" }}>
            <input
              ref={searchRef}
              className="aw-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by winner, challenge, or organizer..."
              style={{ width: "100%", padding: "11px 16px", paddingRight: search ? 36 : 16, borderRadius: 12, border: "1px solid rgba(15,23,42,0.08)", background: "#fff", fontSize: 13.5, outline: "none", color: "#14132B", boxSizing: "border-box", transition: "all 0.2s ease" }}
            />
            {search && (
              <span
                className="aw-clear"
                onClick={() => setSearch("")}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(20,19,43,0.4)", fontSize: 15, fontWeight: 700 }}
              >
                ✕
              </span>
            )}
          </div>

          <input
            type="date"
            className="aw-input"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(15,23,42,0.08)", background: "#fff", fontSize: 12.5, color: "#14132B", outline: "none" }}
          />
          <span style={{ color: "rgba(20,19,43,0.3)", fontSize: 12 }}>to</span>
          <input
            type="date"
            className="aw-input"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(15,23,42,0.08)", background: "#fff", fontSize: 12.5, color: "#14132B", outline: "none" }}
          />

          <select
            className="aw-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            style={{ padding: "11px 14px", borderRadius: 12, border: "1px solid rgba(15,23,42,0.08)", background: "#fff", fontSize: 13.5, color: "#14132B", outline: "none", fontWeight: 600 }}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="position">By position</option>
          </select>

          {filtersActive && (
            <button
              className="aw-clear"
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
            Showing {visible.length} of {filtered.length} winner{filtered.length !== 1 ? "s" : ""}
            {positionFilter !== "ALL" && ` · ${getMedal(positionFilter as number).label} place`}
          </p>
          <button
            onClick={() => loadWinners(true)}
            style={{ border: "none", background: "none", color: "rgba(20,19,43,0.4)", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
          >
            <span className={refreshing ? "aw-spinner" : ""} style={{ display: "inline-block" }}>⟳</span>
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Refresh"}
          </button>
        </div>
      )}

      {/* Body */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, color: "rgba(20,19,43,0.4)", fontSize: 12.5 }}>
            <span className="aw-loading-icon">🏆</span> Loading winners…
          </div>
          {[1, 2, 3, 4].map((i) => <div key={i} className="aw-skeleton" style={{ height: 76, borderRadius: 16, animationDelay: `${i * 0.05}s` }} />)}
        </div>
      ) : loadError ? (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 18, padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>⚠️</div>
          <p style={{ color: "#991B1B", fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Couldn't load winners.</p>
          <button
            onClick={() => loadWinners(true)}
            style={{ border: "1px solid #FECACA", background: "#fff", color: "#991B1B", fontSize: 12.5, fontWeight: 700, padding: "8px 18px", borderRadius: 10, cursor: "pointer" }}
          >
            {refreshing ? "Retrying…" : "Try again"}
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="aw-row" style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.07)", padding: 50, textAlign: "center", cursor: "default" }}>
          <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.25 }}>🏆</div>
          <p style={{ color: "rgba(20,19,43,0.4)", fontSize: 14, marginBottom: filtersActive ? 12 : 0 }}>No winners match these filters.</p>
          {filtersActive && (
            <button onClick={clearFilters} style={{ border: "1px solid rgba(15,23,42,0.1)", background: "#fff", color: "#14132B", fontSize: 12.5, fontWeight: 700, padding: "8px 16px", borderRadius: 10, cursor: "pointer" }}>
              Clear filters
            </button>
          )}
        </div>
      ) : view === "cards" ? (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {visible.map((w, i) => {
              const name = winnerName(w);
              const medal = getMedal(w.position);
              return (
                <div
                  key={w.id}
                  className="aw-row"
                  onClick={() => setSelected(w)}
                  style={{ animationDelay: `${Math.min(i * 0.04, 0.4)}s`, background: "#fff", border: "1px solid rgba(15,23,42,0.07)", borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                        <span className="aw-medal" style={{ fontSize: 28, display: "inline-block" }}>{medal.emoji}</span>
                    {winnerImage(w) ? (
                      <img src={winnerImage(w)!} alt={name} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: colorFor(name), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, fontWeight: 800, flexShrink: 0 }}>
                        {initials(name)}
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: 14.5, fontWeight: 700, color: "#14132B" }}>{name}</div>
                      <div style={{ fontSize: 12, color: "rgba(20,19,43,0.45)", marginTop: 2 }}>
                        {w.challenge?.title} · by {w.challenge?.organizer?.orgName || "Unknown"} · {new Date(w.announcedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {w.challenge?.prize && <span style={{ fontSize: 12.5, fontWeight: 700, color: "#D97706", background: "rgba(217,119,6,0.06)", padding: "4px 12px", borderRadius: 20 }}>{w.challenge.prize}</span>}
                    <span style={{ fontSize: 11.5, fontWeight: 700, padding: "4px 12px", borderRadius: 20, color: medal.color, background: `${medal.color}22` }}>{medal.label} Place</span>
                    <span className="aw-chevron">→</span>
                  </div>
                </div>
              );
            })}
          </div>

          {hasMore && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
              <button
                className="aw-loadmore"
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
                  <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: "rgba(20,19,43,0.5)", textTransform: "uppercase", letterSpacing: 0.4 }}>Winner</th>
                  <th className="aw-th" onClick={() => setSort("position")} style={{ textAlign: "left", padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: sort === "position" ? "#14132B" : "rgba(20,19,43,0.5)", textTransform: "uppercase", letterSpacing: 0.4 }}>
                    Position {sort === "position" && "▲"}
                  </th>
                  <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: "rgba(20,19,43,0.5)", textTransform: "uppercase", letterSpacing: 0.4 }}>Challenge</th>
                  <th className="aw-hide-mobile" style={{ textAlign: "left", padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: "rgba(20,19,43,0.5)", textTransform: "uppercase", letterSpacing: 0.4 }}>Organizer</th>
                  <th className="aw-hide-mobile" style={{ textAlign: "left", padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: "rgba(20,19,43,0.5)", textTransform: "uppercase", letterSpacing: 0.4 }}>Prize</th>
                  <th className="aw-th" onClick={toggleDateSort} style={{ textAlign: "left", padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: sort !== "position" ? "#14132B" : "rgba(20,19,43,0.5)", textTransform: "uppercase", letterSpacing: 0.4 }}>
                    Date {sort === "newest" ? "▼" : sort === "oldest" ? "▲" : ""}
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((w, i) => {
                  const name = winnerName(w);
                  const medal = getMedal(w.position);
                  return (
                    <tr key={w.id} className="aw-tr" onClick={() => setSelected(w)} style={{ borderBottom: "1px solid rgba(15,23,42,0.05)", animationDelay: `${Math.min(i * 0.03, 0.3)}s` }}>
                                            <td style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                        {winnerImage(w) ? (
                          <img src={winnerImage(w)!} alt={name} style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 26, height: 26, borderRadius: "50%", background: colorFor(name), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10.5, fontWeight: 800, flexShrink: 0 }}>
                            {initials(name)}
                          </div>
                        )}
                        <span style={{ fontWeight: 700, color: "#14132B" }}>{name}</span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 20, color: medal.color, background: `${medal.color}22` }}>{medal.emoji} {medal.label}</span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "rgba(20,19,43,0.7)" }}>{w.challenge?.title}</td>
                      <td className="aw-hide-mobile" style={{ padding: "12px 16px", color: "rgba(20,19,43,0.55)" }}>{w.challenge?.organizer?.orgName || "—"}</td>
                      <td className="aw-hide-mobile" style={{ padding: "12px 16px", color: "#D97706", fontWeight: 700 }}>{w.challenge?.prize || "—"}</td>
                      <td style={{ padding: "12px 16px", color: "rgba(20,19,43,0.55)", whiteSpace: "nowrap" }}>{new Date(w.announcedAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {hasMore && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
              <button
                className="aw-loadmore"
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
        <div className="aw-backdrop" onClick={() => setSelected(null)}>
          <div className="aw-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              {winnerImage(selected) ? (
                  <img src={winnerImage(selected)!} alt={winnerName(selected)} style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: colorFor(winnerName(selected)), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800 }}>
                    {initials(winnerName(selected))}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "#14132B" }}>{winnerName(selected)}</div>
                  <div style={{ fontSize: 12.5, color: "rgba(20,19,43,0.45)" }}>
                    {getMedal(selected.position).emoji} {getMedal(selected.position).label} place
                  </div>
                </div>
              </div>
              <button className="aw-modal-close" onClick={() => setSelected(null)} style={{ border: "none", background: "rgba(20,19,43,0.05)", width: 32, height: 32, borderRadius: "50%", fontSize: 14, color: "#14132B" }}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {[
                { label: "Username", value: `@${winnerUsername(selected)}` },
                { label: "Challenge", value: selected.challenge?.title || "—" },
                { label: "Organizer", value: selected.challenge?.organizer?.orgName || "—" },
                { label: "Prize", value: selected.challenge?.prize || "—" },
                { label: "Announced", value: new Date(selected.announcedAt).toLocaleString() },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, borderBottom: "1px solid rgba(15,23,42,0.05)", paddingBottom: 10 }}>
                  <span style={{ color: "rgba(20,19,43,0.5)", fontWeight: 600 }}>{row.label}</span>
                  <span style={{ color: "#14132B", fontWeight: 700, textAlign: "right" }}>{row.value}</span>
                </div>
              ))}
            </div>

            <button
              className={"aw-copybtn" + (copiedId === selected.id ? " copied" : "")}
              onClick={() => copyUsername(selected)}
              style={{ width: "100%", border: "1px solid rgba(15,23,42,0.1)", background: "#fff", color: "#14132B", fontSize: 13, fontWeight: 700, padding: "11px", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              {copiedId === selected.id ? "✓ Copied username" : "⧉ Copy username"}
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="aw-toast">
          ✓ {toast}
        </div>
      )}

      {/* Scroll to top */}
      {showTop && (
        <button className="aw-scrolltop" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Scroll to top">
          ↑
        </button>
      )}
    </div>
  );
}