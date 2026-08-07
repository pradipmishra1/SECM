export function TypeBadge({ type }: { type: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    HACKATHON: { bg: "#EDE4FF", color: "#7C3AED", label: "Hackathon" },
    CODING_CONTEST: { bg: "#DBEAFE", color: "#2563EB", label: "Coding" },
    DESIGN_CHALLENGE: { bg: "#FFE4D6", color: "#C2410C", label: "Design" },
    IDEA_PITCHING: { bg: "#D1FAE5", color: "#047857", label: "Idea Pitch" },
  };
  const s = map[type] || map.HACKATHON;
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 11.5, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>
      {s.label}
    </span>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Open: { bg: "#DCFCE7", color: "#15803D" },
    "Closing soon": { bg: "#FEF3C7", color: "#B45309" },
    Closed: { bg: "#FEE2E2", color: "#B91C1C" },
    "In Progress": { bg: "#DBEAFE", color: "#2563EB" },
    Review: { bg: "#EDE4FF", color: "#7C3AED" },
    New: { bg: "#DCFCE7", color: "#15803D" },
  };
  const s = map[status] || { bg: "#F1F5F9", color: "#64748B" };
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 20 }}>
      {status}
    </span>
  );
}