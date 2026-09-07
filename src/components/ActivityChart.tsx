"use client";

import { useState } from "react";

export default function ActivityChart({
  data,
}: {
  data: { label: string; count: number }[];
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const total = data.reduce((sum, d) => sum + d.count, 0);
  const half = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, half).reduce((sum, d) => sum + d.count, 0);
  const secondHalf = data.slice(half).reduce((sum, d) => sum + d.count, 0);
  const change = firstHalf > 0 ? Math.round(((secondHalf - firstHalf) / firstHalf) * 100) : secondHalf > 0 ? 100 : 0;

  const width = 600;
  const height = 180;
  const padding = 32;
  const max = Math.max(...data.map((d) => d.count), 4);
  const yTicks = 4;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - (d.count / max) * (height - padding * 2);
    return { x, y, ...d };
  });

  // Smooth curve using cubic bezier between points
  function smoothPath(pts: typeof points) {
    if (pts.length < 2) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  }

  const linePath = smoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  const active = hoverIdx !== null ? points[hoverIdx] : null;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
        <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 32, fontWeight: 700, color: "#14132B", letterSpacing: -1 }}>
          {total}
        </span>
        {change !== 0 && (
          <span
            style={{
              fontSize: 11.5,
              fontWeight: 700,
              padding: "2px 9px",
              borderRadius: 20,
              color: change > 0 ? "#15803D" : "#B91C1C",
              background: change > 0 ? "rgba(22,163,74,0.1)" : "rgba(220,38,38,0.08)",
              display: "inline-flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            {change > 0 ? "↗" : "↘"} {Math.abs(change)}%
          </span>
        )}
      </div>
      <div style={{ fontSize: 12, color: "rgba(20,19,43,0.45)", marginBottom: 16 }}>
        submissions over the last 6 weeks
      </div>

      <div style={{ display: "flex" }}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} style={{ overflow: "visible" }}>
          <defs>
            <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6D4AFF" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#6D4AFF" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {Array.from({ length: yTicks + 1 }).map((_, i) => {
            const y = padding + (i * (height - padding * 2)) / yTicks;
            const val = Math.round(max - (i * max) / yTicks);
            return (
              <g key={i}>
                <line x1={padding} x2={width - padding} y1={y} y2={y} stroke="rgba(15,23,42,0.06)" strokeDasharray="4 4" />
                <text x={padding - 10} y={y + 3} textAnchor="end" fontSize="10" fill="rgba(20,19,43,0.35)" fontFamily="Inter, sans-serif">
                  {val}
                </text>
              </g>
            );
          })}

          <path d={areaPath} fill="url(#activityFill)" />
          <path d={linePath} fill="none" stroke="#6D4AFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {active && (
            <line x1={active.x} x2={active.x} y1={padding} y2={height - padding} stroke="rgba(109,74,255,0.25)" strokeWidth="1" />
          )}

          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoverIdx === i ? 5.5 : 3.5}
                fill="#fff"
                stroke="#6D4AFF"
                strokeWidth="2.2"
                style={{ transition: "r 0.15s ease" }}
              />
              <rect
                x={p.x - (width - padding * 2) / data.length / 2}
                y={0}
                width={(width - padding * 2) / data.length}
                height={height}
                fill="transparent"
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
                style={{ cursor: "pointer" }}
              />
            </g>
          ))}

          {active && (
            <g transform={`translate(${Math.min(Math.max(active.x - 48, padding - 10), width - 96)}, ${Math.max(active.y - 42, 0)})`}>
              <rect x={0} y={0} width={96} height={32} rx={8} fill="#14132B" />
              <text x={48} y={13} textAnchor="middle" fontSize="9.5" fill="rgba(255,255,255,0.6)" fontFamily="Inter, sans-serif">
                {active.label}
              </text>
              <text x={48} y={25} textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#fff" fontFamily="Inter, sans-serif">
                {active.count} submission{active.count !== 1 ? "s" : ""}
              </text>
            </g>
          )}

          {points.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={height - 4}
              textAnchor="middle"
              fontSize="10"
              fontWeight="600"
              fill="rgba(20,19,43,0.4)"
              fontFamily="Inter, sans-serif"
            >
              {p.label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}