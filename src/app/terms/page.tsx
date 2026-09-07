"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "intro", title: "Introduction" },
  { id: "eligibility", title: "1. Eligibility" },
  { id: "accounts", title: "2. Accounts & Roles" },
  { id: "conduct", title: "3. Acceptable Use" },
  { id: "content", title: "4. Content & Submissions" },
  { id: "challenges", title: "5. Challenges & Judging" },
  { id: "ip", title: "6. Intellectual Property" },
  { id: "termination", title: "7. Suspension & Termination" },
  { id: "disclaimer", title: "8. Disclaimer" },
  { id: "liability", title: "9. Limitation of Liability" },
  { id: "changes", title: "10. Changes to These Terms" },
  { id: "contact", title: "11. Contact Information" },
];

import { LogoMark } from "@/components/Logo";

export default function TermsPage() {
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("intro");

  useEffect(() => {
    function handleScroll() {
      const doc = document.documentElement;
      const scrolled = (doc.scrollTop / (doc.scrollHeight - doc.clientHeight)) * 100;
      setProgress(Math.min(100, Math.max(0, scrolled)));
      let current = "intro";
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top < 160) current = s.id;
      }
      setActiveSection(current);
    }
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: "#14132B", background: "#fff", minHeight: "100vh" }}>
      <style>{`
        @keyframes riseUp { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform: translateY(0); } }
        @keyframes drift { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-20px,14px); } }
        .r-up { animation: riseUp 0.6s cubic-bezier(.16,.8,.24,1) both; }
        .drift-orb { animation: drift 10s ease-in-out infinite; }
        .toc-link { display: block; padding: 8px 14px; font-size: 13px; color: rgba(20,19,43,0.5); text-decoration: none; border-left: 2px solid transparent; transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease; cursor: pointer; border-radius: 0 8px 8px 0; }
        .toc-link:hover { color: #14132B; background: rgba(109,74,255,0.04); }
        .toc-link.active { color: #6D4AFF; font-weight: 700; border-left-color: #6D4AFF; background: rgba(109,74,255,0.06); }
        .policy-section { scroll-margin-top: 100px; }
        .policy-section h2 { font-family: 'Sora', sans-serif; font-size: 21px; font-weight: 700; color: #14132B; margin-bottom: 14px; letter-spacing: -0.3px; display: flex; align-items: center; gap: 10px; }
        .section-marker { width: 4px; height: 20px; border-radius: 2px; background: linear-gradient(180deg,#6D4AFF,#8B5CF6); display: inline-block; flex-shrink: 0; }
        .policy-section p { font-size: 14.5px; line-height: 1.8; color: rgba(20,19,43,0.68); margin-bottom: 14px; }
        .policy-section ul { padding-left: 0; list-style: none; margin-bottom: 14px; display: flex; flex-direction: column; gap: 10px; }
        .policy-section li { font-size: 14px; line-height: 1.7; color: rgba(20,19,43,0.65); padding: 12px 16px; background: #FAFAFC; border-radius: 10px; border-left: 2px solid rgba(109,74,255,0.2); }
        .policy-section li strong { color: #14132B; font-weight: 700; }
        .back-link { display: inline-flex; align-items: center; gap: 6px; font-size: 13.5px; font-weight: 600; color: rgba(20,19,43,0.55); text-decoration: none; transition: color 0.2s ease, gap 0.2s ease; }
        .back-link:hover { color: #6D4AFF; gap: 9px; }
        .contact-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .contact-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(109,74,255,0.15); }
        @media (max-width: 900px) { .toc-sidebar { display: none; } }
      `}</style>

      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, background: "rgba(109,74,255,0.08)", zIndex: 100 }}>
        <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#6D4AFF,#8B5CF6)", transition: "width 0.1s linear" }} />
      </div>

      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 48px", position: "sticky", top: 3, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(14px)", zIndex: 50, borderBottom: "1px solid rgba(15,23,42,0.07)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
           <LogoMark size={30} />
          <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 16.5, color: "#14132B" }}>SECM</span>
        </Link>
        <Link href="/register" className="back-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Back to Sign up
        </Link>
      </nav>

      <div style={{ position: "relative", overflow: "hidden", padding: "70px 48px 50px", background: "linear-gradient(180deg,#FBFAFF,#F6F5FB)", borderBottom: "1px solid rgba(15,23,42,0.07)" }}>
        <div className="drift-orb" style={{ position: "absolute", top: -60, right: 60, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(109,74,255,0.08), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }} className="r-up">
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, color: "#6D4AFF", background: "rgba(109,74,255,0.08)", padding: "6px 14px", borderRadius: 20, marginBottom: 18 }}>
            📄 Legal · Terms
          </div>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 800, letterSpacing: -1, color: "#14132B", marginBottom: 12 }}>
            Terms of Service
          </h1>
          <p style={{ fontSize: 15, color: "rgba(20,19,43,0.5)", maxWidth: 600, lineHeight: 1.6 }}>
            The rules for using SECM — Skill, Experience & Contest Marketplace.
          </p>
          <p style={{ fontSize: 12.5, color: "rgba(20,19,43,0.4)", marginTop: 12 }}>Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "220px 1fr", gap: 50, padding: "50px 48px 100px" }}>
        <div className="toc-sidebar" style={{ position: "sticky", top: 90, alignSelf: "start" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(20,19,43,0.4)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10, paddingLeft: 14 }}>On this page</p>
          {SECTIONS.map((s) => (
            <a key={s.id} onClick={() => scrollTo(s.id)} className={"toc-link" + (activeSection === s.id ? " active" : "")}>
              {s.title}
            </a>
          ))}
        </div>

        <div>
          <div id="intro" className="policy-section r-up">
            <p style={{ fontSize: 15, lineHeight: 1.8, background: "#FAFAFC", padding: "20px 22px", borderRadius: 14, border: "1px solid rgba(15,23,42,0.06)" }}>
              These Terms of Service ("Terms") govern your use of <strong style={{ color: "#14132B" }}>SECM — Skill, Experience & Contest Marketplace</strong>, an academic platform built under CACS256 – Project Work I, Tribhuvan University. By creating an account or using the platform, you agree to these Terms. If you do not agree, please do not use the platform.
            </p>
          </div>

          <div id="eligibility" className="policy-section r-up" style={{ marginTop: 44 }}>
            <h2><span className="section-marker" />Eligibility</h2>
            <p>You must be at least 13 years old to use SECM. By using the platform, you confirm that the information you provide during registration is accurate, and that you are either a student or a representative of an organization authorized to post challenges.</p>
          </div>

          <div id="accounts" className="policy-section r-up" style={{ marginTop: 44 }}>
            <h2><span className="section-marker" />Accounts & Roles</h2>
            <ul>
              <li><strong>Students</strong> can browse, join, and submit work to published challenges, either solo or as part of a team.</li>
              <li><strong>Organizers</strong> can create and manage challenges, review submissions, and announce winners. New organizer accounts require verification by an administrator before challenges are published.</li>
              <li><strong>Accuracy:</strong> You're responsible for keeping your account credentials secure and for all activity that happens under your account.</li>
              <li><strong>One account per person:</strong> Creating multiple accounts to manipulate participation, reviews, or leaderboard standing is not permitted.</li>
            </ul>
          </div>

          <div id="conduct" className="policy-section r-up" style={{ marginTop: 44 }}>
            <h2><span className="section-marker" />Acceptable Use</h2>
            <p>When using SECM, you agree not to:</p>
            <ul>
              <li>Submit plagiarized, stolen, or fraudulent work to any challenge.</li>
              <li>Harass, impersonate, or misrepresent yourself to other users, organizers, or administrators.</li>
              <li>Attempt to disrupt, overload, or gain unauthorized access to the platform or other users' accounts.</li>
              <li>Post content that is unlawful, defamatory, or infringes on someone else's rights.</li>
              <li>Use automated tools to create accounts, submissions, or messages in bulk.</li>
            </ul>
            <p>Violating these rules may result in your account being placed on hold or deleted, at the discretion of an administrator.</p>
          </div>

          <div id="content" className="policy-section r-up" style={{ marginTop: 44 }}>
            <h2><span className="section-marker" />Content & Submissions</h2>
            <p>You retain ownership of the work you submit to challenges. By submitting, you grant SECM and the relevant organizer a limited, non-exclusive license to view, store, score, and display your submission within the platform for the purpose of evaluating and announcing challenge results. You're responsible for ensuring you have the right to submit any content you upload.</p>
          </div>

          <div id="challenges" className="policy-section r-up" style={{ marginTop: 44 }}>
            <h2><span className="section-marker" />Challenges & Judging</h2>
            <ul>
              <li>Organizers are responsible for setting clear rules, deadlines, and scoring criteria for their challenges.</li>
              <li>Scores, feedback, and winner placements are determined solely by the organizer running the challenge — SECM does not moderate or override judging decisions.</li>
              <li>Challenges may be closed, rescheduled, or removed by their organizer, or by an administrator if they violate these Terms.</li>
            </ul>
          </div>

          <div id="ip" className="policy-section r-up" style={{ marginTop: 44 }}>
            <h2><span className="section-marker" />Intellectual Property</h2>
            <p>The SECM name, interface, and underlying platform are part of an academic project and are not licensed for commercial use by third parties. All submitted work remains the intellectual property of its original creator(s), subject to the limited license described in Section 4.</p>
          </div>

          <div id="termination" className="policy-section r-up" style={{ marginTop: 44 }}>
            <h2><span className="section-marker" />Suspension & Termination</h2>
            <p>Administrators may place an account on hold or delete it if these Terms are violated. Suspended accounts lose access immediately and are shown a notice explaining the action. Deleted accounts are soft-deleted — the underlying data is retained to preserve the integrity of challenges and submissions already in the system, but the account can no longer log in.</p>
          </div>

          <div id="disclaimer" className="policy-section r-up" style={{ marginTop: 44 }}>
            <h2><span className="section-marker" />Disclaimer</h2>
            <p>SECM is provided "as is," as an academic project, without warranties of any kind, express or implied. We do not guarantee the platform will be error-free, uninterrupted, or available at all times. Any prizes, recognition, or opportunities offered through challenges are the responsibility of the organizer posting them, not SECM itself.</p>
          </div>

          <div id="liability" className="policy-section r-up" style={{ marginTop: 44 }}>
            <h2><span className="section-marker" />Limitation of Liability</h2>
            <p>To the fullest extent permitted, SECM and its developers are not liable for any indirect, incidental, or consequential damages arising from your use of the platform, including disputes between students and organizers regarding challenge outcomes, prizes, or feedback.</p>
          </div>

          <div id="changes" className="policy-section r-up" style={{ marginTop: 44 }}>
            <h2><span className="section-marker" />Changes to These Terms</h2>
            <p>We may update these Terms from time to time. Material changes will be reflected by updating the "Last updated" date at the top of this page. Continued use of the platform after changes are posted constitutes acceptance of the revised Terms.</p>
          </div>

          <div id="contact" className="policy-section r-up" style={{ marginTop: 44 }}>
            <h2><span className="section-marker" />Contact Information</h2>
            <p>For questions about these Terms, reach out to the project developers:</p>
            <div className="contact-card" style={{ background: "linear-gradient(135deg,#F0EDFF,#E6E0FF)", borderRadius: 16, padding: 24, marginTop: 16, border: "1px solid rgba(109,74,255,0.12)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 18 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#6D4AFF", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 }}>Developers</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#14132B" }}>Pradip Mishra & Anish Subedi</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#6D4AFF", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 }}>Email</p>
                  <a href="mailto:help.secm@gmail.com" style={{ fontSize: 14, fontWeight: 700, color: "#14132B", textDecoration: "none" }}>help.secm@gmail.com</a>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#6D4AFF", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 }}>Institution</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#14132B" }}>Tribhuvan University, Nepal</p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 56, paddingTop: 24, borderTop: "1px solid rgba(15,23,42,0.08)" }}>
            <Link href="/register" className="back-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Back to Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}