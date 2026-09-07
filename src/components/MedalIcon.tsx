const MEDAL_THEME: Record<number, { light: string; mid: string; dark: string; ribbon1: string; ribbon2: string }> = {
  1: { light: "#FFE9A8", mid: "#F5C453", dark: "#B8860B", ribbon1: "#7C1D1D", ribbon2: "#A82A2A" },
  2: { light: "#F1F3F5", mid: "#C5CBD3", dark: "#8A929C", ribbon1: "#1E3A5F", ribbon2: "#2C5282" },
  3: { light: "#F0B27A", mid: "#CD7F32", dark: "#8B4513", ribbon1: "#1B4332", ribbon2: "#2D6A4F" },
};

export default function MedalIcon({ position, size = 48 }: { position: 1 | 2 | 3; size?: number }) {
  const t = MEDAL_THEME[position];
  const uid = `medal-${position}-${size}`;

  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 100 125" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${uid}-ribbon`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={t.ribbon2} />
          <stop offset="100%" stopColor={t.ribbon1} />
        </linearGradient>
        <radialGradient id={`${uid}-disc`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor={t.light} />
          <stop offset="55%" stopColor={t.mid} />
          <stop offset="100%" stopColor={t.dark} />
        </radialGradient>
        <linearGradient id={`${uid}-rim`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={t.light} />
          <stop offset="100%" stopColor={t.dark} />
        </linearGradient>
      </defs>

      {/* Ribbon tails */}
      <path d="M35 5 L45 55 L30 55 Z" fill={`url(#${uid}-ribbon)`} />
      <path d="M65 5 L70 55 L55 55 Z" fill={`url(#${uid}-ribbon)`} opacity="0.85" />

      {/* Outer rim */}
      <circle cx="50" cy="78" r="35" fill={`url(#${uid}-rim)`} />
      {/* Main disc */}
      <circle cx="50" cy="78" r="30" fill={`url(#${uid}-disc)`} />
      {/* Inner ring detail */}
      <circle cx="50" cy="78" r="24" fill="none" stroke={t.dark} strokeWidth="1" opacity="0.4" />

      {/* Star emboss */}
      <path
        d="M50 65 L53.5 73.5 L62.5 74.2 L55.7 80 L57.8 88.8 L50 84 L42.2 88.8 L44.3 80 L37.5 74.2 L46.5 73.5 Z"
        fill={t.dark}
        opacity="0.35"
      />
      <path
        d="M50 64 L53.5 72.5 L62.5 73.2 L55.7 79 L57.8 87.8 L50 83 L42.2 87.8 L44.3 79 L37.5 73.2 L46.5 72.5 Z"
        fill={t.light}
      />

      {/* Shine highlight */}
      <ellipse cx="40" cy="65" rx="10" ry="6" fill="#fff" opacity="0.45" transform="rotate(-25 40 65)" />
    </svg>
  );
}