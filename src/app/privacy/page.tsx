"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const SECTIONS = [
  { id: "intro", title: "Introduction" },
  { id: "collect", title: "1. Information We Collect" },
  { id: "use", title: "2. How We Use Your Information" },
  { id: "basis", title: "3. Legal Basis for Processing" },
  { id: "sharing", title: "4. Data Sharing & Third Parties" },
  { id: "security", title: "5. Data Security" },
  { id: "retention", title: "6. Data Retention" },
  { id: "rights", title: "7. Your Rights" },
  { id: "cookies", title: "8. Cookies & Tracking" },
  { id: "children", title: "9. Children's Privacy" },
  { id: "changes", title: "10. Changes to This Policy" },
  { id: "contact", title: "11. Contact Information" },
];

import { LogoMark } from "@/components/Logo";

export default function PrivacyPage() {
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("intro");
  const contentRef = useRef<HTMLDivElement>(null);

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

      {/* Reading progress bar */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, background: "rgba(109,74,255,0.08)", zIndex: 100 }}>
        <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#6D4AFF,#8B5CF6)", transition: "width 0.1s linear" }} />
      </div>

      {/* Nav */}
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

      {/* Hero */}
      <div style={{ position: "relative", overflow: "hidden", padding: "70px 48px 50px", background: "linear-gradient(180deg,#FBFAFF,#F6F5FB)", borderBottom: "1px solid rgba(15,23,42,0.07)" }}>
        <div className="drift-orb" style={{ position: "absolute", top: -60, right: 60, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(109,74,255,0.08), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }} className="r-up">
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, color: "#6D4AFF", background: "rgba(109,74,255,0.08)", padding: "6px 14px", borderRadius: 20, marginBottom: 18 }}>
            🔒 Legal · Privacy
          </div>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 800, letterSpacing: -1, color: "#14132B", marginBottom: 12 }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: 15, color: "rgba(20,19,43,0.5)", maxWidth: 600, lineHeight: 1.6 }}>
            How Skill, Experience & Contest Marketplace  collects, uses, and protects your data.
          </p>
          <p style={{ fontSize: 12.5, color: "rgba(20,19,43,0.4)", marginTop: 12 }}>Last updated: July 20, 2026</p>
        </div>
      </div>

      {/* Body: sidebar + content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "220px 1fr", gap: 50, padding: "50px 48px 100px" }}>
        {/* Sticky TOC */}
        <div className="toc-sidebar" style={{ position: "sticky", top: 90, alignSelf: "start" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(20,19,43,0.4)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10, paddingLeft: 14 }}>On this page</p>
          {SECTIONS.map((s) => (
            <a key={s.id} onClick={() => scrollTo(s.id)} className={"toc-link" + (activeSection === s.id ? " active" : "")}>
              {s.title}
            </a>
          ))}
        </div>

        {/* Content */}
        <div ref={contentRef}>
          <div id="intro" className="policy-section r-up">
            <p style={{ fontSize: 15, lineHeight: 1.8, background: "#FAFAFC", padding: "20px 22px", borderRadius: 14, border: "1px solid rgba(15,23,42,0.06)" }}>
              <strong style={{ color: "#14132B" }}>  Skill, Experience & Contest Marketplace (SECM) </strong> is a web-based platform built as an academic project (CACS256 – Project Work I, Tribhuvan University) to help students discover, participate in, and organize hackathons, coding contests, design challenges, and similar student competitions. This Privacy Policy explains what information we collect, how we use it, and the choices you have regarding your data. We are committed to protecting your privacy and handling your data transparently.
            </p>
          </div>

          <div id="collect" className="policy-section r-up" style={{ marginTop: 44 }}>
            <h2><span className="section-marker" />Information We Collect</h2>
            <p>We collect different types of information depending on how you interact with the platform. All data is provided voluntarily by you during registration, profile setup, or participation in challenges.</p>
            <ul>
              <li><strong>Account Data:</strong> When you sign up, we collect your full name, email address, and a securely hashed password. Your role (Student or Organizer,) is also recorded to determine which features you can access.</li>
              <li><strong>Student Profile:</strong> If you register as a student, you may optionally provide your educational background, skills, and interests to help us recommend relevant challenges.</li>
              <li><strong>Organizer Profile:</strong> If you register as an organizer, we collect your organization name, a brief description, and your account verification status.</li>
              <li><strong>Challenge Participation Data:</strong> When you join a challenge, we record your participation (individual or team). Team names, member lists, and roles are also stored.</li>
              <li><strong>Submissions:</strong> When you submit work, we collect the files or links you provide, along with any description  source code, design files, presentations, or other relevant material.</li>
              <li><strong>Evaluation Data:</strong> Organizers may provide scores and feedback on submissions, stored to determine winners and for historical reference.</li>
              <li><strong>Winner Announcements:</strong> If you place among top entries, your name, team name, and position are stored and displayed publicly on the challenge page.</li>
              <li><strong>Automatically Collected Data:</strong> Technical information such as IP address, browser type, and pages visited, anonymized and used solely for analytics and performance.</li>
            </ul>
          </div>

          <div id="use" className="policy-section r-up" style={{ marginTop: 44 }}>
            <h2><span className="section-marker" />How We Use Your Information</h2>
            <p>Your information is used to provide, maintain, and improve the SECM platform. Specifically, we use it for:</p>
            <ul>
              <li><strong>Account Management:</strong> To create and manage your user account, authenticate your identity, and personalize your experience.</li>
              <li><strong>Challenge Operations:</strong> To let organizers create/manage challenges and students browse, join, submit, and receive scores and feedback.</li>
              <li><strong>Results Publication:</strong> To announce winners and display challenge results publicly within the platform.</li>
              <li><strong>Communication:</strong> To send important notifications about deadlines, invitations, submission status, or platform updates.</li>
              <li><strong>Analytics & Improvement:</strong> To understand platform usage and enhance user experience, using aggregated, anonymized data only.</li>
              <li><strong>Academic Research:</strong> As a university project, aggregated anonymized data may be used in reports or presentations, never in a way that identifies individual users.</li>
            </ul>
          </div>

          <div id="basis" className="policy-section r-up" style={{ marginTop: 44 }}>
            <h2><span className="section-marker" />Legal Basis for Processing</h2>
            <p>Although SECM is an academic project, we respect established privacy principles. We process your personal data on the following bases:</p>
            <ul>
              <li><strong>Consent:</strong> By creating an account and using the platform, you consent to the data collection described here.</li>
              <li><strong>Contractual Necessity:</strong> To fulfill our agreement with you e.g., managing your participation in a challenge.</li>
              <li><strong>Legitimate Interests:</strong> To operate the platform, ensure security, and improve our services, without overriding your rights.</li>
            </ul>
          </div>

          <div id="sharing" className="policy-section r-up" style={{ marginTop: 44 }}>
            <h2><span className="section-marker" />Data Sharing & Third-Party Services</h2>
            <p>We do not sell, rent, or trade your personal data with third parties for marketing purposes. However, we rely on a few trusted service providers to host and operate the platform:</p>
            <ul>
              <li><strong>Neon (PostgreSQL):</strong> All structured data - accounts, profiles, challenges, submissions, scores - is stored on Neon's serverless PostgreSQL database, encrypted at rest and in transit.</li>
              <li><strong>Cloudinary:</strong> Uploaded files (images, documents, source code archives) are stored via Cloudinary's secure media management service.</li>
              <li><strong>Vercel:</strong> The application is hosted on Vercel, which may collect anonymized usage logs for performance monitoring, never for marketing.</li>
            </ul>
            <p>These providers are bound by data processing agreements and comply with applicable data protection regulations. We do not share your data with any other third parties unless required by law.</p>
          </div>

          <div id="security" className="policy-section r-up" style={{ marginTop: 44 }}>
            <h2><span className="section-marker" />Data Security</h2>
            <p>We take data security seriously. The following measures are in place:</p>
            <ul>
              <li><strong>Password Hashing:</strong> Passwords are hashed using a strong one-way algorithm before storage - we never have access to your plain-text password.</li>
              <li><strong>Encryption:</strong> All data transmitted between your browser and our servers is encrypted via HTTPS, and data at rest is encrypted.</li>
              <li><strong>Access Controls:</strong> Role-based access control ensures only authorized users can view or modify sensitive data.</li>
              <li><strong>Regular Audits:</strong> We periodically review security practices to identify potential vulnerabilities.</li>
            </ul>
            <p>Despite these measures, no system is 100% secure. If you suspect any unauthorized access to your account, please contact us immediately.</p>
          </div>

          <div id="retention" className="policy-section r-up" style={{ marginTop: 44 }}>
            <h2><span className="section-marker" />Data Retention</h2>
            <p>We retain your data for as long as your account is active and for a reasonable period thereafter to fulfill the purposes it was collected for. Specifically:</p>
            <ul>
              <li><strong>Account Data:</strong> Retained until you request account deletion. After deletion, we may retain anonymized data for analysis.</li>
              <li><strong>Challenge & Submission Data:</strong> Retained for the lifetime of the project and may be archived for future reference or as a portfolio for students.</li>
              <li><strong>Analytics Logs:</strong> Retained in aggregated, anonymized form for up to 12 months.</li>
            </ul>
            <p>If you wish to delete your account and associated data, please contact the platform administrator. We will respond within a reasonable timeframe.</p>
          </div>

          <div id="rights" className="policy-section r-up" style={{ marginTop: 44 }}>
            <h2><span className="section-marker" />Your Rights</h2>
            <p>Depending on your jurisdiction, you may have certain rights regarding your personal data. We strive to accommodate these rights:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Rectification:</strong> Update or correct your profile information at any time through the platform.</li>
              <li><strong>Deletion:</strong> Request that we delete your account and associated data, subject to legal or academic retention obligations.</li>
              <li><strong>Objection/Restriction:</strong> Object to certain processing activities or request restriction of processing.</li>
              <li><strong>Data Portability:</strong> Request a machine-readable copy of your data in a commonly used format.</li>
            </ul>
            <p>To exercise any of these rights, please contact us via the details in Section 11. We will handle your request without undue delay.</p>
          </div>

          <div id="cookies" className="policy-section r-up" style={{ marginTop: 44 }}>
            <h2><span className="section-marker" />Cookies & Tracking Technologies</h2>
            <p>SECM uses essential cookies to maintain your session, remember your login status, and provide a seamless experience. These cookies are strictly necessary for the platform's function. We do not use tracking cookies for advertising or third-party analytics. For performance monitoring, we may collect anonymized usage statistics via Vercel Analytics, which do not identify individual users. You can manage cookie preferences through your browser settings, but disabling essential cookies may affect your ability to use the platform.</p>
          </div>

          <div id="children" className="policy-section r-up" style={{ marginTop: 44 }}>
            <h2><span className="section-marker" />Children's Privacy</h2>
            <p>SECM is not intended for children under the age of 13. We do not knowingly collect personal data from children. If we become aware that a child under 13 has provided us with personal data, we will delete it promptly.</p>
          </div>

          <div id="changes" className="policy-section r-up" style={{ marginTop: 44 }}>
            <h2><span className="section-marker" />Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page with an updated "Last updated" date. We encourage you to review this policy periodically. Your continued use of the platform after any changes constitutes your acceptance of the updated policy.</p>
          </div>

          <div id="contact" className="policy-section r-up" style={{ marginTop: 44 }}>
            <h2><span className="section-marker" />Contact Information</h2>
            <p>This project is an academic initiative under the BCA program at Tribhuvan University. For any questions, concerns, or requests regarding this Privacy Policy or your data, please reach out to the project developers:</p>
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
            <p style={{ marginTop: 16 }}>We will respond to your inquiry as soon as possible.</p>
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