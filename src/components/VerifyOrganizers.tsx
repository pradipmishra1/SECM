"use client";

import { useEffect, useState, useRef, useCallback } from "react";

type SortKey = "date_desc" | "date_asc" | "name_asc" | "name_desc";

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

const ORG_GRADIENTS = [
  "linear-gradient(135deg,#DC2626,#EF4444)",
  "linear-gradient(135deg,#6D4AFF,#8B5CF6)",
  "linear-gradient(135deg,#15803D,#22C55E)",
  "linear-gradient(135deg,#D97706,#F59E0B)",
  "linear-gradient(135deg,#2563EB,#3B82F6)",
  "linear-gradient(135deg,#A21CAF,#C026D3)",
  "linear-gradient(135deg,#DB2777,#EC4899)",
  "linear-gradient(135deg,#047857,#059669)",
];

function getOrgTheme(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return ORG_GRADIENTS[hash % ORG_GRADIENTS.length];
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

export default function VerifyOrganizers() {
  const [organizers, setOrganizers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [filter, setFilter] = useState<"pending" | "verified" | "all">("pending");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date_desc");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmRevoke, setConfirmRevoke] = useState<any>(null);
  const [bulkConfirm, setBulkConfirm] = useState<string[] | null>(null);
  const [toast, setToast] = useState<{ msg: string; tone: string } | null>(null);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const [aiReviewEnabled, setAiReviewEnabled] = useState(false);
  const [flagBusy, setFlagBusy] = useState(false);

  useEffect(() => {
    load();
    loadFlags();
  }, []);

  function loadFlags() {
    fetch("/api/admin/feature-flags")
      .then((r) => r.json())
      .then((d) => {
        const flag = (d.flags || []).find((f: any) => f.key === "AI_REVIEW");
        setAiReviewEnabled(!!flag?.enabled);
      });
  }

  async function toggleAiReview() {
    setFlagBusy(true);
    const next = !aiReviewEnabled;
    await fetch("/api/admin/feature-flags", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "AI_REVIEW", enabled: next }),
    });
    setAiReviewEnabled(next);
    setFlagBusy(false);
    showToast(next ? "AI Review feature enabled platform-wide" : "AI Review feature disabled", next ? "#15803D" : "#B91C1C");
  }

  useEffect(() => {
    setPage(1);
  }, [search, filter, sortKey]);

  function load() {
    setLoading(true);
    setLoadError(false);
    fetch("/api/admin/organizers")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then((d) => {
        setOrganizers(d.organizers || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setLoadError(true);
      });
  }

  async function loadSilently() {
    try {
      const r = await fetch("/api/admin/organizers");
      const d = await r.json();
      setOrganizers(d.organizers || []);
    } catch {
      // keep the current list on screen if a background refresh fails
    }
  }

  function showToast(msg: string, tone: string) {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 3000);
  }

  async function setVerified(id: string, isVerified: boolean, orgName: string) {
    setBusyId(id);
    try {
      const r = await fetch(`/api/admin/organizers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified }),
      });
      if (!r.ok) throw new Error();
      setConfirmRevoke(null);
      setSelected((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
      await loadSilently();
      showToast(isVerified ? `${orgName} approved and published` : `${orgName} verification revoked`, isVerified ? "#15803D" : "#B91C1C");
    } catch {
      showToast(`Couldn't update ${orgName} — try again`, "#B91C1C");
    } finally {
      setBusyId(null);
    }
  }

  async function bulkSetVerified(ids: string[], isVerified: boolean) {
    setBulkBusy(true);
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/organizers/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isVerified }),
          })
        )
      );
      await loadSilently();
      setSelected(new Set());
      setBulkConfirm(null);
      showToast(
        isVerified ? `${ids.length} organizer${ids.length > 1 ? "s" : ""} approved` : `${ids.length} organizer${ids.length > 1 ? "s" : ""} revoked`,
        isVerified ? "#15803D" : "#B91C1C"
      );
    } catch {
      showToast("Some updates failed — try again", "#B91C1C");
    } finally {
      setBulkBusy(false);
    }
  }

  const pendingCount = organizers.filter((o) => !o.isVerified).length;
  const verifiedCount = organizers.filter((o) => o.isVerified).length;

  const byTab = organizers.filter((o) => {
    if (filter === "pending") return !o.isVerified;
    if (filter === "verified") return o.isVerified;
    return true;
  });

  const searched = byTab.filter((o) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      o.orgName?.toLowerCase().includes(q) ||
      o.user?.email?.toLowerCase().includes(q) ||
      o.user?.username?.toLowerCase().includes(q)
    );
  });

  const sorted = [...searched].sort((a, b) => {
    switch (sortKey) {
      case "date_asc":
        return new Date(a.user?.createdAt).getTime() - new Date(b.user?.createdAt).getTime();
      case "name_asc":
        return (a.orgName || "").localeCompare(b.orgName || "");
      case "name_desc":
        return (b.orgName || "").localeCompare(a.orgName || "");
      default:
        return new Date(b.user?.createdAt).getTime() - new Date(a.user?.createdAt).getTime();
    }
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const pageIds = pageItems.map((o) => o.id);
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
    setConfirmRevoke(null);
    setBulkConfirm(null);
  }, []);

  useEscapeKey(closeModals, !!confirmRevoke || !!bulkConfirm);

  const hasFilters = search.trim().length > 0;
  const selectedOrgs = organizers.filter((o) => selected.has(o.id));
  const selectedHasVerified = selectedOrgs.some((o) => o.isVerified);
  const selectedHasPending = selectedOrgs.some((o) => !o.isVerified);

  return (
    <div>
      <style>{`
        @keyframes voHeadIn { from { opacity:0; transform: translateX(-10px); } to { opacity:1; transform: translateX(0); } }
        @keyframes voRise { from { opacity:0; transform: translateY(14px) scale(0.98); } to { opacity:1; transform: translateY(0) scale(1); } }
        @keyframes voToastIn { from { opacity:0; transform: translate(-50%,-14px) scale(0.95); } to { opacity:1; transform: translate(-50%,0) scale(1); } }
        @keyframes voShimmer { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }
        @keyframes voSpin { to { transform: rotate(360deg); } }
        @keyframes voOrb { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(8px,-8px) scale(1.06); } }
        @keyframes voBarIn { from { opacity:0; transform: translateY(-8px); } to { opacity:1; transform: translateY(0); } }
        .vo-head { animation: voHeadIn 0.45s cubic-bezier(.2,.8,.2,1) both; }
        .vo-row { animation: voRise 0.4s cubic-bezier(.2,.8,.2,1) both; transition: transform 0.2s ease, box-shadow 0.25s ease, border-color 0.25s ease; }
        .vo-row:hover { transform: translateY(-2px); box-shadow: 0 14px 30px rgba(15,23,42,0.08); border-color: rgba(109,74,255,0.15) !important; }
        .vo-tab { transition: all 0.2s ease; }
        .vo-btn { transition: transform 0.15s ease, box-shadow 0.2s ease; }
        .vo-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 14px rgba(15,23,42,0.12); }
        .vo-btn:active:not(:disabled) { transform: scale(0.96); }
        .vo-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .vo-spinner { animation: voSpin 0.6s linear infinite; }
        .vo-toast { animation: voToastIn 0.3s cubic-bezier(.2,.8,.2,1); }
        .vo-skeleton { background: linear-gradient(90deg, #F0EEFA 25%, #E6E2F5 37%, #F0EEFA 63%); background-size: 400% 100%; animation: voShimmer 1.4s ease infinite; }
        .vo-stat { position: relative; overflow: hidden; transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .vo-stat:hover { transform: translateY(-4px); box-shadow: 0 16px 32px rgba(15,23,42,0.1); }
        .vo-orb { position: absolute; top: -30%; right: -15%; width: 100px; height: 100px; border-radius: 50%; animation: voOrb 6s ease-in-out infinite; pointer-events: none; }
        .vo-logo { transition: transform 0.25s cubic-bezier(.34,1.56,.64,1); }
        .vo-row:hover .vo-logo { transform: scale(1.08) rotate(-3deg); }
        .vo-stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 22px; }
        .vo-toolbar-row { display: flex; gap: 10px; align-items: center; }
        .vo-search:focus { border-color: rgba(109,74,255,0.4) !important; box-shadow: 0 0 0 3px rgba(109,74,255,0.08); }
        .vo-row-inner { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
        .vo-row-left { display: flex; align-items: center; gap: 14px; min-width: 0; }
        .vo-row-actions { display: flex; gap: 8px; flex-shrink: 0; }
        .vo-check { width: 16px; height: 16px; accent-color: #6D4AFF; cursor: pointer; flex-shrink: 0; }
        .vo-bulkbar { animation: voBarIn 0.25s cubic-bezier(.2,.8,.2,1) both; }
        .vo-modal-btn { transition: transform 0.15s ease; }
        .vo-modal-btn:hover { transform: translateY(-1px); }
        .vo-btn:focus-visible, .vo-tab:focus-visible, .vo-modal-btn:focus-visible, .vo-search:focus-visible, .vo-check:focus-visible, .vo-sort:focus-visible {
          outline: 2px solid #6D4AFF; outline-offset: 2px;
        }
        @media (max-width: 640px) {
          .vo-stats-grid { grid-template-columns: 1fr; }
          .vo-toolbar-row { flex-wrap: wrap; }
          .vo-row-inner { flex-direction: column; align-items: flex-start; }
          .vo-row-actions { width: 100%; }
          .vo-row-actions button { flex: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .vo-head, .vo-row, .vo-toast, .vo-stat, .vo-logo, .vo-spinner, .vo-bulkbar, .vo-orb {
            animation: none !important; transition: none !important;
          }
        }
      `}</style>

      {toast && (
        <div className="vo-toast" role="status" style={{ position: "fixed", top: 24, left: "50%", background: toast.tone, color: "#fff", padding: "12px 24px", borderRadius: 14, fontSize: 13.5, fontWeight: 700, zIndex: 300, boxShadow: "0 12px 30px rgba(20,19,43,0.3)" }}>
          {toast.msg}
        </div>
      )}

      <div className="vo-head" style={{ marginBottom: 22 }}>
        <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase", background: "#14132B", color: "#fff", padding: "4px 10px", borderRadius: 20, marginBottom: 10, display: "inline-block" }}>Admin</span>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 27, fontWeight: 700, color: "#14132B", letterSpacing: -0.5, marginBottom: 6 }}>Verify Organizers</h1>
        <p style={{ color: "rgba(20,19,43,0.5)", fontSize: 14 }}>Review and approve organizations before they can publish live challenges.</p>
      </div>



      <div className="vo-head" style={{ background: "#fff", border: "1px solid rgba(15,23,42,0.07)", borderRadius: 18, padding: "18px 22px", marginBottom: 22, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(109,74,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6D4AFF", flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#14132B" }}>AI Review (Platform Feature)</p>
            <p style={{ fontSize: 12, color: "rgba(20,19,43,0.5)" }}>Lets organizers pay to unlock AI-assisted submission scoring</p>
          </div>
        </div>
        <button
          onClick={toggleAiReview}
          disabled={flagBusy}
          aria-label="Toggle AI Review feature"
          style={{
            width: 52, height: 28, borderRadius: 20, border: "none", cursor: "pointer", position: "relative",
            background: aiReviewEnabled ? "linear-gradient(135deg,#16A34A,#15803D)" : "rgba(15,23,42,0.12)",
            transition: "background 0.2s ease", opacity: flagBusy ? 0.6 : 1,
          }}
        >
          <span style={{
            position: "absolute", top: 3, left: aiReviewEnabled ? 27 : 3, width: 22, height: 22, borderRadius: "50%",
            background: "#fff", transition: "left 0.2s cubic-bezier(.34,1.56,.64,1)", boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }} />
        </button>
      </div>



      <div className="vo-head vo-stats-grid">
        <div
          className="vo-stat"
          style={{
            background: pendingCount > 0 ? "linear-gradient(135deg,#FCA5A5,#F87171)" : "linear-gradient(135deg,#E5E7EB,#F3F4F6)",
            borderRadius: 18,
            padding: "20px 20px",
            border: "1px solid rgba(255,255,255,0.5)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: pendingCount > 0 ? "#7F1D1D" : "#374151", opacity: 0.85 }}>Pending Verification</p>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", color: pendingCount > 0 ? "#B91C1C" : "#6B7280" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 7v5l3.5 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 32, fontWeight: 800, color: pendingCount > 0 ? "#7F1D1D" : "#374151" }}>
            <AnimatedCount value={pendingCount} />
          </p>
        </div>
        <div className="vo-stat" style={{ background: "linear-gradient(135deg,#6EE7B7,#34D399)", borderRadius: 18, padding: "20px 20px", border: "1px solid rgba(255,255,255,0.5)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#064E3B", opacity: 0.85 }}>Verified Organizers</p>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#047857" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 32, fontWeight: 800, color: "#064E3B" }}>
            <AnimatedCount value={verifiedCount} />
          </p>
        </div>
      </div>

      <div className="vo-head" style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          { key: "pending", label: "Pending" },
          { key: "verified", label: "Verified" },
          { key: "all", label: "All" },
        ].map((t) => (
          <button
            key={t.key}
            className="vo-tab"
            onClick={() => setFilter(t.key as any)}
                        style={{ padding: "8px 16px", borderRadius: 20, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", background: filter === t.key ? "#6D4AFF" : "rgba(20,19,43,0.05)", color: filter === t.key ? "#fff" : "rgba(20,19,43,0.6)" }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="vo-head vo-toolbar-row" style={{ marginBottom: 14 }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(20,19,43,0.35)" strokeWidth="2" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
            <circle cx="11" cy="11" r="6.5" />
            <path d="m20 20-4-4" strokeLinecap="round" />
          </svg>
          <input
            className="vo-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by org name, email, or username..."
            aria-label="Search organizers"
            style={{ width: "100%", padding: "11px 16px 11px 38px", borderRadius: 12, border: "1px solid rgba(15,23,42,0.08)", background: "#fff", fontSize: 13.5, outline: "none", color: "#14132B", boxSizing: "border-box", transition: "all 0.2s ease" }}
          />
        </div>
        <select
          className="vo-sort"
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          aria-label="Sort organizers"
          style={{ padding: "11px 14px", borderRadius: 12, border: "1px solid rgba(15,23,42,0.08)", background: "#fff", fontSize: 13, color: "#14132B", outline: "none", cursor: "pointer", flexShrink: 0 }}
        >
          <option value="date_desc">Newest first</option>
          <option value="date_asc">Oldest first</option>
          <option value="name_asc">Name A–Z</option>
          <option value="name_desc">Name Z–A</option>
        </select>
      </div>

      {selected.size > 0 && (
        <div className="vo-bulkbar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "#14132B", borderRadius: 14, padding: "12px 18px", marginBottom: 14, flexWrap: "wrap" }}>
          <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{selected.size} selected</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {selectedHasPending && (
              <button className="vo-btn" disabled={bulkBusy} onClick={() => bulkSetVerified(Array.from(selected), true)} style={{ background: "rgba(22,163,74,0.15)", color: "#4ADE80", border: "1px solid rgba(22,163,74,0.3)", borderRadius: 9, padding: "7px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
                Approve
              </button>
            )}
            {selectedHasVerified && (
              <button className="vo-btn" disabled={bulkBusy} onClick={() => setBulkConfirm(Array.from(selected))} style={{ background: "rgba(220,38,38,0.15)", color: "#F87171", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 9, padding: "7px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
                Revoke
              </button>
            )}
            <button className="vo-btn" disabled={bulkBusy} onClick={() => setSelected(new Set())} style={{ background: "transparent", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 9, padding: "7px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
              Clear
            </button>
          </div>
        </div>
      )}

      {!loading && !loadError && pageItems.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 4px 10px" }}>
          <input ref={selectAllRef} type="checkbox" className="vo-check" checked={allPageSelected} onChange={toggleSelectAll} aria-label="Select all organizers on this page" />
          <span style={{ fontSize: 12, color: "rgba(20,19,43,0.45)" }}>
            {sorted.length} {sorted.length === 1 ? "organizer" : "organizers"}{hasFilters ? " match your search" : ""}
          </span>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3].map((i) => <div key={i} className="vo-skeleton" style={{ height: 78, borderRadius: 16 }} />)}
        </div>
      ) : loadError ? (
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(220,38,38,0.15)", padding: 50, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.35 }}>⚠️</div>
          <p style={{ color: "rgba(20,19,43,0.55)", fontSize: 14, marginBottom: 16 }}>Couldn't load organizers.</p>
          <button className="vo-btn" onClick={load} style={{ background: "#14132B", color: "#fff", border: "none", borderRadius: 10, padding: "9px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Try again
          </button>
        </div>
      ) : pageItems.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.07)", padding: 50, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.25 }}>✅</div>
          <p style={{ color: "rgba(20,19,43,0.4)", fontSize: 14, marginBottom: hasFilters ? 16 : 0 }}>
            {hasFilters ? "No organizers match your search." : filter === "pending" ? "No organizers waiting for verification." : "Nothing here."}
          </p>
          {hasFilters && (
            <button className="vo-btn" onClick={() => setSearch("")} style={{ background: "rgba(109,74,255,0.08)", color: "#6D4AFF", border: "1px solid rgba(109,74,255,0.2)", borderRadius: 10, padding: "9px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {pageItems.map((o, i) => (
            <div key={o.id} className="vo-row" style={{ animationDelay: `${Math.min(i * 0.04, 0.3)}s`, background: "#fff", border: "1px solid rgba(15,23,42,0.07)", borderRadius: 16, padding: "16px 20px" }}>
              <div className="vo-row-inner">
                <div className="vo-row-left">
                  <input type="checkbox" className="vo-check" checked={selected.has(o.id)} onChange={() => toggleSelect(o.id)} aria-label={`Select ${o.orgName}`} />
                                   {o.user?.image ? (
                    <img
                      src={o.user.image}
                      alt={o.orgName}
                      className="vo-logo"
                      style={{ width: 42, height: 42, borderRadius: 12, objectFit: "cover", flexShrink: 0, boxShadow: "0 4px 10px rgba(20,19,43,0.15)" }}
                    />
                  ) : (
                    <div className="vo-logo" style={{ width: 42, height: 42, borderRadius: 12, background: getOrgTheme(o.id), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, flexShrink: 0, boxShadow: "0 4px 10px rgba(20,19,43,0.15)" }}>
                      {o.orgName?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14.5, fontWeight: 700, color: "#14132B" }}>{o.orgName}</span>
                      {o.isVerified && <span style={{ fontSize: 10.5, fontWeight: 700, background: "rgba(22,163,74,0.1)", color: "#15803D", padding: "3px 9px", borderRadius: 20 }}>Verified</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(20,19,43,0.45)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {o.user?.email} · @{o.user?.username} · {o._count?.challenges || 0} challenge{(o._count?.challenges || 0) !== 1 ? "s" : ""} · joined {new Date(o.user?.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="vo-row-actions">
                  {o.isVerified ? (
                    <button className="vo-btn" disabled={busyId === o.id} onClick={() => setConfirmRevoke(o)} style={{ background: "rgba(220,38,38,0.08)", color: "#B91C1C", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 10, padding: "9px 16px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      {busyId === o.id && <span className="vo-spinner" style={{ width: 11, height: 11, border: "2px solid rgba(185,28,28,0.3)", borderTop: "2px solid #B91C1C", borderRadius: "50%" }} />}
                      Revoke
                    </button>
                  ) : (
                    <button className="vo-btn" disabled={busyId === o.id} onClick={() => setVerified(o.id, true, o.orgName)} style={{ background: "linear-gradient(135deg,#16A34A,#15803D)", color: "#fff", border: "none", borderRadius: 10, padding: "9px 18px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      {busyId === o.id && <span className="vo-spinner" style={{ width: 11, height: 11, border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid #fff", borderRadius: "50%" }} />}
                      Approve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !loadError && sorted.length > 0 && totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginTop: 20 }}>
          <button className="vo-btn" disabled={currentPage <= 1} onClick={() => setPage((p) => p - 1)} style={{ background: "#fff", color: "#14132B", border: "1px solid rgba(15,23,42,0.1)", borderRadius: 10, padding: "8px 16px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
            Prev
          </button>
          <span style={{ fontSize: 12.5, color: "rgba(20,19,43,0.5)", fontWeight: 600 }}>Page {currentPage} of {totalPages}</span>
          <button className="vo-btn" disabled={currentPage >= totalPages} onClick={() => setPage((p) => p + 1)} style={{ background: "#fff", color: "#14132B", border: "1px solid rgba(15,23,42,0.1)", borderRadius: 10, padding: "8px 16px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
            Next
          </button>
        </div>
      )}

      {confirmRevoke && (
        <div onClick={closeModals} role="presentation" style={{ position: "fixed", inset: 0, background: "rgba(20,19,43,0.55)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Confirm revoke" style={{ background: "#fff", borderRadius: 22, padding: 28, width: 400, maxWidth: "100%", boxShadow: "0 30px 60px rgba(20,19,43,0.3)", animation: "voRise 0.25s cubic-bezier(.2,.8,.2,1)" }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(220,38,38,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 16 }}>⚠️</div>
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, color: "#14132B", marginBottom: 10 }}>Revoke {confirmRevoke.orgName}?</h3>
            <p style={{ fontSize: 13.5, color: "rgba(20,19,43,0.6)", marginBottom: 22, lineHeight: 1.6 }}>
              This organizer will lose verified status and their {confirmRevoke._count?.challenges || 0} live challenge{(confirmRevoke._count?.challenges || 0) !== 1 ? "s" : ""} will be unpublished immediately.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="vo-modal-btn" onClick={closeModals} style={{ background: "rgba(20,19,43,0.05)", color: "#14132B", border: "none", borderRadius: 12, padding: "10px 20px", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
                Cancel
              </button>
              <button className="vo-modal-btn" disabled={busyId === confirmRevoke.id} onClick={() => setVerified(confirmRevoke.id, false, confirmRevoke.orgName)} style={{ background: "#B91C1C", color: "#fff", border: "none", borderRadius: 12, padding: "10px 20px", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
                Revoke
              </button>
            </div>
          </div>
        </div>
      )}

      {bulkConfirm && (
        <div onClick={closeModals} role="presentation" style={{ position: "fixed", inset: 0, background: "rgba(20,19,43,0.55)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Confirm bulk revoke" style={{ background: "#fff", borderRadius: 22, padding: 28, width: 400, maxWidth: "100%", boxShadow: "0 30px 60px rgba(20,19,43,0.3)", animation: "voRise 0.25s cubic-bezier(.2,.8,.2,1)" }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(220,38,38,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 16 }}>⚠️</div>
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, color: "#14132B", marginBottom: 10 }}>
              Revoke {bulkConfirm.length} organizer{bulkConfirm.length > 1 ? "s" : ""}?
            </h3>
            <p style={{ fontSize: 13.5, color: "rgba(20,19,43,0.6)", marginBottom: 22, lineHeight: 1.6 }}>
              All selected organizers will lose verified status and any live challenges they run will be unpublished immediately.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="vo-modal-btn" onClick={closeModals} style={{ background: "rgba(20,19,43,0.05)", color: "#14132B", border: "none", borderRadius: 12, padding: "10px 20px", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
                Cancel
              </button>
              <button className="vo-modal-btn" disabled={bulkBusy} onClick={() => bulkSetVerified(bulkConfirm, false)} style={{ background: "#B91C1C", color: "#fff", border: "none", borderRadius: 12, padding: "10px 20px", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
                Revoke all
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}