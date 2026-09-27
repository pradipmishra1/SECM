"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode, type MouseEvent as ReactMouseEvent } from "react";
import { LogoMark } from "@/components/Logo";

/* ============================================================
   DESIGN TOKENS
   ============================================================ */

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/* ============================================================
   ICONS
   ============================================================ */

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}
const IconRocket = () => <Icon><path d="M12 2c3 1.5 5 5 5 9 0 2-1 4-2 5l-3 3-3-3c-1-1-2-3-2-5 0-4 2-7.5 5-9Z" /><circle cx="12" cy="10" r="1.5" /></Icon>;
const IconUsers = () => <Icon><circle cx="8" cy="9" r="2.7" /><circle cx="16" cy="9" r="2.7" /><path d="M2.5 19c.6-3.2 2.6-5.3 5.5-5.3s4.9 2.1 5.5 5.3M12.5 19c.6-3.2 2.6-5.3 5.5-5.3s4.9 2.1 5.5 5.3" /></Icon>;
const IconUpload = () => <Icon><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" /></Icon>;
const IconStar = () => <Icon><path d="M12 3l2.6 5.9 6.4.6-4.8 4.3 1.4 6.3L12 16.9 6.4 20.1l1.4-6.3L3 9.5l6.4-.6L12 3Z" /></Icon>;
const IconTrophy = () => <Icon><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4Z" /><path d="M7 5H4a1 1 0 0 0-1 1c0 2.5 1.8 4.5 4 4.9M17 5h3a1 1 0 0 1 1 1c0 2.5-1.8 4.5-4 4.9" /></Icon>;
const IconBell = () => <Icon><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></Icon>;
const IconChat = () => <Icon><path d="M3 12h4.5l1.5 3h6l1.5-3H21" /><path d="M5 5h14l2 7v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-7l2-7Z" /></Icon>;
const IconBookmark = () => <Icon><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" /></Icon>;
const IconChart = () => <Icon><path d="M4 20V10M12 20V4M20 20v-7" /><path d="M2 20h20" /></Icon>;
const IconArrow = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const IconCheck = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true" focusable="false"><path d="M5 12l5 5L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>;

/* ============================================================
   DATA
   ============================================================ */

const FEATURES = [
  { Icon: IconRocket, title: "Post challenges", desc: "Organizers publish hackathons, coding contests, and design challenges in minutes, with deadlines and rubrics built in." },
  { Icon: IconUsers, title: "Team up or go solo", desc: "Join a challenge alone or form a team, invite classmates, and coordinate through built-in team chat." },
  { Icon: IconUpload, title: "Submit your work", desc: "Upload directly to the platform and track exactly where your submission stands, in real time." },
  { Icon: IconStar, title: "Get real feedback", desc: "Organizers score every submission with rubric-based or simple scoring, plus written feedback." },
  { Icon: IconTrophy, title: "Win, get recognized", desc: "Top performers are announced as challenge winners and climb the platform-wide leaderboard." },
  { Icon: IconBell, title: "Never miss an update", desc: "Instant notifications for invites, reviews, wins, and everything that happens to your account." },
  { Icon: IconChat, title: "Message anyone", desc: "Direct messaging with organizers, teammates, or any student on the platform, no email needed." },
  { Icon: IconBookmark, title: "Bookmark for later", desc: "Save challenges that catch your eye and come back to them before the deadline hits." },
  { Icon: IconChart, title: "Track your growth", desc: "A running record of your stats, achievements, and rank, all in one profile." },
];

const STEPS = [
  { num: "01", title: "Create your account", desc: "Sign up as a student or an organizer. No approval wait, no fees." },
  { num: "02", title: "Find or post a challenge", desc: "Students browse what's live. Organizers publish something new whenever they want." },
  { num: "03", title: "Compete and get scored", desc: "Submit your work, get reviewed by a real organizer, and see where you land." },
];

const TRUST_POINTS = [
  "No fees for students or organizers",
  "Real organizer review on every submission",
  "Built for college hackathons and contests",
];

const MARQUEE_ITEMS = ["Hackathons", "Coding Contests", "Design Challenges", "Idea Pitching", "Team Submissions", "Live Leaderboards"];

/* ============================================================
   HOOKS
   ============================================================ */

function useReveal<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); io.unobserve(el); } },
      { threshold, rootMargin: "0px 0px -60px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      data-in={inView}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function useScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setP(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return p;
}

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const dur = 1100;
        const tick = (now: number) => {
          const t = Math.min((now - start) / dur, 1);
          setDisplay(Math.round((1 - Math.pow(1 - t, 3)) * value));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        io.unobserve(el);
      }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [value]);
  return <span ref={ref}>{display.toLocaleString()}{suffix}</span>;
}

function createRipple(e: ReactMouseEvent<HTMLElement>) {
  const btn = e.currentTarget;
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const ripple = document.createElement("span");
  ripple.className = "ripple";
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
  ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 650);
}

/* ============================================================
   MAIN
   ============================================================ */

export default function Home() {
  const [stats, setStats] = useState<{ totalChallenges: number; totalStudents: number; reviewRate: number; totalOrganizers: number } | null>(null);
  const [navScrolled, setNavScrolled] = useState(false);
  const progress = useScrollProgress();

  useEffect(() => {
    fetch("/api/public-stats").then((r) => r.json()).then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..700&family=Sora:wght@500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        .page {
          --ink: #14132B;
          --ink-60: rgba(20,19,43,0.6);
          --ink-45: rgba(20,19,43,0.45);
          --ink-08: rgba(20,19,43,0.08);
          --accent: #5B3DF6;
          --accent-soft: #F1EEFF;
          --paper: #FCFCFD;
          font-family: 'Inter', -apple-system, sans-serif;
          -webkit-font-smoothing: antialiased;
          color: var(--ink);
          background: var(--paper);
          overflow-x: hidden;
        }
        ::selection { background: var(--ink); color: #fff; }

        a:focus-visible, button:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
          border-radius: 4px;
        }

        .reveal {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.7s ${EASE}, transform 0.7s ${EASE};
        }
        .reveal[data-in="true"] { opacity: 1; transform: none; }
        @media (prefers-reduced-motion: reduce) {
          .reveal { opacity: 1; transform: none; transition: none; }
        }

        .scroll-progress {
          position: fixed; top: 0; left: 0; height: 2px; z-index: 100;
          background: var(--ink); transition: width 0.1s linear;
        }

        .btn-primary {
          position: relative; display: inline-flex; align-items: center; gap: 8px;
          background: var(--ink); color: #fff; padding: 13px 24px; border-radius: 10px;
          font-size: 14.5px; font-weight: 600; text-decoration: none; letter-spacing: -0.01em;
          overflow: hidden; isolation: isolate; cursor: pointer; border: none;
          transition: transform 0.25s ${EASE}, background 0.25s ease;
        }
        .btn-primary:hover { background: var(--accent); transform: translateY(-1px); }
        .btn-primary svg { transition: transform 0.25s ${EASE}; }
        .btn-primary:hover svg { transform: translateX(3px); }
        .ripple { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.35); transform: scale(0); animation: ripple 0.65s ${EASE} forwards; pointer-events: none; }
        @keyframes ripple { to { transform: scale(3.4); opacity: 0; } }

        .btn-secondary {
          display: inline-flex; align-items: center; gap: 8px; text-decoration: none;
          color: var(--ink); font-size: 14.5px; font-weight: 600; padding: 13px 4px;
          border-bottom: 1.5px solid var(--ink-08); transition: border-color 0.2s ease, gap 0.2s ease;
        }
        .btn-secondary:hover { border-color: var(--ink); gap: 12px; }

        .nav { position: sticky; top: 0; z-index: 50; background: rgba(252,252,253,0.82); backdrop-filter: blur(14px); border-bottom: 1px solid transparent; transition: border-color 0.3s ease, box-shadow 0.3s ease; }
        .nav.is-scrolled { border-bottom-color: var(--ink-08); box-shadow: 0 1px 0 rgba(20,19,43,0.02); }
        .nav-inner { max-width: 1200px; margin: 0 auto; padding: 18px 32px; display: flex; align-items: center; justify-content: space-between; }
        .nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .nav-logo-text { display: flex; flex-direction: column; line-height: 1; }
        .nav-logo-name { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 15.5px; color: var(--ink); letter-spacing: -0.01em; }
        .nav-logo-sub { font-size: 9px; color: var(--ink-45); font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; margin-top: 2px; }
        .nav-links { display: flex; align-items: center; gap: 36px; }
        .nav-link { position: relative; color: var(--ink-60); text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.2s ease; }
        .nav-link:hover { color: var(--ink); }

        .hero { max-width: 1200px; margin: 0 auto; padding: 96px 32px 80px; display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 64px; align-items: center; }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 7px; font-size: 12.5px; font-weight: 600;
          color: var(--accent); background: var(--accent-soft); padding: 7px 13px; border-radius: 999px;
          letter-spacing: -0.01em;
        }
        .hero-title {
          font-family: 'Sora', sans-serif; font-weight: 700; letter-spacing: -0.035em;
          font-size: clamp(32px, 3.6vw, 46px); line-height: 1.14; color: var(--ink); margin: 22px 0 20px;
        }
        .hero-title .accent { color: var(--accent); }
        .hero-subtitle { font-size: 16.5px; color: var(--ink-60); line-height: 1.65; max-width: 460px; margin-bottom: 32px; }
        .hero-actions { display: flex; gap: 20px; align-items: center; flex-wrap: wrap; margin-bottom: 36px; }

        .hero-trust-list { display: flex; flex-direction: column; gap: 10px; }
        .hero-trust-item { display: flex; align-items: center; gap: 9px; font-size: 13.5px; color: var(--ink-60); font-weight: 500; }
        .hero-trust-item svg { color: var(--accent); flex-shrink: 0; }

        /* ---- hero visual: photo with floating stat badges ---- */
        .hero-photo-wrap { position: relative; display: flex; align-items: center; justify-content: center; min-height: 440px; }
        .hero-blob { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.55; }
        .hero-blob-1 { width: 300px; height: 300px; background: #A78BFA; top: -6%; left: 4%; }
        .hero-blob-2 { width: 240px; height: 240px; background: #FBCFE8; bottom: -4%; right: 2%; }
        .hero-blob-3 { width: 200px; height: 200px; background: #FDE68A; bottom: 14%; left: -6%; }

        .hero-photo-circle {
          position: relative; z-index: 1; width: 340px; height: 340px; border-radius: 50%;
          overflow: hidden; border: 6px solid #fff;
          box-shadow: 0 30px 60px -20px rgba(20,19,43,0.25);
        }
        .hero-photo-circle img { width: 100%; height: 100%; object-fit: cover; display: block; }

        .hero-float-badge {
          position: absolute; z-index: 2; background: #fff; border-radius: 14px;
          padding: 12px 16px; display: flex; align-items: center; gap: 10px;
          box-shadow: 0 16px 32px -12px rgba(20,19,43,0.18);
          border: 1px solid var(--ink-08);
        }
        .hero-float-badge-1 { top: 6%; left: -6%; }
        .hero-float-badge-2 { bottom: 10%; right: -8%; }
        .hero-float-badge-3 { bottom: -4%; left: 8%; }
        .hero-badge-icon { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .hero-badge-value { font-family: 'Sora', sans-serif; font-size: 14.5px; font-weight: 700; color: var(--ink); line-height: 1.2; }
        .hero-badge-label { font-size: 10.5px; color: var(--ink-45); font-weight: 500; }

        .marquee-section { border-top: 1px solid var(--ink-08); border-bottom: 1px solid var(--ink-08); padding: 20px 0; overflow: hidden; }
        .marquee-track { display: flex; width: max-content; animation: marquee 32s linear infinite; }
        .marquee-section:hover .marquee-track { animation-play-state: paused; }
        .marquee-item { font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 600; color: var(--ink-45); white-space: nowrap; padding-right: 14px; }
        .marquee-item::after { content: "·"; padding-left: 14px; color: var(--ink-08); }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        .stats-section { max-width: 1200px; margin: 0 auto; padding: 72px 32px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--ink-08); border: 1px solid var(--ink-08); border-radius: 16px; overflow: hidden; }
        .stats-card { background: #fff; text-align: center; padding: 32px 16px; }
        .stats-value { font-family: 'Sora', sans-serif; font-size: 32px; font-weight: 700; letter-spacing: -0.02em; }
        .stats-label { margin-top: 6px; font-size: 12.5px; color: var(--ink-45); font-weight: 500; }

        .features-section { max-width: 1200px; margin: 0 auto; padding: 96px 32px 88px; }
        .features-header { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; flex-wrap: wrap; margin-bottom: 56px; }
        .eyebrow { display: inline-block; font-size: 12px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); margin-bottom: 12px; }
        .features-title { font-family: 'Sora', sans-serif; font-size: 34px; font-weight: 700; letter-spacing: -0.03em; line-height: 1.2; }
        .features-desc { font-size: 14.5px; color: var(--ink-45); line-height: 1.7; max-width: 380px; }

        .bento-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--ink-08); border: 1px solid var(--ink-08); border-radius: 16px; overflow: hidden; }
        .bento-card { background: #fff; padding: 30px; transition: background 0.25s ease; }
        .bento-card:hover { background: #FAFAFC; }
        .bento-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: var(--accent-soft); color: var(--accent); margin-bottom: 20px; }
        .bento-card-title { font-family: 'Sora', sans-serif; font-size: 16px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.01em; }
        .bento-card-desc { font-size: 13.5px; color: var(--ink-45); line-height: 1.65; }

        .how-section { border-top: 1px solid var(--ink-08); border-bottom: 1px solid var(--ink-08); padding: 96px 32px; }
        .how-container { max-width: 1200px; margin: 0 auto; }
        .how-title { font-family: 'Sora', sans-serif; font-size: 32px; font-weight: 700; letter-spacing: -0.03em; margin-bottom: 56px; }
        .how-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
        .how-step-num { font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 700; color: var(--accent); margin-bottom: 16px; }
        .how-step-title { font-family: 'Sora', sans-serif; font-size: 18px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.01em; }
        .how-step-desc { font-size: 14px; color: var(--ink-45); line-height: 1.7; }

        .statement-section { max-width: 820px; margin: 0 auto; padding: 110px 32px; text-align: center; }
        .statement-text { font-family: 'Sora', sans-serif; font-size: clamp(24px, 3vw, 34px); font-weight: 600; line-height: 1.4; letter-spacing: -0.02em; color: var(--ink); }
        .statement-text em { font-style: normal; color: var(--accent); }

        .cta-section { padding: 0 32px 110px; }
        .cta-card { max-width: 1200px; margin: 0 auto; background: var(--ink); border-radius: 20px; padding: 60px 52px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 28px; }
        .cta-title { font-family: 'Sora', sans-serif; font-size: 27px; font-weight: 700; color: #fff; letter-spacing: -0.02em; margin-bottom: 8px; }
        .cta-sub { font-size: 14px; color: rgba(255,255,255,0.55); }
        .btn-white { background: #fff; color: var(--ink); }
        .btn-white:hover { background: #ECEAFB; color: var(--ink); }
        .btn-white .ripple { background: rgba(20,19,43,0.12); }

        .footer { border-top: 1px solid var(--ink-08); padding: 56px 32px 32px; }
        .footer-inner { max-width: 1200px; margin: 0 auto; }
        .footer-grid { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 40px; margin-bottom: 44px; }
        .footer-brand { max-width: 300px; }
        .footer-logo { display: flex; align-items: center; gap: 9px; margin-bottom: 14px; }
        .footer-tagline { font-size: 11.5px; color: var(--ink-45); font-weight: 700; margin-bottom: 10px; letter-spacing: 0.02em; }
        .footer-text { font-size: 13px; color: var(--ink-45); line-height: 1.7; }
        .footer-links { display: flex; gap: 56px; flex-wrap: wrap; }
        .footer-link-title { font-size: 11px; font-weight: 700; color: var(--ink-45); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 14px; }
        .footer-link { display: block; color: var(--ink-60); text-decoration: none; font-size: 13.5px; margin-bottom: 10px; transition: color 0.2s ease; }
        .footer-link:hover { color: var(--accent); }
        .footer-bottom { border-top: 1px solid var(--ink-08); padding-top: 22px; }
        .footer-copy { font-size: 12px; color: var(--ink-45); }

        @media (max-width: 1024px) {
          .hero { grid-template-columns: 1fr; padding-top: 64px; }
          .bento-grid { grid-template-columns: repeat(2, 1fr); }
          .stats-section { grid-template-columns: repeat(2, 1fr); }
          .hero-photo-wrap { min-height: 380px; margin-top: 24px; }
        }
        @media (max-width: 700px) {
          .nav-inner { padding: 14px 20px; }
          .nav-links { gap: 18px; }
          .hero { padding: 48px 20px; }
          .bento-grid { grid-template-columns: 1fr; }
          .how-steps { grid-template-columns: 1fr; gap: 32px; }
          .stats-section { grid-template-columns: repeat(2, 1fr); padding: 48px 20px; }
          .cta-card { padding: 40px 26px; }
          .hero-photo-circle { width: 260px; height: 260px; }
          .hero-float-badge { padding: 9px 12px; }
        }
      `}</style>

      <div className="scroll-progress" style={{ width: `${progress}%` }} />

      {/* NAV */}
      <nav className={`nav${navScrolled ? " is-scrolled" : ""}`} aria-label="Primary">
        <div className="nav-inner">
          <Link href="/" className="nav-logo" aria-label="SECM home">
            <LogoMark size={30} />
            <div className="nav-logo-text">
              <span className="nav-logo-name">SECM</span>
              <span className="nav-logo-sub">Marketplace</span>
            </div>
          </Link>
          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how" className="nav-link">How it works</a>
            <Link href="/login" className="nav-link">Log in</Link>
            <Link href="/register" className="btn-primary" onClick={createRipple}>Sign up</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div>
          <Reveal>
            <span className="hero-badge">Built for hackathons &amp; coding contests</span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="hero-title">
              Where organizers post challenges, <span className="accent">students show up to win.</span>
            </h1>
          </Reveal>
          <Reveal delay={140}>
            <p className="hero-subtitle">
              SECM is a marketplace for skill-based competition — post a challenge, form a team,
              submit your work, and get scored by a real organizer, start to finish.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <div className="hero-actions">
              <Link href="/register" className="btn-primary" onClick={createRipple}>
                Get started free <IconArrow />
              </Link>
              <a href="#how" className="btn-secondary">See how it works <IconArrow /></a>
            </div>
          </Reveal>
          <Reveal delay={240}>
            <div className="hero-trust-list">
              {TRUST_POINTS.map((t) => (
                <div key={t} className="hero-trust-item"><IconCheck />{t}</div>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal delay={180}>
          <div className="hero-photo-wrap">
            <div className="hero-blob hero-blob-1" />
            <div className="hero-blob hero-blob-2" />
            <div className="hero-blob hero-blob-3" />

            <div className="hero-photo-circle">
              <img src="/photos/landingpage.jpg" alt="A student presenting a project on a laptop during a hackathon" />
            </div>

            <div className="hero-float-badge hero-float-badge-1">
              <div className="hero-badge-icon" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
                <IconRocket />
              </div>
              <div>
                <div className="hero-badge-value">{stats ? stats.totalChallenges : "—"}+</div>
                <div className="hero-badge-label">Challenges live</div>
              </div>
            </div>

            <div className="hero-float-badge hero-float-badge-2">
              <div className="hero-badge-icon" style={{ background: "rgba(217,119,6,0.1)", color: "#D97706" }}>
                <IconStar />
              </div>
              <div>
                <div className="hero-badge-value">{stats ? stats.reviewRate : "—"}%</div>
                <div className="hero-badge-label">Reviewed</div>
              </div>
            </div>

            <div className="hero-float-badge hero-float-badge-3">
              <div className="hero-badge-icon" style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}>
                <IconUsers />
              </div>
              <div>
                <div className="hero-badge-value">{stats ? stats.totalStudents : "—"}+</div>
                <div className="hero-badge-label">Students</div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* MARQUEE */}
      <div className="marquee-section" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((dup) => (
            <div key={dup} style={{ display: "flex" }}>
              {MARQUEE_ITEMS.map((t) => <span key={`${t}-${dup}`} className="marquee-item">{t}</span>)}
            </div>
          ))}
        </div>
      </div>

      {/* STATS — single source of truth for numbers */}
      <section className="stats-section" aria-label="Platform statistics">
        {[
          { value: stats?.totalChallenges ?? 0, suffix: "+", label: "Challenges hosted" },
          { value: stats?.totalStudents ?? 0, suffix: "+", label: "Students on the platform" },
          { value: stats?.reviewRate ?? 0, suffix: "%", label: "Submissions reviewed" },
          { value: stats?.totalOrganizers ?? 0, suffix: "+", label: "Organizations hosting" },
        ].map((s) => (
          <div key={s.label} className="stats-card">
            <div className="stats-value">{stats ? <Counter value={s.value} suffix={s.suffix} /> : "—"}</div>
            <div className="stats-label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* FEATURES */}
      <section id="features" className="features-section">
        <div className="features-header">
          <Reveal>
            <div>
              <span className="eyebrow">Why SECM</span>
              <h2 className="features-title">Everything the process needs — nothing it doesn&rsquo;t.</h2>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <p className="features-desc">Nine pieces that cover the whole lifecycle of a challenge, from the first post to the final score.</p>
          </Reveal>
        </div>
        <div className="bento-grid">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 80}>
              <div className="bento-card">
                <div className="bento-icon"><f.Icon /></div>
                <h3 className="bento-card-title">{f.title}</h3>
                <p className="bento-card-desc">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="how-section">
        <div className="how-container">
          <Reveal>
            <span className="eyebrow">How it works</span>
            <h2 className="how-title">Three steps in.</h2>
          </Reveal>
          <div className="how-steps">
            {STEPS.map((s, i) => (
              <Reveal key={s.num} delay={i * 100}>
                <div className="how-step-num">{s.num}</div>
                <h3 className="how-step-title">{s.title}</h3>
                <p className="how-step-desc">{s.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* STATEMENT */}
      <section className="statement-section">
        <Reveal>
          <p className="statement-text">
            Built so a college can run its first hackathon without spreadsheets, and a student
            can build a real track record — <em>one win at a time.</em>
          </p>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <Reveal>
          <div className="cta-card">
            <div>
              <h2 className="cta-title">Start your first challenge today.</h2>
              <p className="cta-sub">Free for students and organizers. No credit card, no waitlist.</p>
            </div>
            <Link href="/register" className="btn-primary btn-white" onClick={createRipple}>
              Create your account <IconArrow />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <LogoMark size={26} />
                <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14.5 }}>SECM</span>
              </div>
              <p className="footer-tagline">Skill, Experience &amp; Contest Marketplace</p>
              <p className="footer-text">A platform where organizers and organizations post challenges, and students compete, submit, and win.</p>
            </div>
            <div className="footer-links">
              <div>
                <p className="footer-link-title">Contact</p>
                <a href="mailto:help.secm@gmail.com" className="footer-link">help.secm@gmail.com</a>
              </div>
              <div>
                <p className="footer-link-title">Platform</p>
                <Link href="/login" className="footer-link">Log in</Link>
                <Link href="/register" className="footer-link">Sign up</Link>
              </div>
              <div>
                <p className="footer-link-title">Explore</p>
                <a href="#features" className="footer-link">Features</a>
                <a href="#how" className="footer-link">How it works</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-copy">© {new Date().getFullYear()} SECM — Skill, Experience &amp; Contest Marketplace. All rights reserved. Built by Pradip Mishra &amp; Anish Subedi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}