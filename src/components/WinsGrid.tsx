"use client";

import TiltCard from "./TiltCard";

const MEDAL: Record<number, { emoji: string; color: string; label: string; grad: string; ring: string }> = {
  1: { emoji: "🥇", color: "#D4A017", label: "1st Place", grad: "linear-gradient(160deg,#3A2E0A,#5C4712)", ring: "rgba(212,160,23,0.6)" },
  2: { emoji: "🥈", color: "#9CA3AF", label: "2nd Place", grad: "linear-gradient(160deg,#2A2E33,#3F454D)", ring: "rgba(156,163,175,0.5)" },
  3: { emoji: "🥉", color: "#B45309", label: "3rd Place", grad: "linear-gradient(160deg,#3A2410,#5C3A1B)", ring: "rgba(180,83,9,0.5)" },
};

export default function WinsGrid({ wins }: { wins: any[] }) {
  const counts = { 1: 0, 2: 0, 3: 0 };
  wins.forEach((w) => {
    if (w.position === 1) counts[1]++;
    else if (w.position === 2) counts[2]++;
    else counts[3]++;
  });

  const firstPlaceWins = wins.filter((w) => w.position === 1);
  const otherWins = wins.filter((w) => w.position !== 1);

  return (
    <div>
      <style>{`
        @keyframes winsHeroIn { from { opacity:0; transform: translateY(-10px); } to { opacity:1; transform: translateY(0); } }
        @keyframes winCardIn { from { opacity:0; transform: translateY(14px) scale(0.96); } to { opacity:1; transform: translateY(0) scale(1); } }
        @keyframes orbFloatA { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-14px,10px) scale(1.06); } }
        @keyframes orbFloatB { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(12px,-8px) scale(0.94); } }
        @keyframes trophyBounce { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-4px) rotate(-6deg); } }
        @keyframes goldShine { 0% { transform: translateX(-120%) rotate(20deg); } 100% { transform: translateX(220%) rotate(20deg); } }
        @keyframes ribbonWave { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(-2deg); } }
        @keyframes medalGlow { 0%,100% { filter: drop-shadow(0 0 4px var(--gc)); } 50% { filter: drop-shadow(0 0 12px var(--gc)); } }
        .wins-hero { animation: winsHeroIn 0.5s cubic-bezier(.2,.8,.2,1) both; }
        .win-card-anim { animation: winCardIn 0.45s cubic-bezier(.2,.8,.2,1) both; }
        .orb-a { animation: orbFloatA 7s ease-in-out infinite; }
        .orb-b { animation: orbFloatB 6s ease-in-out infinite; }
        .trophy-icon { animation: trophyBounce 2.4s ease-in-out infinite; display: inline-block; }
        .gold-shine { position: absolute; top: -20%; left: 0; width: 40px; height: 160%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent); animation: goldShine 3.5s ease-in-out infinite; pointer-events: none; }
        .gold-ribbon { animation: ribbonWave 3s ease-in-out infinite; transform-origin: top right; }
        .gold-medal-emoji { animation: medalGlow 2s ease-in-out infinite; }
      `}</style>

      <div
        className="wins-hero"
        style={{
          background: "linear-gradient(120deg,#D4A017 0%,#F5C453 50%,#FDE68A 100%)",
          borderRadius: 20,
          padding: "26px 28px",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 20,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="orb-a" style={{ position: "absolute", top: -30, right: 40, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,0.18)" }} />
        <div className="orb-b" style={{ position: "absolute", bottom: -20, right: 160, width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.12)" }} />

        <span className="trophy-icon" style={{ fontSize: 42, position: "relative" }}>🏆</span>
        <div style={{ position: "relative" }}>
          <p style={{ fontSize: 13, color: "rgba(60,40,0,0.7)", fontWeight: 700 }}>Total Victories</p>
          <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 30, fontWeight: 800, color: "#3A2A00" }}>{wins.length} Total Wins</p>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 10, position: "relative" }}>
          {[1, 2, 3].map((pos) => (
            <div key={pos} style={{ background: "rgba(255,255,255,0.35)", borderRadius: 14, padding: "10px 16px", textAlign: "center", minWidth: 64 }}>
              <div style={{ fontSize: 18 }}>{MEDAL[pos].emoji}</div>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: "#3A2A00" }}>{counts[pos as 1 | 2 | 3]}</div>
            </div>
          ))}
        </div>
      </div>

      {wins.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.07)", padding: 50, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.25 }}>🏆</div>
          <p style={{ color: "rgba(20,19,43,0.4)", fontSize: 14 }}>No wins yet — keep participating!</p>
        </div>
      ) : (
        <>
          {/* Featured 1st place wins — bigger, shine effect, ribbon */}
          {firstPlaceWins.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 18, marginBottom: 20 }}>
              {firstPlaceWins.map((w, i) => (
                <div key={w.id} className="win-card-anim" style={{ animationDelay: `${i * 0.06}s` }}>
                  <TiltCard
                    intensity={7}
                    glow="rgba(212,160,23,0.6)"
                    style={{
                      background: "linear-gradient(155deg,#4A3A0D 0%,#6B5316 50%,#4A3A0D 100%)",
                      borderRadius: 20,
                      border: "1.5px solid rgba(255,215,120,0.35)",
                      padding: 26,
                      position: "relative",
                      overflow: "hidden",
                      boxShadow: "0 12px 32px rgba(212,160,23,0.25)",
                    }}
                  >
                    <div className="gold-shine" />
                    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 15% 0%, rgba(255,215,120,0.3), transparent 65%)", pointerEvents: "none" }} />
                    <div
                      className="gold-ribbon"
                      style={{
                        position: "absolute",
                        top: 14,
                        right: -34,
                        background: "linear-gradient(135deg,#D4A017,#F5C453)",
                        color: "#3A2A00",
                        fontSize: 10.5,
                        fontWeight: 800,
                        padding: "5px 40px",
                        transform: "rotate(35deg)",
                        letterSpacing: 0.5,
                        boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
                      }}
                    >
                      CHAMPION
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, position: "relative" }}>
                      <span className="gold-medal-emoji" style={{ fontSize: 44, ["--gc" as any]: "#D4A017" }}>🥇</span>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 800, color: "#D4A017", letterSpacing: 1, textTransform: "uppercase" }}>1st Place Winner</p>
                        <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.5)" }}>{new Date(w.announcedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 19, fontWeight: 800, color: "#FDE68A", lineHeight: 1.3, marginBottom: 14, position: "relative" }}>
                      {w.challenge.title}
                    </h3>
                    {w.challenge.prize && (
                      <div style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,215,120,0.15)", border: "1px solid rgba(255,215,120,0.3)", borderRadius: 20, padding: "6px 14px" }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: "#FDE68A" }}>🏆 {w.challenge.prize}</span>
                      </div>
                    )}
                  </TiltCard>
                </div>
              ))}
            </div>
          )}

          {/* 2nd/3rd place — standard grid */}
          {otherWins.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 16 }}>
              {otherWins.map((w, i) => {
                const m = MEDAL[w.position] || MEDAL[3];
                return (
                  <div key={w.id} className="win-card-anim" style={{ animationDelay: `${i * 0.06}s` }}>
                    <TiltCard
                      intensity={5}
                      glow={`${m.color}55`}
                      style={{
                        background: m.grad,
                        borderRadius: 18,
                        border: "1px solid rgba(255,215,120,0.15)",
                        padding: 20,
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 20% 0%, ${m.color}25, transparent 60%)`, pointerEvents: "none" }} />
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, position: "relative" }}>
                        <span style={{ fontSize: 28 }}>{m.emoji}</span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            color: m.color,
                            background: "rgba(255,255,255,0.1)",
                            padding: "4px 10px",
                            borderRadius: 20,
                            letterSpacing: 0.5,
                            textTransform: "uppercase",
                          }}
                        >
                          {m.label}
                        </span>
                      </div>
                      <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "#F5D98C", lineHeight: 1.3, marginBottom: 12, position: "relative" }}>
                        {w.challenge.title}
                      </h3>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
                        <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.5)" }}>{new Date(w.announcedAt).toLocaleDateString()}</span>
                        {w.challenge.prize && (
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#F5D98C" }}>{w.challenge.prize}</span>
                        )}
                      </div>
                    </TiltCard>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}