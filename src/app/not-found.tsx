"use client";

import Link from "next/link";
// (Image import removed, using video instead)

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#FBFAFF", position: "relative", overflow: "hidden", padding: 24 }}>
      <style>{`
        @keyframes riseUp { from { opacity:0; transform: translateY(18px); } to { opacity:1; transform: translateY(0); } }
        @keyframes drift { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-20px,16px); } }
        @keyframes floatChar { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .r-up { animation: riseUp 0.6s cubic-bezier(.16,.8,.24,1) both; }
        .drift-orb { animation: drift 9s ease-in-out infinite; }
        .char-float { animation: floatChar 4s ease-in-out infinite; }
        .home-btn { transition: transform 0.15s ease, box-shadow 0.2s ease; }
        .home-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(109,74,255,0.35); }
        .back-btn { transition: border-color 0.15s ease, transform 0.15s ease; }
        .back-btn:hover { transform: translateY(-2px); border-color: #14132B; }
      `}</style>

      <div className="drift-orb" style={{ position: "absolute", top: "18%", left: "12%", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(109,74,255,0.1), transparent 70%)", pointerEvents: "none" }} />
      <div className="drift-orb" style={{ position: "absolute", bottom: "15%", right: "12%", width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%)", pointerEvents: "none", animationDelay: "1s" }} />
      <div className="r-up char-float" style={{ width: "100%", maxWidth: 720, marginBottom: 28, padding: "0 24px" }}>
        <video
          src="/illustrations/404error.mp4"
          autoPlay
          loop
          muted
          playsInline
          style={{ width: "100%", height: "auto" }}
        />
      </div>
      <div className="r-up" style={{ animationDelay: "0.15s", display: "flex", gap: 14 }}>
        <Link href="/" className="home-btn" style={{ background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)", color: "#fff", textDecoration: "none", padding: "13px 28px", borderRadius: 12, fontSize: 14, fontWeight: 700, boxShadow: "0 8px 20px rgba(109,74,255,0.3)" }}>
          Go to Home
        </Link>
        <Link href="/dashboard" className="back-btn" style={{ background: "#fff", color: "#14132B", textDecoration: "none", padding: "13px 28px", borderRadius: 12, fontSize: 14, fontWeight: 700, border: "1.5px solid rgba(15,23,42,0.12)" }}>
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}