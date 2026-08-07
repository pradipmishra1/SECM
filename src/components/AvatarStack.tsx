const COLORS = ["#6D4AFF", "#EC4899", "#F59E0B", "#10B981", "#3B82F6", "#EF4444"];

export default function AvatarStack({ count, max = 4 }: { count: number; max?: number }) {
  const shown = Math.min(count, max);
  const extra = count - shown;

  if (count === 0) {
    return <span style={{ fontSize: 12, color: "rgba(20,19,43,0.35)" }}>No members yet</span>;
  }

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {Array.from({ length: shown }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: COLORS[i % COLORS.length],
            border: "2px solid #fff",
            marginLeft: i === 0 ? 0 : -8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            fontFamily: "'Sora', sans-serif",
          }}
        >
          {String.fromCharCode(65 + i)}
        </div>
      ))}
      {extra > 0 && (
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: "rgba(20,19,43,0.08)",
            border: "2px solid #fff",
            marginLeft: -8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(20,19,43,0.5)",
            fontSize: 9,
            fontWeight: 700,
          }}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}