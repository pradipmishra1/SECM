"use client";

import { useRef, useState } from "react";

export default function TiltCard({
  children,
  style,
  className,
  intensity = 5,
  glow = "rgba(109,74,255,0.15)",
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  intensity?: number;
  glow?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, px: 50, py: 50, active: false });

  function handleMove(e: React.MouseEvent) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    const ry = ((px - 50) / 50) * intensity;
    const rx = -((py - 50) / 50) * intensity;
    setTilt({ rx, ry, px, py, active: true });
  }

  function handleLeave() {
    setTilt({ rx: 0, ry: 0, px: 50, py: 50, active: false });
  }

  return (
    <div ref={cardRef} onMouseMove={handleMove} onMouseLeave={handleLeave} style={{ perspective: 900 }} className={className}>
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          transformStyle: "preserve-3d",
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(${tilt.active ? 6 : 0}px)`,
          transition: tilt.active ? "transform 0.08s linear, box-shadow 0.3s ease" : "transform 0.5s cubic-bezier(.2,.8,.2,1), box-shadow 0.5s ease",
          boxShadow: tilt.active ? `${-tilt.ry * 1.2}px ${14 - tilt.rx}px 30px ${glow}` : "0 1px 3px rgba(15,23,42,0.03)",
          ...style,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at ${tilt.px}% ${tilt.py}%, rgba(255,255,255,0.5), transparent 55%)`,
            opacity: tilt.active ? 1 : 0,
            transition: "opacity 0.3s ease",
            pointerEvents: "none",
          }}
        />
        {children}
      </div>
    </div>
  );
}