"use client";

import Link from "next/link";

import { LogoMark } from "@/components/Logo";

const VALUES = [
  { title: "Built for real use", desc: "Every feature exists because a real hackathon or contest workflow needed it — not as a checkbox exercise." },
  { title: "Fair by design", desc: "Verification for organizers, transparent scoring, and public winner announcements keep the process honest." },
  { title: "Student-first", desc: "From team formation to submission tracking, the experience is shaped around what students actually need." },
];

const TIMELINE = [
  { label: "Concept", desc: "SECM started as a CACS256 Project Work I proposal — a platform to run student hackathons without spreadsheets and group chats." },
  { label: "Core build", desc: "Authentication, challenge creation, team formation, and submissions were built first — the backbone of the whole platform." },
  { label: "Admin & trust", desc: "Organizer verification, account moderation, and platform-wide oversight were added so the system could be trusted at scale." },
  { label: "Polish & extras", desc: "Notifications, bookmarks, messaging, and a full visual redesign turned the working prototype into a real product." },
];

export default function AboutPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: "#14132B", background: "#fff", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @keyframes riseUp { from { opacity:0; transform: translateY(18px); } to { opacity:1; transform: translateY(0); } }
        .r-up { animation: riseUp 0.6s cubic-bezier(.16,.8,.24,1) both; }
        .back-link { display: inline-flex; align-items: center; gap: 6px; font-size: 13.5px; font-weight: 600; color: rgba(20,19,43,0.55); text-decoration: none; transition: color 0.2s ease, gap 0.2s ease; }
        .back-link:hover { color: #6D4AFF; gap: 9px; }
        .value-card { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .value-card:hover { transform: translateY(-6px); box-shadow: 0 18px 36px rgba(109,74,255,0.15); }
        .timeline-item { position: relative; padding-left: 32px; }
        .timeline-item::before { content: ""; position: absolute; left: 5px; top: 4px; width: 10px; height: 10px; border-radius: 50%; background: linear-gradient(135deg,#6D4AFF,#8B5CF6); box-shadow: 0 0 0 4px rgba(109,74,255,0.12); }
        .timeline-item::after { content: ""; position: absolute; left: 9px; top: 18px; bottom: -30px; width: 2px; background: rgba(109,74,255,0.15); }
        .timeline-item:last-child::after { display: none; }
        .dev-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .dev-card:hover { transform: translateY(-4px); box-shadow: 0 14px 30px rgba(20,19,43,0.1); }
        .cta-btn { transition: transform 0.15s ease, box-shadow 0.2s ease; }
        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(109,74,255,0.35); }
        .back-link:focus-visible, .cta-btn:focus-visible { outline: 3px solid #8B5CF6; outline-offset: 4px; }
        @media (max-width: 640px) {
          .about-nav { padding: 16px 20px !important; }
          .about-hero { padding: 64px 20px 56px !important; }
          .about-section { padding-left: 20px !important; padding-right: 20px !important; }
          .about-story { padding-top: 64px !important; padding-bottom: 64px !important; }
          .about-values { padding-bottom: 64px !important; }
          .about-timeline, .about-team { padding-bottom: 72px !important; }
          .about-cta { padding-bottom: 64px !important; }
          .about-cta-card { padding: 36px 24px !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .r-up, .value-card, .dev-card, .cta-btn { animation: none !important; transition: none !important; }
        }
      `}</style>

      <nav className="about-nav" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 48px", position: "sticky", top: 0, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(14px)", zIndex: 50, borderBottom: "1px solid rgba(15,23,42,0.07)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
           <LogoMark size={30} />
          <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 16.5, color: "#14132B" }}>SECM</span>
        </Link>
        <Link href="/" className="back-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Back to home
        </Link>
      </nav>

      {/* Hero */}
      <div className="about-hero" style={{ position: "relative", overflow: "hidden", padding: "90px 48px 70px", background: "linear-gradient(180deg,#FBFAFF,#F6F5FB)", textAlign: "center" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", position: "relative" }} className="r-up">
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, color: "#6D4AFF", background: "rgba(109,74,255,0.08)", padding: "6px 14px", borderRadius: 20, marginBottom: 20 }}>
            ABOUT
          </div>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(32px, 4.5vw, 48px)", fontWeight: 800, letterSpacing: -1.2, color: "#14132B", marginBottom: 18 }}>
            A marketplace for skill, experience, and contest.
          </h1>
          <p style={{ fontSize: 16, color: "rgba(20,19,43,0.55)", lineHeight: 1.7 }}>
            SECM is a BCA 4th semester project (CACS256, Tribhuvan University) built to give colleges and organizations a real way to run hackathons, coding contests, and design challenges — and give students a real place to compete, build a track record, and win.
          </p>
        </div>
      </div>

      {/* Story */}
      <section className="about-section about-story" style={{ padding: "90px 48px", maxWidth: 720, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 700, marginBottom: 20, letterSpacing: -0.5 }}>Why we built this</h2>
        <p style={{ fontSize: 14.5, color: "rgba(20,19,43,0.6)", lineHeight: 1.8, marginBottom: 16 }}>
          Most student hackathons still run on scattered spreadsheets, WhatsApp groups, and manual scoring. Organizers lose track of submissions, students don't know where they stand, and winners get announced through a message that's easy to miss.
        </p>
        <p style={{ fontSize: 14.5, color: "rgba(20,19,43,0.6)", lineHeight: 1.8 }}>
          SECM puts the whole process — posting a challenge, joining solo or as a team, submitting work, getting scored, and finding out who won — on one platform. It's not trying to be everything; it's trying to be the one thing a college needs to run a challenge properly.
        </p>
      </section>

      {/* Values */}
      <section className="about-section about-values" style={{ padding: "0 48px 90px", maxWidth: 1000, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 700, marginBottom: 30, letterSpacing: -0.5, textAlign: "center" }}>What we care about</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {VALUES.map((v) => (
            <div key={v.title} className="value-card r-up" style={{ background: "#fff", border: "1px solid rgba(15,23,42,0.07)", borderRadius: 20, padding: 28 }}>
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16.5, fontWeight: 700, marginBottom: 10, color: "#14132B" }}>{v.title}</h3>
              <p style={{ fontSize: 13.5, color: "rgba(20,19,43,0.55)", lineHeight: 1.65 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="about-section about-timeline" style={{ padding: "0 48px 100px", maxWidth: 640, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 700, marginBottom: 36, letterSpacing: -0.5 }}>How it came together</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
          {TIMELINE.map((t) => (
            <div key={t.label} className="timeline-item r-up">
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15.5, fontWeight: 700, color: "#14132B", marginBottom: 6 }}>{t.label}</h3>
              <p style={{ fontSize: 13.5, color: "rgba(20,19,43,0.55)", lineHeight: 1.65 }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Developers */}
      <section className="about-section about-team" style={{ padding: "0 48px 100px", maxWidth: 720, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 700, marginBottom: 30, letterSpacing: -0.5, textAlign: "center" }}>Built by</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {["Pradip Mishra", "Anish Subedi"].map((name) => (
            <div key={name} className="dev-card" style={{ background: "linear-gradient(135deg,#F0EDFF,#E6E0FF)", borderRadius: 18, padding: 28, textAlign: "center", border: "1px solid rgba(109,74,255,0.1)" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 22, margin: "0 auto 14px" }}>
                {name[0]}
              </div>
              <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 15.5, fontWeight: 700, color: "#14132B" }}>{name}</p>
              <p style={{ fontSize: 12.5, color: "rgba(20,19,43,0.5)", marginTop: 4 }}>BCA · Tribhuvan University</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="about-section about-cta" style={{ padding: "0 48px 100px", textAlign: "center" }}>
        <div className="about-cta-card" style={{ maxWidth: 640, margin: "0 auto", background: "#14132B", borderRadius: 24, padding: "50px 40px" }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Ready to see it in action?</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", marginBottom: 26 }}>Create a free account and explore the platform.</p>
          <Link href="/register" className="cta-btn" style={{ display: "inline-block", background: "#fff", color: "#14132B", textDecoration: "none", padding: "13px 30px", borderRadius: 12, fontSize: 14.5, fontWeight: 700 }}>
            Get started
          </Link>
        </div>
      </section>
    </div>
  );
}
