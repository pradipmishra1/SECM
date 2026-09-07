"use client";

import { useState, useRef, useEffect } from "react";
import TiltCard from "./TiltCard";
import { TypeBadge, StatusPill } from "./Badges";
import { Icon } from "./icons";

function challengeStatus(deadline: string, dbStatus?: string) {
  const isDbClosed = dbStatus === "CLOSED" || dbStatus === "COMPLETED";
  const diff = new Date(deadline).getTime() - Date.now();
  const days = Math.ceil(diff / 86400000);
  if (days < 0 || isDbClosed) return "Closed";
  if (days <= 1) return "Closing soon";
  return "Open";
}

function getTimeRemaining(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, total: 0 };
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return { days, hours, minutes, total: diff };
}

const Shimmer = () => (
  <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden", borderRadius: 18 }}>
    <div
      style={{
        position: "absolute",
        top: "-50%",
        left: "-50%",
        width: "200%",
        height: "200%",
        background: "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.06) 50%, transparent 70%)",
        animation: "shimmerSweep 4s ease-in-out infinite",
        transform: "rotate(25deg)",
      }}
    />
    <style>{`
      @keyframes shimmerSweep {
        0% { transform: rotate(25deg) translateX(-60%) translateY(-60%); }
        100% { transform: rotate(25deg) translateX(60%) translateY(60%); }
      }
    `}</style>
  </div>
);

const GlowOrb = ({ color = "rgba(109,74,255,0.08)" }) => (
  <div
    style={{
      position: "absolute",
      top: "-30%",
      right: "-20%",
      width: 160,
      height: 160,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${color}, transparent 70%)`,
      pointerEvents: "none",
      zIndex: 0,
      animation: "orbFloat 6s ease-in-out infinite",
    }}
  />
);

export default function ChallengeCard({
  challenge,
  onClick,
  isOrganizer = false,
  isJoined = false,
  isBookmarked = false,
  onToggleBookmark,
}: {
  challenge: any;
  onClick: () => void;
  isOrganizer?: boolean;
  isJoined?: boolean;
  isBookmarked?: boolean;
  onToggleBookmark?: (challengeId: string) => void;
}) {
 const status = challengeStatus(challenge.deadline, challenge.status);
  const isVerified = challenge.organizer?.isVerified;
  const isPastDeadline = new Date(challenge.deadline).getTime() < Date.now();
  const hasSubmitted = challenge.hasSubmitted;
  const missed = isPastDeadline && !hasSubmitted && challenge.hasOwnProperty("hasSubmitted");
  const [hover, setHover] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const cardRef = useRef<HTMLDivElement>(null);

  const timeLeft = getTimeRemaining(challenge.deadline);
  const progress = Math.min((timeLeft.total / (7 * 24 * 60 * 60 * 1000)) * 100, 100);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setMousePos({ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) });
    };
    const el = cardRef.current;
    if (!el) return;
    el.addEventListener("mousemove", handleMove);
    return () => el.removeEventListener("mousemove", handleMove);
  }, []);

  const spotlightX = mousePos.x * 100;
  const spotlightY = mousePos.y * 100;

  const statusColor = status === "Open" ? "#22C55E" : status === "Closing soon" ? "#F59E0B" : "#EF4444";

  const showWatermark = hasSubmitted || missed;
  const watermarkText = hasSubmitted ? "DONE" : "MISSED";
  const themeColor = hasSubmitted ? "#16A34A" : missed ? "#B91C1C" : null;
  const cardBg = hasSubmitted
    ? "rgba(240,253,244,0.55)"
    : missed
    ? "rgba(254,242,242,0.55)"
    : "rgba(255,255,255,0.85)";
  const cardBorder = hasSubmitted
    ? "1px solid rgba(22,163,74,0.15)"
    : missed
    ? "1px solid rgba(185,28,28,0.15)"
    : "1px solid rgba(255,255,255,0.5)";

  return (
    <div
      onClick={onClick}
      style={{ cursor: "pointer", height: "100%" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      ref={cardRef}
      className="challenge-card-wrapper"
    >
      <TiltCard
        intensity={3}
        glow="rgba(109,74,255,0.08)"
        style={{
          background: cardBg,
          backdropFilter: "blur(16px) saturate(1.4)",
          WebkitBackdropFilter: "blur(16px) saturate(1.4)",
          borderRadius: 22,
          border: cardBorder,
          padding: 24,
          position: "relative",
          overflow: "hidden",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          transition: "transform 0.35s cubic-bezier(.34,1.56,.64,1), box-shadow 0.4s ease",
          boxShadow: hover
            ? "0 14px 32px rgba(109,74,255,0.10), 0 4px 12px rgba(109,74,255,0.05), inset 0 1px 0 rgba(255,255,255,0.5)"
            : "0 2px 10px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.4)",
          transform: hover ? "translateY(-3px)" : "translateY(0)",
        }}
      >
        <style>{`
          @keyframes orbFloat {
            0%,100% { transform: translate(0,0) scale(1); }
            33% { transform: translate(8px,-12px) scale(1.04); }
            66% { transform: translate(-6px,10px) scale(0.96); }
          }
          @keyframes progressGlow {
            0%,100% { opacity:0.4; }
            50% { opacity:0.8; }
          }
          .challenge-card-wrapper { transition: all 0.3s cubic-bezier(.34,1.56,.64,1); }
          .badge-enter { animation: badgeSlide 0.4s cubic-bezier(.34,1.56,.64,1) both; }
          @keyframes badgeSlide {
            0% { opacity:0; transform: translateY(-8px) scale(0.92); }
            100% { opacity:1; transform: translateY(0) scale(1); }
          }
          .title-gradient {
            background: linear-gradient(135deg, #14132B 0%, #3B2E7A 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .title-gradient:hover {
            background: linear-gradient(135deg, #6D4AFF 0%, #8B5CF6 50%, #A78BFA 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .deadline-text { transition: color 0.3s ease; }
          .review-link { transition: gap 0.15s ease, color 0.15s ease; display: inline-flex; align-items: center; gap: 3px; }
          .review-link:hover { gap: 6px; color: #4C2FCC !important; }
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-12deg) scale(1.15);
            font-family: 'Sora', sans-serif;
            font-size: 60px;
            font-weight: 900;
            letter-spacing: 0.06em;
            color: var(--wm-color);
            opacity: 0.05;
            white-space: nowrap;
            pointer-events: none;
            z-index: 0;
            user-select: none;
          }
        `}</style>

        <GlowOrb color="rgba(109,74,255,0.06)" />

        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            background: `radial-gradient(circle at ${spotlightX}% ${spotlightY}%, rgba(255,255,255,0.15) 0%, transparent 55%)`,
            transition: "background 0.1s ease-out",
            borderRadius: 22,
            opacity: hover ? 1 : 0,
          }}
        />

       <Shimmer />

        {showWatermark && (
          <div className="watermark" style={{ "--wm-color": themeColor } as React.CSSProperties}>
            {watermarkText}
          </div>
        )}

        <div style={{ position: "relative", zIndex: 3, display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <div className="badge-enter" style={{ animationDelay: "0.05s" }}>
                <TypeBadge type={challenge.type} />
              </div>
              {isJoined && !isOrganizer && (
                <span className="badge-enter" style={{ animationDelay: "0.08s", fontSize: 10, fontWeight: 700, color: "#15803D", background: "rgba(22,163,74,0.1)", padding: "3px 8px", borderRadius: 20 }}>
                  ✓ Joined
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {!isOrganizer && onToggleBookmark && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleBookmark(challenge.id);
                  }}
                  style={{
                    background: "none", border: "none", cursor: "pointer", padding: 0,
                    fontSize: 17, lineHeight: 1, opacity: isBookmarked ? 1 : 0.35,
                    filter: isBookmarked ? "none" : "grayscale(1)",
                  }}
                  title={isBookmarked ? "Remove bookmark" : "Bookmark this challenge"}
                >
                  🔖
                </button>
              )}
              <div className="badge-enter" style={{ animationDelay: "0.1s" }}>
                <StatusPill status={status} />
              </div>
            </div>
          </div>

          <h3
            className="title-gradient"
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: 16.5,
              fontWeight: 700,
              marginBottom: 8,
              lineHeight: 1.3,
              letterSpacing: "-0.01em",
              minHeight: 43,
            }}
          >
            {challenge.title}
          </h3>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, padding: "4px 0" }}>
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                color: "#fff",
                fontWeight: 700,
                flexShrink: 0,
                boxShadow: "0 2px 8px rgba(109,74,255,0.25)",
              }}
            >
              {(challenge.organizer?.orgName || "O")[0].toUpperCase()}
            </div>
            <span className="deadline-text" style={{ fontSize: 13, color: "rgba(20,19,43,0.55)", fontWeight: 500 }}>
              {challenge.organizer?.orgName || "Organizer"}
            </span>
            {isVerified && (
              <span
                title="Verified Organizer"
                style={{ color: "#2563EB", display: "inline-flex", background: "rgba(37,99,235,0.08)", borderRadius: "50%", padding: 2 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l2.4 2.2 3.2-.6.8 3.2 3 1.5-1.2 3.1 1.2 3.1-3 1.5-.8 3.2-3.2-.6L12 22l-2.4-2.2-3.2.6-.8-3.2-3-1.5 1.2-3.1L2.6 9.5l3-1.5.8-3.2 3.2.6L12 2z" />
                  <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            )}
          </div>

          <div style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px solid rgba(15,23,42,0.06)", display: "flex", flexDirection: "column", gap: 10 }}>
            {!isPastDeadline && (
              <div style={{ width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 11,
                    color: "rgba(20,19,43,0.4)",
                    fontWeight: 500,
                    marginBottom: 4,
                    fontFamily: "'Sora', sans-serif",
                  }}
                >
                  <span>Time remaining</span>
                  <span style={{ color: statusColor, fontWeight: 600 }}>
                    {timeLeft.days > 0 && `${timeLeft.days}d `}
                    {timeLeft.hours > 0 && `${timeLeft.hours}h `}
                    {timeLeft.days === 0 && timeLeft.hours === 0 && `${timeLeft.minutes}m`}
                  </span>
                </div>
                <div style={{ width: "100%", height: 4, borderRadius: 4, background: "rgba(15,23,42,0.06)", overflow: "hidden", position: "relative" }}>
                  <div
                    style={{
                      width: `${Math.max(5, 100 - progress)}%`,
                      height: "100%",
                      borderRadius: 4,
                      background: `linear-gradient(90deg, ${statusColor}, ${statusColor}88)`,
                      transition: "width 0.6s cubic-bezier(.34,1.56,.64,1)",
                      boxShadow: `0 0 8px ${statusColor}33`,
                      animation: "progressGlow 2s ease-in-out infinite",
                    }}
                  />
                </div>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span
                className="deadline-text"
                style={{ fontSize: 12, color: "rgba(20,19,43,0.4)", display: "flex", alignItems: "center", gap: 5, fontWeight: 450 }}
              >
                <Icon.clock width={13} height={13} />
                {new Date(challenge.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
              {challenge.prize && (
                <span
                  className="badge-enter"
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: "#D97706",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    background: "rgba(217,119,6,0.06)",
                    padding: "4px 12px",
                    borderRadius: 20,
                    border: "1px solid rgba(217,119,6,0.10)",
                    animationDelay: "0.2s",
                  }}
                >
                  <Icon.trophy width={13} height={13} />
                  {challenge.prize}
                </span>
              )}
            </div>

            {isOrganizer && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid rgba(15,23,42,0.05)" }}>
                <div style={{ display: "flex", gap: 12 }}>
                  <span style={{ fontSize: 11.5, color: "rgba(20,19,43,0.45)", display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
                    <Icon.upload width={12} height={12} />
                    {challenge._count?.submissions || 0} submission{(challenge._count?.submissions || 0) !== 1 ? "s" : ""}
                  </span>
                  <span style={{ fontSize: 11.5, color: "rgba(20,19,43,0.45)", display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
                    <Icon.users width={12} height={12} />
                    {challenge._count?.participations || 0}
                  </span>
                </div>
                <a href={`/dashboard/review?challenge=${challenge.id}`} onClick={(e) => e.stopPropagation()} className="review-link" style={{ fontSize: 11.5, color: "#6D4AFF", fontWeight: 700, textDecoration: "none" }}>Review <Icon.arrow width={11} height={11} /></a>
              </div>
            )}
          </div>
        </div>
      </TiltCard>
    </div>
  );
}