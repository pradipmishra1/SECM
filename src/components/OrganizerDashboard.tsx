"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import AvatarStack from "./AvatarStack";
import TiltCard from "./TiltCard";
import { Icon } from "./icons";
import AllChallengesModal from "./AllChallengesModal";

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: "Draft", color: "#6B7280", bg: "rgba(107,114,128,0.1)" },
  PUBLISHED: { label: "Live", color: "#15803D", bg: "rgba(22,163,74,0.1)" },
  CLOSED: { label: "Closed", color: "#B91C1C", bg: "rgba(220,38,38,0.1)" },
  COMPLETED: { label: "Ended", color: "#6B7280", bg: "rgba(107,114,128,0.1)" },
};

const CARD_THEMES = [
  { bg: "linear-gradient(135deg, #F0EDFF 0%, #E6E0FF 100%)", blob: "rgba(109,74,255,0.18)", accent: "#6D4AFF" },
  { bg: "linear-gradient(135deg, #E9F3FF 0%, #D6E9FF 100%)", blob: "rgba(37,99,235,0.16)", accent: "#2563EB" },
  { bg: "linear-gradient(135deg, #FFF7E8 0%, #FFEFD1 100%)", blob: "rgba(245,158,11,0.18)", accent: "#D97706" },
  { bg: "linear-gradient(135deg, #E8F9F1 0%, #D3F3E3 100%)", blob: "rgba(22,163,74,0.16)", accent: "#15803D" },
];

function getTheme(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return CARD_THEMES[hash % CARD_THEMES.length];
}

function daysLeft(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

function getEffectiveStatus(c: any): string {
  const isPastDeadline = new Date(c.deadline).getTime() < Date.now();
  if (isPastDeadline && (c.status === "PUBLISHED" || c.status === "CLOSED")) return "CLOSED";
  return c.status;
}

/* ---------- Scroll reveal (fade + rise + slight scale) ---------- */
function ScrollReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(30px) scale(0.985)",
        transition: `opacity 0.65s cubic-bezier(.22,1.1,.36,1) ${delay}s, transform 0.65s cubic-bezier(.22,1.1,.36,1) ${delay}s`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

/* ---------- Count-up with overshoot + settle pulse ---------- */
function CountUpNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const [justFinished, setJustFinished] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const duration = 900;
    const start = performance.now();

    function easeOutBack(t: number) {
      const c1 = 1.4;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = progress < 1 ? 1 - Math.pow(1 - progress, 3) : easeOutBack(progress);
      const next = Math.max(0, Math.round(eased * value));
      setDisplay(next);
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        setDisplay(value);
        setJustFinished(true);
        setTimeout(() => setJustFinished(false), 380);
      }
    }
    requestAnimationFrame(tick);
  }, [value]);

  return (
    <span
      style={{
        fontVariantNumeric: "tabular-nums",
        display: "inline-block",
        transform: justFinished ? "scale(1.08)" : "scale(1)",
        transition: "transform 0.32s cubic-bezier(.34,1.56,.64,1)",
      }}
    >
      {display}
    </span>
  );
}

/* ---------- Mountable/unmountable wrapper for exit transitions ---------- */
function Collapse({
  show,
  children,
  duration = 320,
}: {
  show: boolean;
  children: React.ReactNode;
  duration?: number;
}) {
  const [rendered, setRendered] = useState(show);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (show) {
      setRendered(true);
      t = setTimeout(() => setEntered(true), 20);
    } else {
      setEntered(false);
      t = setTimeout(() => setRendered(false), duration);
    }
    return () => clearTimeout(t);
  }, [show, duration]);

  if (!rendered) return null;

  return (
    <div
      style={{
        opacity: entered ? 1 : 0,
        transform: entered ? "translateY(0) scale(1)" : "translateY(-10px) scale(0.97)",
        maxHeight: entered ? 400 : 0,
        overflow: "hidden",
        transition: `opacity ${duration}ms cubic-bezier(.22,1.1,.36,1), transform ${duration}ms cubic-bezier(.22,1.1,.36,1), max-height ${duration}ms cubic-bezier(.22,1.1,.36,1)`,
      }}
    >
      {children}
    </div>
  );
}

function CreditStat({
  icon,
  label,
  value,
  bg,
  accent,
  c1,
  c2,
  delay,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  bg: string;
  accent: string;
  c1: string;
  c2: string;
  delay: string;
  onClick?: () => void;
}) {
  return (
    <div
      className="stat-anim credit-card"
      onClick={onClick}
      style={{
        flex: 1,
        animationDelay: delay,
        background: bg,
        borderRadius: 20,
        padding: "20px 22px",
        position: "relative",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.6)",
        minHeight: 130,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transformStyle: "preserve-3d",
        cursor: onClick ? "pointer" : "default",
      }}
      onMouseMove={(e) => {
        const el = e.currentTarget;
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const rx = (0.5 - py) * 14;
        const ry = (px - 0.5) * 14;
        el.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px) scale(1.02)`;
        const spot = el.querySelector(".card-spotlight") as HTMLElement;
        if (spot) spot.style.background = `radial-gradient(circle 160px at ${px * 100}% ${py * 100}%, rgba(255,255,255,0.55), transparent 70%)`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.transform = "perspective(700px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)";
        const spot = el.querySelector(".card-spotlight") as HTMLElement;
        if (spot) spot.style.background = "transparent";
      }}
      onMouseDown={(e) => {
        if (!onClick) return;
        e.currentTarget.style.transform += " scale(0.985)";
      }}
    >
      <div className="card-spotlight" style={{ position: "absolute", inset: 0, pointerEvents: "none", transition: "background 0.15s linear" }} />
      <div className="card-shine" />
      <div className="card-ring" />
      <div className="card-circle-1" style={{ position: "absolute", bottom: -18, right: 26, width: 46, height: 46, borderRadius: "50%", background: c1, opacity: 0.55 }} />
      <div className="card-circle-2" style={{ position: "absolute", bottom: -18, right: 4, width: 46, height: 46, borderRadius: "50%", background: c2, opacity: 0.55, mixBlendMode: "multiply" }} />
      <div className="card-watermark" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
        <img src="/brand/logobg.png" alt="" width={64} height={64} style={{ objectFit: "contain" }} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
        <div className="card-chip" style={{ width: 34, height: 26, borderRadius: 6, background: "rgba(255,255,255,0.7)", border: `1px solid ${accent}33`, display: "flex", alignItems: "center", justifyContent: "center", color: accent }}>
          {icon}
        </div>
      </div>

      <div style={{ position: "relative" }}>
        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 32, fontWeight: 800, color: accent, letterSpacing: 1 }}>
          <CountUpNumber value={value} />
        </div>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: "rgba(20,19,43,0.5)", marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
          {label}
        </div>
      </div>
    </div>
  );
}

export default function OrganizerDashboard({
  userName,
  stats,
  challenges,
  activity,
  isVerified,
  orgName,
  pendingChallengeIds = [],
}: {
  userName: string;
  stats: { totalChallenges: number; activeEvents: number; totalSubmissions: number; pendingReviews: number };
  challenges: any[];
  activity: { text: string; time: string }[];
  isVerified?: boolean;
  orgName?: string;
  pendingChallengeIds?: string[];
}) {
  const router = useRouter();
  const [showAllChallenges, setShowAllChallenges] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const needsAttention = challenges.filter((c) => pendingChallengeIds.includes(c.id));
  const firstPendingId = needsAttention.length > 0 ? needsAttention[0].id : null;

  const upcomingDeadlines = challenges
    .filter((c) => c.status === "PUBLISHED" && daysLeft(c.deadline) >= 0)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 4);

  function openModal() {
    setShowAllChallenges(true);
    requestAnimationFrame(() => setModalVisible(true));
  }
  function closeModal() {
    setModalVisible(false);
    setTimeout(() => setShowAllChallenges(false), 260);
  }

  return (
    <div>
      <style>{`
        @keyframes riseIn { from { opacity:0; transform: translateY(16px) scale(0.98); } to { opacity:1; transform: translateY(0) scale(1); } }
        @keyframes riseInSoft { from { opacity:0; transform: translateY(22px); } to { opacity:1; transform: translateY(0); } }
        @keyframes headIn { from { opacity:0; transform: translateX(-10px); } to { opacity:1; transform: translateX(0); } }
        @keyframes pulseDot { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.85); } }
        @keyframes orbFloat { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-10px,8px) scale(1.06); } }
        @keyframes ringPulse { 0% { box-shadow: 0 0 0 0 rgba(109,74,255,0.25); } 100% { box-shadow: 0 0 0 10px rgba(109,74,255,0); } }
        @keyframes fadeScaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        @keyframes shimmerBg { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes bannerPop { 0% { transform: scale(0.5) rotate(-15deg); opacity: 0; } 60% { transform: scale(1.15) rotate(5deg); } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
        @keyframes bounceArrow { 0%,100% { transform: translateX(0); } 50% { transform: translateX(3px); } }

        .head-anim { animation: headIn 0.55s cubic-bezier(.2,.8,.2,1) both; }
        .stat-anim { animation: riseIn 0.6s cubic-bezier(.22,1.1,.36,1) both; }
        .qa-anim { animation: riseInSoft 0.55s cubic-bezier(.2,.8,.2,1) both; }
        .item-anim { animation: riseIn 0.45s cubic-bezier(.2,.8,.2,1) both; }

        .attn-banner { position: relative; overflow: hidden; transition: box-shadow 0.3s ease, transform 0.3s ease; }
        .attn-banner:hover { box-shadow: 0 10px 26px rgba(217,119,6,0.14); }
        .attn-orb { animation: orbFloat 6s ease-in-out infinite; }

        .row-anim { transition: background 0.25s ease, transform 0.25s cubic-bezier(.2,.8,.2,1), box-shadow 0.25s ease; position: relative; border-radius: 14px; }
        .row-anim:hover { transform: translateX(5px) scale(1.005); box-shadow: 0 6px 16px rgba(20,19,43,0.06); }
        .row-anim:active { transform: translateX(3px) scale(0.995); }
        .row-icon { transition: transform 0.35s cubic-bezier(.34,1.56,.64,1); }
        .row-anim:hover .row-icon { transform: rotate(-8deg) scale(1.12); }

        .view-all { position: relative; transition: gap 0.25s cubic-bezier(.34,1.56,.64,1), color 0.2s ease; display: inline-flex; align-items: center; gap: 4px; cursor: pointer; }
        .view-all:hover { gap: 8px; color: #4E32D9 !important; }
        .view-all svg { transition: transform 0.25s ease; }
        .view-all:hover svg { transform: translateX(2px); }

        .review-btn { transition: transform 0.18s cubic-bezier(.34,1.56,.64,1), background 0.18s ease, box-shadow 0.18s ease; }
        .review-btn:hover { transform: translateY(-2px); background: #2A2850 !important; box-shadow: 0 8px 18px rgba(20,19,43,0.22); }
        .review-btn:active { transform: translateY(0) scale(0.97); }

        .attn-pulse { animation: pulseDot 1.4s ease infinite; }
        .deadline-row { transition: transform 0.25s cubic-bezier(.2,.8,.2,1), background 0.2s ease; border-radius: 10px; }
        .deadline-row:hover { transform: translateX(4px); background: rgba(109,74,255,0.04); }
        .activity-dot { width: 6px; height: 6px; border-radius: 50%; background: #6D4AFF; flex-shrink: 0; margin-top: 5px; transition: transform 0.2s cubic-bezier(.34,1.56,.64,1); }
        .item-anim:hover .activity-dot { transform: scale(1.6); }

        .credit-card { transition: box-shadow 0.3s ease; box-shadow: 0 6px 18px rgba(20,19,43,0.06); }
        .credit-card:hover { box-shadow: 0 22px 44px rgba(20,19,43,0.18); }
        .card-watermark { opacity: 0.07; transition: opacity 0.35s ease, filter 0.35s ease; }
        .credit-card:hover .card-watermark { opacity: 1; filter: drop-shadow(0 0 10px rgba(109,74,255,0.35)); }
        .card-shine { position: absolute; top: 0; left: -60%; width: 40%; height: 100%; background: linear-gradient(100deg, transparent, rgba(255,255,255,0.5), transparent); transform: skewX(-20deg); transition: left 0.75s ease; pointer-events: none; }
        .credit-card:hover .card-shine { left: 130%; }
        .card-ring { position: absolute; inset: 0; border-radius: 20px; border: 1.5px solid transparent; transition: border-color 0.3s ease; pointer-events: none; }
        .credit-card:hover .card-ring { border-color: rgba(255,255,255,0.5); }
        .card-chip { transition: transform 0.35s cubic-bezier(.34,1.56,.64,1); }
        .credit-card:hover .card-chip { transform: scale(1.15) rotate(-5deg); }
        .card-circle-1, .card-circle-2 { transition: transform 0.45s cubic-bezier(.34,1.56,.64,1); }
        .credit-card:hover .card-circle-1 { transform: translate(-5px, -5px) scale(1.1); }
        .credit-card:hover .card-circle-2 { transform: translate(5px, -5px) scale(1.1); }

        .quick-action { transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s ease, border-color 0.25s ease; cursor: pointer; }
        .quick-action:hover { transform: translateY(-5px); box-shadow: 0 16px 34px rgba(109,74,255,0.16); border-color: rgba(109,74,255,0.25) !important; }
        .quick-action:active { transform: translateY(-2px) scale(0.99); }
        .quick-action:hover .quick-action-icon { transform: scale(1.12) rotate(-5deg); background: rgba(109,74,255,0.18) !important; }
        .quick-action:hover .quick-action-link { gap: 8px; }
        .quick-action-icon { transition: transform 0.35s cubic-bezier(.34,1.56,.64,1), background 0.25s ease; }
        .quick-action-link { transition: gap 0.25s cubic-bezier(.34,1.56,.64,1); }

        .banner-icon-pop { animation: bannerPop 0.5s cubic-bezier(.34,1.56,.64,1) 0.15s both; }
        .status-badge { transition: transform 0.25s cubic-bezier(.34,1.56,.64,1); }
        .row-anim:hover .status-badge { transform: scale(1.1); }

        .empty-icon-ring { animation: ringPulse 1.8s cubic-bezier(.2,.8,.2,1) infinite; }
        .create-first-btn { transition: transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease; }
        .create-first-btn:hover { transform: translateY(-2px) scale(1.03); box-shadow: 0 10px 22px rgba(109,74,255,0.3); }
        .create-first-btn:active { transform: translateY(0) scale(0.97); }

        .modal-backdrop { transition: opacity 0.26s ease; }
        .modal-panel { transition: opacity 0.26s cubic-bezier(.22,1.1,.36,1), transform 0.26s cubic-bezier(.22,1.1,.36,1); }
      `}</style>

      <div className="head-anim" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 27, fontWeight: 700, color: "#14132B", letterSpacing: -0.5 }}>
            Organizer Hub, <span style={{ background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{userName}</span>
          </h1>
          {isVerified ? (
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 700, color: "#15803D", background: "rgba(22,163,74,0.1)", padding: "4px 10px", borderRadius: 20, animation: "fadeScaleIn 0.4s cubic-bezier(.34,1.56,.64,1) 0.2s both" }}>
              <Icon.check width={12} height={12} /> Verified
            </span>
          ) : (
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 700, color: "#B45309", background: "rgba(217,119,6,0.1)", padding: "4px 10px", borderRadius: 20, animation: "fadeScaleIn 0.4s cubic-bezier(.34,1.56,.64,1) 0.2s both" }}>
              Pending Verification
            </span>
          )}
        </div>
        {orgName && (
          <p style={{ color: "rgba(20,19,43,0.4)", fontSize: 12.5, marginBottom: 4, fontWeight: 600 }}>{orgName}</p>
        )}
        <p style={{ color: "rgba(20,19,43,0.5)", fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
          {stats.pendingReviews > 0 && (
            <span className="attn-pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "#F59E0B", display: "inline-block" }} />
          )}
          {stats.pendingReviews} submission{stats.pendingReviews !== 1 ? "s" : ""} pending review · {stats.activeEvents} event{stats.activeEvents !== 1 ? "s" : ""} live
        </p>
      </div>

      {/* Credit-card style stat cards */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <CreditStat
          icon={<Icon.flag width={15} height={15} />}
          label="Total Challenges"
          value={stats.totalChallenges}
          bg="linear-gradient(155deg,#F5F3FF,#EDE9FE)"
          accent="#6D4AFF"
          c1="#C4B5FD"
          c2="#8B5CF6"
          delay="0.04s"
          onClick={openModal}
        />
        <CreditStat
          icon={<Icon.clock width={15} height={15} />}
          label="Active Events"
          value={stats.activeEvents}
          bg="linear-gradient(155deg,#EFF6FF,#DBEAFE)"
          accent="#2563EB"
          c1="#93C5FD"
          c2="#3B82F6"
          delay="0.09s"
        />
        <CreditStat
          icon={<Icon.upload width={15} height={15} />}
          label="Submissions"
          value={stats.totalSubmissions}
          bg="linear-gradient(155deg,#FFFBEB,#FEF3C7)"
          accent="#D97706"
          c1="#FCD34D"
          c2="#F59E0B"
          delay="0.14s"
        />
        <CreditStat
          icon={<Icon.inbox width={15} height={15} />}
          label="Pending Reviews"
          value={stats.pendingReviews}
          bg="linear-gradient(155deg,#F0FDF4,#D1FAE5)"
          accent="#059669"
          c1="#6EE7B7"
          c2="#10B981"
          delay="0.19s"
        />
      </div>

      {/* Quick Actions */}
      <div className="head-anim" style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Create Challenge", sub: "Start something new", icon: <Icon.rocket width={22} height={22} />, path: "/dashboard/create" },
          { label: "Review Submissions", sub: "Score and give feedback", icon: <Icon.inbox width={22} height={22} />, path: "/dashboard/review" },
          { label: "Post Announcement", sub: "Notify participants", icon: <Icon.flag width={22} height={22} />, path: "/dashboard/announcements" },
        ].map((a, idx) => (
          <div
            key={a.label}
            className="quick-action qa-anim"
            onClick={() => router.push(a.path)}
            style={{ flex: 1, background: "#fff", border: "1px solid rgba(15,23,42,0.07)", borderRadius: 16, padding: "20px 22px", animationDelay: `${0.25 + idx * 0.08}s` }}
          >
            <div className="quick-action-icon" style={{ width: 46, height: 46, borderRadius: 12, background: "rgba(109,74,255,0.09)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6D4AFF", marginBottom: 14 }}>
              {a.icon}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#14132B", marginBottom: 3 }}>{a.label}</div>
            <div style={{ fontSize: 13, color: "rgba(20,19,43,0.45)", marginBottom: 10 }}>{a.sub}</div>
            <span className="quick-action-link" style={{ fontSize: 12.5, fontWeight: 700, color: "#6D4AFF", display: "inline-flex", alignItems: "center", gap: 4 }}>
              Get Started <Icon.arrow width={12} height={12} />
            </span>
          </div>
        ))}
      </div>

      <Collapse show={needsAttention.length > 0}>
        <div
          className="attn-banner"
          style={{
            marginBottom: 20,
            background: "linear-gradient(135deg, #FFF7E8 0%, #FFEFD1 100%)",
            border: "1px solid rgba(245,158,11,0.2)",
            borderRadius: 18,
            padding: "18px 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div className="attn-orb" style={{ position: "absolute", top: -30, right: 100, width: 100, height: 100, borderRadius: "50%", background: "rgba(245,158,11,0.15)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
            <div className="banner-icon-pop" style={{ width: 40, height: 40, borderRadius: 12, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#B45309", boxShadow: "0 6px 16px rgba(20,19,43,0.1)" }}>
              <Icon.inbox width={18} height={18} />
            </div>
            <div>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: "#14132B" }}>
                {needsAttention.length} challenge{needsAttention.length !== 1 ? "s" : ""} may need your attention
              </p>
              <p style={{ fontSize: 12, color: "rgba(20,19,43,0.5)" }}>Live or closed events with activity to review</p>
            </div>
          </div>
          <button
            onClick={() => router.push(firstPendingId ? `/dashboard/review?challenge=${firstPendingId}` : "/dashboard/review")}
            className="review-btn"
            style={{ background: "#14132B", color: "#fff", border: "none", borderRadius: 9, padding: "9px 16px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", position: "relative" }}
          >
            Review now
          </button>
        </div>
      </Collapse>

      <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
        <div style={{ flex: 2 }}>
          <ScrollReveal>
            <TiltCard intensity={2} glow="rgba(109,74,255,0.08)" style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.07)", padding: 22 }}>
              <div className="head-anim" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15.5, fontWeight: 700, color: "#14132B" }}>Your Challenges</h2>
                <span className="view-all" onClick={() => router.push("/dashboard/my-challenges")} style={{ fontSize: 12.5, color: "#6D4AFF", fontWeight: 600 }}>
                  View all <Icon.arrow width={13} height={13} />
                </span>
              </div>

              {challenges.length === 0 ? (
                <div className="item-anim" style={{ textAlign: "center", padding: "36px 0" }}>
                  <div className="empty-icon-ring" style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(109,74,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: "#6D4AFF" }}>
                    <Icon.flag width={20} height={20} />
                  </div>
                  <p style={{ color: "rgba(20,19,43,0.5)", fontSize: 14, marginBottom: 14 }}>You haven't created any challenges yet.</p>
                  <button
                    onClick={() => router.push("/dashboard/create")}
                    className="create-first-btn"
                    style={{ background: "#6D4AFF", color: "#fff", border: "none", borderRadius: 9, padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                  >
                    Create your first challenge
                  </button>
                </div>
              ) : (
                challenges.slice(0, 5).map((c, i) => {
                  const s = STATUS_STYLES[getEffectiveStatus(c)] || STATUS_STYLES.DRAFT;
                  const theme = getTheme(c.id);
                  return (
                    <div
                      key={c.id}
                      className="row-anim item-anim"
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "14px 10px", marginTop: i > 0 ? 6 : 0,
                        background: theme.bg,
                        animationDelay: `${i * 0.07}s`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div className="row-icon" style={{ width: 38, height: 38, borderRadius: 11, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: theme.accent, boxShadow: "0 4px 10px rgba(20,19,43,0.08)" }}>
                          <Icon.flag width={16} height={16} />
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#14132B" }}>{c.title}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                            <span style={{ fontSize: 12, color: "rgba(20,19,43,0.5)" }}>{new Date(c.deadline).toLocaleDateString()}</span>
                            <AvatarStack members={(c.participations || []).filter((p: any) => p && p.user).map((p: any) => ({ name: p.user.name, image: p.user.image }))} />
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span className="status-badge" style={{ fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 20, color: s.color, background: "#fff" }}>
                          {s.label}
                        </span>
                        <button
                          onClick={() => router.push(`/dashboard/review?challenge=${c.id}`)}
                          className="review-btn"
                          style={{ background: "#14132B", color: "#fff", border: "none", borderRadius: 8, padding: "7px 13px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                        >
                          Reviews
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </TiltCard>
          </ScrollReveal>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          <ScrollReveal delay={0.08}>
            <TiltCard intensity={4} glow="rgba(109,74,255,0.12)" style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.07)", padding: 20 }}>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "#14132B", marginBottom: 14 }}>Upcoming Deadlines</h2>
              {upcomingDeadlines.length === 0 ? (
                <p style={{ fontSize: 13, color: "rgba(20,19,43,0.4)" }}>No upcoming deadlines.</p>
              ) : (
                upcomingDeadlines.map((c, di) => {
                  const d = daysLeft(c.deadline);
                  return (
                    <div key={c.id} className="deadline-row item-anim" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 6px", animationDelay: `${di * 0.07}s` }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#14132B", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.title}
                      </span>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: d <= 1 ? "#B91C1C" : "#6D4AFF", background: d <= 1 ? "rgba(220,38,38,0.08)" : "rgba(109,74,255,0.08)", padding: "3px 9px", borderRadius: 20, transition: "transform 0.2s cubic-bezier(.34,1.56,.64,1)" }}>
                        {d === 0 ? "Today" : `${d}d left`}
                      </span>
                    </div>
                  );
                })
              )}
            </TiltCard>
          </ScrollReveal>

          <ScrollReveal delay={0.14}>
            <TiltCard intensity={4} glow="rgba(37,99,235,0.12)" style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.07)", padding: 20 }}>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "#14132B", marginBottom: 14 }}>Recent Activity</h2>
              {activity.length === 0 ? (
                <p style={{ fontSize: 13, color: "rgba(20,19,43,0.4)" }}>No recent activity.</p>
              ) : (
                activity.map((a, i) => (
                  <div key={i} className="item-anim" style={{ display: "flex", gap: 8, padding: "8px 0", borderTop: i > 0 ? "1px solid rgba(15,23,42,0.05)" : "none", animationDelay: `${i * 0.07}s` }}>
                    <div className="activity-dot" />
                    <p style={{ fontSize: 12.5, color: "rgba(20,19,43,0.6)", lineHeight: 1.5 }}>
                      <span style={{ color: "rgba(20,19,43,0.35)" }}>{a.time} — </span>
                      {a.text}
                    </p>
                  </div>
                ))
              )}
            </TiltCard>
          </ScrollReveal>
        </div>
      </div>

      {showAllChallenges && (
        <div
          className="modal-backdrop"
          style={{ opacity: modalVisible ? 1 : 0 }}
        >
          <div
            className="modal-panel"
            style={{
              opacity: modalVisible ? 1 : 0,
              transform: modalVisible ? "scale(1) translateY(0)" : "scale(0.96) translateY(8px)",
            }}
          >
            <AllChallengesModal challenges={challenges} onClose={closeModal} />
          </div>
        </div>
      )}
    </div>
  );
}