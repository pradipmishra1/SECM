const COLORS = [
  "#7C3AED", "#F43F5E", "#FB923C", "#22C55E",
  "#2563EB", "#E11D48", "#A855F7", "#06B6D4",
  "#F59E0B", "#10B981", "#EC4899", "#6366F1",
];

function getInitial(name: string) {
  return name?.trim()?.[0]?.toUpperCase() || "?";
}

type Member = { name: string; image?: string | null };

export default function AvatarStack({
  members = [],
  max = 4,
}: {
  members: Member[];
  max?: number;
}) {
  const count = members.length;
  const shown = members.slice(0, max);
  const extra = count - shown.length;

  if (count === 0) {
    return <span style={{ fontSize: 12, color: "rgba(20,19,43,0.35)" }}>No members yet</span>;
  }

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {shown.map((m, i) =>
        m.image ? (
          <img
            key={i}
            src={m.image}
            alt={m.name}
            title={m.name}
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              border: "2px solid #fff",
              marginLeft: i === 0 ? 0 : -8,
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <div
            key={i}
            title={m.name}
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
            {getInitial(m.name)}
          </div>
        )
      )}
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