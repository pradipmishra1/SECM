export default function DashboardLoading() {
  const shimmer = {
    background: "linear-gradient(90deg, rgba(20,19,43,0.06) 25%, rgba(20,19,43,0.1) 37%, rgba(20,19,43,0.06) 63%)",
    backgroundSize: "400% 100%",
    animation: "shimmerMove 1.4s ease-in-out infinite",
    borderRadius: 10,
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F6F5FB" }}>
      <style>{`
        @keyframes shimmerMove {
          0% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* Sidebar shell */}
      <div style={{ width: 248, background: "#fff", borderRight: "1px solid rgba(15,23,42,0.06)", padding: "24px 16px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div style={{ ...shimmer, width: 32, height: 32, borderRadius: 8 }} />
          <div style={{ ...shimmer, width: 70, height: 16 }} />
        </div>
        {[0, 1, 2].map((g) => (
          <div key={g} style={{ marginBottom: 22 }}>
            <div style={{ ...shimmer, width: 60, height: 9, marginBottom: 10 }} />
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ ...shimmer, height: 32, width: "100%", marginBottom: 5, borderRadius: 10 }} />
            ))}
          </div>
        ))}
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header shell */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 36px", borderBottom: "1px solid rgba(15,23,42,0.07)", background: "#fff" }}>
          <div style={{ ...shimmer, width: 360, height: 38, borderRadius: 10 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ ...shimmer, width: 38, height: 38, borderRadius: 10 }} />
            <div style={{ ...shimmer, width: 32, height: 32, borderRadius: "50%" }} />
          </div>
        </div>

        {/* Main content shell */}
        <div style={{ flex: 1, padding: 36, maxWidth: 1200 }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ ...shimmer, height: 32, width: 260, marginBottom: 10 }} />
            <div style={{ ...shimmer, height: 14, width: 380 }} />
          </div>

          <div style={{ display: "flex", gap: 14, marginBottom: 22 }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ flex: 1, background: "#fff", border: "1px solid rgba(15,23,42,0.07)", borderRadius: 16, padding: "18px 16px" }}>
                <div style={{ ...shimmer, width: 34, height: 34, borderRadius: 10, marginBottom: 12 }} />
                <div style={{ ...shimmer, height: 20, width: "60%", marginBottom: 8 }} />
                <div style={{ ...shimmer, height: 11, width: "80%" }} />
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 20 }}>
            <div style={{ flex: 2, background: "#fff", border: "1px solid rgba(15,23,42,0.07)", borderRadius: 20, padding: 26 }}>
              <div style={{ ...shimmer, height: 18, width: 160, marginBottom: 20 }} />
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 8px", borderTop: i > 0 ? "1px solid rgba(15,23,42,0.05)" : "none" }}>
                  <div style={{ ...shimmer, width: 38, height: 38, borderRadius: 10, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ ...shimmer, height: 13, width: "55%", marginBottom: 8 }} />
                    <div style={{ ...shimmer, height: 10, width: "35%" }} />
                  </div>
                  <div style={{ ...shimmer, height: 20, width: 56, borderRadius: 20, flexShrink: 0 }} />
                </div>
              ))}
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
              {[0, 1].map((i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid rgba(15,23,42,0.07)", borderRadius: 18, padding: 20 }}>
                  <div style={{ ...shimmer, height: 15, width: 120, marginBottom: 14 }} />
                  {[0, 1, 2].map((j) => (
                    <div key={j} style={{ display: "flex", justifyContent: "space-between", padding: "8px 4px" }}>
                      <div style={{ ...shimmer, height: 12, width: 90 }} />
                      <div style={{ ...shimmer, height: 12, width: 36 }} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}