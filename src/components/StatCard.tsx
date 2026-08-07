"use client";

import { useEffect, useRef, useState } from "react";

export default function StatCard({
  label,
  value,
  icon,
  subtext,
  tone = "violet",
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  subtext?: string;
  tone?: "violet" | "amber" | "green" | "blue";
}) {
  const themes = {
    violet: { grad: "linear-gradient(155deg,#EDE9FE,#F5F3FF)", accent: "#6D4AFF", text: "#4C2FCC", glow: "rgba(109,74,255,0.3)" },
    amber: { grad: "linear-gradient(155deg,#FEF3C7,#FFFBEB)", accent: "#D97706", text: "#92400E", glow: "rgba(217,119,6,0.3)" },
    green: { grad: "linear-gradient(155deg,#DCFCE7,#F0FDF4)", accent: "#16A34A", text: "#166534", glow: "rgba(22,163,74,0.3)" },
    blue: { grad: "linear-gradient(155deg,#DBEAFE,#EFF6FF)", accent: "#2563EB", text: "#1E40AF", glow: "rgba(37,99,235,0.3)" },
  }[tone];

  const numeric = typeof value === "number" ? value : parseInt(String(value)) || 0;
  const [displayVal, setDisplayVal] = useState(0);
  const started = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, px: 50, py: 50, active: false });

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const duration = 700;
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayVal(Math.round(eased * numeric));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [numeric]);

  function handleMove(e: React.MouseEvent) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    const ry = (px - 50) / 50 * 8; // rotateY
    const rx = -(py - 50) / 50 * 8; // rotateX
    setTilt({ rx, ry, px, py, active: true });
  }

  function handleLeave() {
    setTilt({ rx: 0, ry: 0, px: 50, py: 50, active: false });
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        perspective: 800,
      }}
    >
      <div
        style={{
          background: themes.grad,
          borderRadius: 18,
          border: "1px solid rgba(15,23,42,0.05)",
          padding: "20px 22px",
          position: "relative",
          overflow: "hidden",
          cursor: "default",
          transformStyle: "preserve-3d",
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(${tilt.active ? 12 : 0}px) scale(${tilt.active ? 1.02 : 1})`,
          transition: tilt.active ? "transform 0.08s linear, box-shadow 0.3s ease" : "transform 0.5s cubic-bezier(.2,.8,.2,1), box-shadow 0.5s ease",
          boxShadow: tilt.active
            ? `${-tilt.ry * 1.2}px ${18 - tilt.rx}px 34px ${themes.glow}, 0 2px 6px rgba(15,23,42,0.04)`
            : "0 1px 3px rgba(15,23,42,0.03)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at ${tilt.px}% ${tilt.py}%, rgba(255,255,255,0.55), transparent 55%)`,
            opacity: tilt.active ? 1 : 0,
            transition: "opacity 0.3s ease",
            pointerEvents: "none",
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22, position: "relative" }}>
          <span style={{ fontSize: 12.5, color: themes.text, fontWeight: 600, opacity: 0.75 }}>{label}</span>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: "rgba(255,255,255,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: themes.accent,
              transition: "transform 0.4s cubic-bezier(.34,1.56,.64,1)",
              transform: tilt.active ? "translateZ(20px) rotate(-8deg) scale(1.15)" : "translateZ(0) rotate(0) scale(1)",
            }}
          >
            {icon}
          </div>
        </div>
       <div
          style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: 34,
            fontWeight: 700,
            color: themes.text,
            marginBottom: 4,
            letterSpacing: -1,
            position: "relative",
            fontVariantNumeric: "tabular-nums",
            transform: tilt.active ? "translateZ(14px)" : "translateZ(0)",
            transition: "transform 0.3s ease",
          }}
        >
          {displayVal}
        </div>
        {subtext && (
          <div style={{ fontSize: 12, color: themes.text, opacity: 0.6, fontWeight: 500, position: "relative" }}>
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
}