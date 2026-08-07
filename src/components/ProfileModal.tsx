"use client";

import { useState, useEffect, useRef } from "react";

function useCountUp(value: number, active: boolean) {
  const [display, setDisplay] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (!active || started.current) return;
    started.current = true;
    const duration = 600;
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [value, active]);
  return display;
}

export default function ProfileModal({ username, onClose }: { username: string; onClose: () => void }) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${username}`)
      .then((r) => r.json())
      .then((d) => {
        setProfile(d);
        setLoading(false);
      });
  }, [username]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,19,43,0.5)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        animation: "fadeBgP 0.25s ease",
        padding: 20,
      }}
    >
      <style>{`
        @keyframes fadeBgP { from { opacity:0 } to { opacity:1 } }
        @keyframes popModalP { from { opacity:0; transform: scale(0.92) translateY(14px); } to { opacity:1; transform: scale(1) translateY(0); } }
        @keyframes ringPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(109,74,255,0.35); } 50% { box-shadow: 0 0 0 8px rgba(109,74,255,0); } }
        @keyframes riseInP { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
        @keyframes chipIn { from { opacity:0; transform: scale(0.8); } to { opacity:1; transform: scale(1); } }
        .p-rise { animation: riseInP 0.4s cubic-bezier(.2,.8,.2,1) both; }
        .p-chip { animation: chipIn 0.3s cubic-bezier(.34,1.56,.64,1) both; transition: transform 0.15s ease, background 0.15s ease; }
        .p-chip:hover { transform: translateY(-2px); background: rgba(109,74,255,0.1) !important; color: #6D4AFF !important; }
        .p-stat { transition: transform 0.2s ease; }
        .p-stat:hover { transform: translateY(-3px); }
      `}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 24,
          width: 400,
          maxHeight: "88vh",
          overflowY: "auto",
          animation: "popModalP 0.35s cubic-bezier(.2,.8,.2,1)",
          boxShadow: "0 30px 70px rgba(20,19,43,0.3)",
          position: "relative",
        }}
      >
        {loading || !profile ? (
          <div style={{ padding: 70, textAlign: "center", color: "rgba(20,19,43,0.4)", fontSize: 14 }}>Loading profile...</div>
        ) : profile.error ? (
          <div style={{ padding: 50, textAlign: "center" }}>
            <p style={{ color: "rgba(20,19,43,0.5)", fontSize: 14, marginBottom: 16 }}>User not found.</p>
            <button onClick={onClose} style={{ background: "#14132B", color: "#fff", border: "none", borderRadius: 10, padding: "9px 18px", cursor: "pointer", fontSize: 13 }}>
              Close
            </button>
          </div>
        ) : (
          <ProfileContent profile={profile} onClose={onClose} />
        )}
      </div>
    </div>
  );
}

function ProfileContent({ profile, onClose }: { profile: any; onClose: () => void }) {
  const challenges = useCountUp(profile.stats.challengesJoined, true);
  const submissions = useCountUp(profile.stats.submissionsCount, true);
  const wins = useCountUp(profile.stats.winsCount, true);

  return (
    <>
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          background: "rgba(20,19,43,0.05)",
          border: "none",
          borderRadius: 8,
          width: 28,
          height: 28,
          cursor: "pointer",
          color: "rgba(20,19,43,0.5)",
          fontSize: 14,
          zIndex: 2,
        }}
      >
        ✕
      </button>

      <div style={{ padding: "36px 28px 0", textAlign: "center" }}>
        <div
          className="p-rise"
          style={{
            width: 90,
            height: 90,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Sora', sans-serif",
            fontSize: 36,
            fontWeight: 700,
            color: "#fff",
            margin: "0 auto 16px",
            animation: "riseInP 0.4s cubic-bezier(.2,.8,.2,1) both, ringPulse 2.4s ease-in-out 0.4s infinite",
          }}
        >
          {profile.name[0]?.toUpperCase()}
        </div>

        <p className="p-rise" style={{ animationDelay: "0.05s", fontFamily: "'Sora', sans-serif", fontSize: 19, fontWeight: 700, color: "#14132B", marginBottom: 2 }}>
          {profile.name}
        </p>
        <p className="p-rise" style={{ animationDelay: "0.1s", fontSize: 13, color: "rgba(20,19,43,0.4)", marginBottom: 14 }}>
          @{profile.username}
        </p>

        <div className="p-rise" style={{ animationDelay: "0.15s", display: "flex", justifyContent: "center", gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, padding: "5px 13px", borderRadius: 20, background: "rgba(109,74,255,0.1)", color: "#6D4AFF" }}>
            {profile.role}
          </span>
          {profile.isVerified && (
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                padding: "5px 13px",
                borderRadius: 20,
                background: "rgba(37,99,235,0.1)",
                color: "#2563EB",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              ✓ Verified
            </span>
          )}
        </div>

        {profile.orgName && (
          <p className="p-rise" style={{ animationDelay: "0.2s", fontSize: 13.5, color: "rgba(20,19,43,0.6)", marginBottom: 12, fontWeight: 600 }}>
            {profile.orgName}
          </p>
        )}

        {profile.bio && (
          <p className="p-rise" style={{ animationDelay: "0.22s", fontSize: 13.5, color: "rgba(20,19,43,0.6)", lineHeight: 1.6, marginBottom: 14, padding: "0 4px" }}>
            {profile.bio}
          </p>
        )}

        {profile.education && (
          <p className="p-rise" style={{ animationDelay: "0.24s", fontSize: 12.5, color: "rgba(20,19,43,0.5)", marginBottom: 14 }}>
            🎓 {profile.education}
          </p>
        )}

        {profile.skills?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 22 }}>
            {profile.skills.map((s: string, i: number) => (
              <span
                key={i}
                className="p-chip"
                style={{
                  animationDelay: `${0.25 + i * 0.04}s`,
                  fontSize: 11.5,
                  fontWeight: 600,
                  background: "rgba(20,19,43,0.05)",
                  color: "rgba(20,19,43,0.6)",
                  padding: "4px 11px",
                  borderRadius: 20,
                  cursor: "default",
                }}
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: "0 28px 28px" }}>
        <div className="p-rise" style={{ animationDelay: "0.3s", display: "flex", gap: 10, marginBottom: 16 }}>
          <StatBox label="Challenges" value={challenges} />
          <StatBox label="Submissions" value={submissions} />
          <StatBox label="Wins" value={wins} />
        </div>

        <p
          className="p-rise"
          style={{ animationDelay: "0.35s", textAlign: "center", fontSize: 11.5, color: "rgba(20,19,43,0.35)", paddingTop: 14, borderTop: "1px solid rgba(15,23,42,0.06)" }}
        >
          Joined {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
      </div>
    </>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-stat" style={{ flex: 1, background: "#F6F5FB", borderRadius: 14, padding: "14px 8px", textAlign: "center" }}>
      <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 700, color: "#14132B", fontVariantNumeric: "tabular-nums" }}>{value}</div>
      <div style={{ fontSize: 11, color: "rgba(20,19,43,0.45)", marginTop: 3 }}>{label}</div>
    </div>
  );
}