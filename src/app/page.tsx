"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { LogoMark } from "@/components/Logo";

/* ======================== ICONS ======================== */

function IconRocket() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 2c3 1.5 5 5 5 9 0 2-1 4-2 5l-3 3-3-3c-1-1-2-3-2-5 0-4 2-7.5 5-9Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="1.6" />
      <path d="M8.5 16 6 21l3-1.5M15.5 16 18 21l-3-1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="8" cy="9" r="2.7" />
      <circle cx="16" cy="9" r="2.7" />
      <path d="M2.5 19c.6-3.2 2.6-5.3 5.5-5.3s4.9 2.1 5.5 5.3M12.5 19c.6-3.2 2.6-5.3 5.5-5.3s4.9 2.1 5.5 5.3" strokeLinecap="round" />
    </svg>
  );
}

function IconUpload() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 16V4M7 9l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 3l2.6 5.9 6.4.6-4.8 4.3 1.4 6.3L12 16.9 6.4 20.1l1.4-6.3L3 9.5l6.4-.6L12 3Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconTrophy() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 5H4a1 1 0 0 0-1 1c0 2.5 1.8 4.5 4 4.9M17 5h3a1 1 0 0 1 1 1c0 2.5-1.8 4.5-4 4.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" strokeLinecap="round" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 12h4.5l1.5 3h6l1.5-3H21" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 5h14l2 7v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-7l2-7Z" strokeLinejoin="round" />
    </svg>
  );
}

function IconBookmark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 20V10M12 20V4M20 20v-7" strokeLinecap="round" />
      <path d="M2 20h20" strokeLinecap="round" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconSparkle() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l1.8 5.8L20 9.6l-6.2 1.8L12 17.2l-1.8-5.8L4 9.6l6.2-1.8L12 2Z" />
    </svg>
  );
}

/* ======================== DATA ======================== */

const FEATURES = [
  { Icon: IconRocket, title: "Post challenges", desc: "Organizers publish hackathons, coding contests, and design challenges in minutes, with deadlines and rubrics built in.", accent: "#6D4AFF" },
  { Icon: IconUsers, title: "Team up or go solo", desc: "Join a challenge alone or form a team, invite classmates, and coordinate through built-in team chat.", accent: "#EC4899" },
  { Icon: IconUpload, title: "Submit your work", desc: "Upload directly to the platform and track exactly where your submission stands, in real time.", accent: "#8B5CF6" },
  { Icon: IconStar, title: "Get real feedback", desc: "Organizers score every submission with rubric-based or simple scoring, plus written feedback.", accent: "#F59E0B" },
  { Icon: IconTrophy, title: "Win, get recognized", desc: "Top performers are announced as challenge winners and climb the platform-wide leaderboard.", accent: "#10B981" },
  { Icon: IconBell, title: "Never miss an update", desc: "Instant notifications for invites, reviews, wins, and everything that happens to your account.", accent: "#3B82F6" },
  { Icon: IconChat, title: "Message anyone", desc: "Direct messaging with organizers, teammates, or any student on the platform, no email needed.", accent: "#EF4444" },
  { Icon: IconBookmark, title: "Bookmark for later", desc: "Save challenges that catch your eye and come back to them before the deadline hits.", accent: "#8B5CF6" },
  { Icon: IconChart, title: "Track your growth", desc: "A running record of your stats, achievements, and rank, all in one profile.", accent: "#14B8A6" },
];

const STEPS = [
  { num: "01", title: "Create your account", desc: "Sign up as a student or an organizer. No approval wait, no fees." },
  { num: "02", title: "Find or post a challenge", desc: "Students browse what's live. Organizers publish something new whenever they want." },
  { num: "03", title: "Compete and get scored", desc: "Submit your work, get reviewed by a real organizer, and see where you land." },
];

/* ======================== ANIMATED COMPONENTS ======================== */

function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />;
}

/* ======================== MAIN COMPONENT ======================== */

export default function Home() {
  const handleFeatureMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  return (
    <div className="page">
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .page {
          font-family: 'Inter', sans-serif;
          color: #14132B;
          background: #ffffff;
          overflow-x: hidden;
          min-height: 100vh;
          position: relative;
        }

        ::selection {
          background: #14132B;
          color: #fff;
        }

        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        .scroll-progress {
          position: fixed;
          top: 0;
          left: 0;
          height: 3px;
          background: linear-gradient(90deg, #6D4AFF, #A78BFA, #EC4899);
          z-index: 1000;
          transition: width 0.1s linear;
        }

        .reveal {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
          will-change: opacity, transform;
        }
        .reveal.is-visible {
          opacity: 1;
          transform: none;
        }

        .text-gradient {
          background: linear-gradient(135deg, #6D4AFF 0%, #A78BFA 50%, #EC4899 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .nav {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(15,23,42,0.06);
        }
        .nav-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 16px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 11px;
          text-decoration: none;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
        }
        .nav-link {
          position: relative;
          color: rgba(20,19,43,0.6);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s;
        }
        .nav-link:hover {
          color: #14132B;
        }

        .btn-primary {
          position: relative;
          background: #14132B;
          color: #fff;
          padding: 12px 22px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: transform 0.15s ease, background 0.15s ease;
        }
        .btn-primary:hover {
          transform: translateY(-1px);
          background: #221f45;
        }
        .btn-ghost {
          display: inline-flex;
          align-items: center;
          background: transparent;
          color: #14132B;
          text-decoration: none;
          padding: 12px 22px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          border: 1.5px solid rgba(15,23,42,0.14);
          transition: border-color 0.15s, background 0.15s;
        }
        .btn-ghost:hover {
          border-color: #14132B;
          background: rgba(20,19,43,0.04);
        }
        .btn-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #14132B;
          font-weight: 700;
          font-size: 14px;
          text-decoration: none;
          padding: 12px 8px;
          transition: gap 0.15s;
        }
        .btn-link:hover {
          gap: 10px;
        }

        /* HERO */
        .hero {
          position: relative;
          min-height: calc(100vh - 65px);
          display: flex;
          align-items: center;
          padding: 40px 32px;
          overflow: hidden;
          isolation: isolate;
        }

        .hero-container {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(109,74,255,0.08);
          color: #6D4AFF;
          font-size: 12.5px;
          font-weight: 600;
          letter-spacing: 0.2px;
          padding: 8px 14px;
          border-radius: 999px;
          border: 1px solid rgba(109,74,255,0.16);
        }

        .hero-title {
          font-family: 'Sora', sans-serif;
          font-size: clamp(34px, 4vw, 50px);
          font-weight: 700;
          line-height: 1.12;
          letter-spacing: -1.2px;
          color: #14132B;
          margin: 18px 0 20px;
        }

        .hero-subtitle {
          font-size: 16px;
          color: rgba(20,19,43,0.55);
          line-height: 1.65;
          max-width: 460px;
          margin-bottom: 28px;
        }

        .hero-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
        }

        /* HERO VISUAL */
        .hero-visual {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          z-index: 0;
          opacity: 0.3;
        }
        .hero-blob-1 {
          width: 200px;
          height: 200px;
          background: #A78BFA;
          top: -10%;
          right: 15%;
        }
        .hero-blob-2 {
          width: 160px;
          height: 160px;
          background: #EC4899;
          bottom: 0;
          right: -5%;
        }
        .hero-blob-3 {
          width: 140px;
          height: 140px;
          background: #6D4AFF;
          bottom: 10%;
          left: -5%;
        }

        .hero-mockup {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 460px;
          background: #fff;
          border-radius: 12px;
          border: 1px solid rgba(15,23,42,0.1);
          box-shadow: 0 20px 50px -15px rgba(20,19,43,0.2);
          overflow: hidden;
        }

        .hero-mockup-topbar {
          display: flex;
          gap: 6px;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(15,23,42,0.06);
        }
        .hero-mockup-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .hero-mockup-body {
          display: flex;
          min-height: 300px;
        }

        .hero-mockup-sidebar {
          width: 130px;
          background: #FAFAFC;
          border-right: 1px solid rgba(15,23,42,0.06);
          padding: 16px 12px;
        }
        .hero-mockup-sidebar-logo {
          margin-bottom: 16px;
        }
        .hero-mockup-nav-item {
          font-size: 11px;
          color: rgba(20,19,43,0.5);
          padding: 8px 8px;
          border-radius: 6px;
          margin-bottom: 4px;
          font-weight: 500;
        }
        .hero-mockup-nav-item.active {
          background: rgba(109,74,255,0.1);
          color: #6D4AFF;
          font-weight: 700;
        }

        .hero-mockup-main {
          flex: 1;
          padding: 18px 20px;
        }
        .hero-mockup-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          font-weight: 700;
          color: #14132B;
          margin-bottom: 16px;
        }
        .hero-mockup-pill {
          font-size: 10px;
          font-weight: 700;
          color: #10B981;
          background: rgba(16,185,129,0.1);
          padding: 3px 8px;
          border-radius: 999px;
        }
        .hero-mockup-stats {
          display: flex;
          gap: 10px;
          margin-bottom: 14px;
        }
        .hero-mockup-stat {
          flex: 1;
          background: #FAFAFC;
          border: 1px solid rgba(15,23,42,0.06);
          border-radius: 10px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .hero-mockup-stat-label {
          font-size: 9.5px;
          color: rgba(20,19,43,0.45);
          font-weight: 600;
        }
        .hero-mockup-stat-value {
          font-size: 18px;
          font-weight: 700;
          color: #14132B;
        }
        .hero-mockup-chart {
          margin-bottom: 14px;
        }
        .hero-mockup-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .hero-mockup-list-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .hero-mockup-avatar {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6D4AFF, #EC4899);
          flex-shrink: 0;
        }
        .hero-mockup-list-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .hero-mockup-list-text span:first-child {
          font-size: 11.5px;
          font-weight: 600;
          color: #14132B;
        }
        .hero-mockup-list-sub {
          font-size: 10px;
          color: rgba(20,19,43,0.45);
        }

        /* MARQUEE */
        .marquee-section {
          border-top: 1px solid rgba(15,23,42,0.08);
          border-bottom: 1px solid rgba(15,23,42,0.08);
          padding: 22px 0;
          overflow: hidden;
          background: #fff;
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 28s linear infinite;
        }
        .marquee-section:hover .marquee-track {
          animation-play-state: paused;
        }
        .marquee-group {
          display: flex;
          align-items: center;
        }
        .marquee-item {
          display: flex;
          align-items: center;
          font-family: 'Sora', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1.8px;
          color: rgba(20,19,43,0.35);
          white-space: nowrap;
          padding-right: 56px;
        }
        .marquee-item::after {
          content: "✦";
          color: rgba(109,74,255,0.35);
          font-size: 14px;
          margin-left: 56px;
        }

        /* FEATURES */
        .features-section {
          padding: 110px 32px 80px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .features-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 60px;
          flex-wrap: wrap;
          gap: 20px;
        }
        .eyebrow {
          display: inline-block;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #6D4AFF;
          margin-bottom: 12px;
        }
        .features-title {
          font-family: 'Sora', sans-serif;
          font-size: 36px;
          font-weight: 700;
          letter-spacing: -1px;
          color: #14132B;
          line-height: 1.15;
        }
        .features-desc {
          font-size: 14.5px;
          color: rgba(20,19,43,0.5);
          line-height: 1.7;
          max-width: 400px;
        }

        .bento-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .bento-card {
          position: relative;
          background: #fff;
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 16px;
          padding: 32px;
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
          overflow: hidden;
          isolation: isolate;
        }
        .bento-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 16px;
          opacity: 0;
          transition: opacity 0.3s;
          background: radial-gradient(
            600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(109, 74, 255, 0.06),
            transparent 40%
          );
          pointer-events: none;
          z-index: -1;
        }
        .bento-card:hover::before {
          opacity: 1;
        }
        .bento-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 32px -12px rgba(20, 19, 43, 0.15);
          border-color: rgba(109, 74, 255, 0.18);
        }

        .bento-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent-bg, rgba(109, 74, 255, 0.08));
          color: var(--accent, #6D4AFF);
          margin-bottom: 20px;
        }
        .bento-card-title {
          font-family: 'Sora', sans-serif;
          font-size: 17px;
          font-weight: 700;
          color: #14132B;
          margin-bottom: 8px;
        }
        .bento-card-desc {
          font-size: 13.5px;
          color: rgba(20, 19, 43, 0.55);
          line-height: 1.6;
        }

        /* HOW IT WORKS */
        .how-section {
          padding: 110px 32px;
          border-top: 1px solid rgba(15, 23, 42, 0.07);
          border-bottom: 1px solid rgba(15, 23, 42, 0.07);
          position: relative;
          overflow: hidden;
          background: #fff;
        }
        .how-container {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }
        .how-title {
          font-family: 'Sora', sans-serif;
          font-size: 36px;
          font-weight: 700;
          letter-spacing: -1px;
          color: #14132B;
          margin-bottom: 60px;
        }
        .how-steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
          position: relative;
        }
        .how-step {
          text-align: center;
          position: relative;
        }
        .how-step-num {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #14132B;
          color: #fff;
          font-family: 'Sora', sans-serif;
          font-weight: 700;
          font-size: 17px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          position: relative;
          z-index: 1;
        }
        .how-step-title {
          font-family: 'Sora', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #14132B;
          margin-bottom: 10px;
        }
        .how-step-desc {
          font-size: 13.5px;
          color: rgba(20, 19, 43, 0.55);
          line-height: 1.7;
        }

        /* STATEMENT */
        .statement-section {
          padding: 120px 32px;
          max-width: 900px;
          margin: 0 auto;
          text-align: center;
        }
        .statement-text {
          font-family: 'Sora', sans-serif;
          font-size: clamp(28px, 3.4vw, 40px);
          font-weight: 600;
          line-height: 1.35;
          letter-spacing: -0.5px;
          color: #14132B;
        }
        .statement-text em {
          font-style: normal;
          background: linear-gradient(135deg, #6D4AFF, #EC4899);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        /* CTA */
        .cta-section {
          padding: 0 32px 110px;
        }
        .cta-card {
          max-width: 1200px;
          margin: 0 auto;
          background: #14132B;
          border-radius: 20px;
          padding: 68px 56px;
          position: relative;
          overflow: hidden;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 30px;
          isolation: isolate;
        }
        .cta-glow {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(109,74,255,0.25), transparent 70%);
          top: -120px;
          right: -60px;
          z-index: 0;
        }
        .cta-glow-2 {
          width: 220px;
          height: 220px;
          bottom: -120px;
          left: -50px;
          top: auto;
          right: auto;
          background: radial-gradient(circle, rgba(236,72,153,0.18), transparent 70%);
        }

        .cta-content {
          position: relative;
          z-index: 1;
          max-width: 460px;
        }
        .cta-title {
          font-family: 'Sora', sans-serif;
          font-size: 30px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.5px;
          margin-bottom: 10px;
        }
        .cta-sub {
          font-size: 14px;
          color: rgba(255,255,255,0.55);
        }
        .btn-white {
          background: #fff;
          color: #14132B;
        }
        .btn-white:hover {
          background: #f2f2f2;
        }

        /* FOOTER */
        .footer {
          border-top: 1px solid rgba(15,23,42,0.08);
          padding: 56px 32px 36px;
          background: #fff;
        }
        .footer-inner {
          max-width: 1200px;
          margin: 0 auto;
        }
        .footer-grid {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 40px;
          margin-bottom: 48px;
        }
        .footer-brand {
          max-width: 300px;
        }
        .footer-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
        }
        .footer-tagline {
          font-size: 12px;
          color: rgba(20,19,43,0.45);
          font-weight: 700;
          margin-bottom: 10px;
          letter-spacing: 0.3px;
        }
        .footer-text {
          font-size: 13px;
          color: rgba(20,19,43,0.5);
          line-height: 1.7;
        }
        .footer-links {
          display: flex;
          gap: 60px;
          flex-wrap: wrap;
        }
        .footer-link-title {
          font-size: 11px;
          font-weight: 700;
          color: rgba(20,19,43,0.4);
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 16px;
        }
        .footer-link {
          color: rgba(20,19,43,0.55);
          text-decoration: none;
          font-size: 13.5px;
          transition: color 0.2s;
          display: block;
          margin-bottom: 10px;
        }
        .footer-link:hover {
          color: #14132B;
        }
        .footer-bottom {
          border-top: 1px solid rgba(15,23,42,0.08);
          padding-top: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }
        .footer-copy {
          font-size: 12px;
          color: rgba(20,19,43,0.4);
        }

        @media (max-width: 1024px) {
          .hero {
            min-height: auto;
            padding: 60px 32px;
          }
          .hero-container {
            grid-template-columns: 1fr;
          }
          .hero-visual {
            display: none;
          }
          .bento-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 700px) {
          .nav-inner {
            padding: 14px 20px;
          }
          .nav-links {
            gap: 20px;
          }
          .hero {
            padding: 50px 20px;
          }
          .bento-grid {
            grid-template-columns: 1fr;
          }
          .how-steps {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .footer-bottom {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <ScrollProgress />

      {/* Nav */}
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">
            <LogoMark size={32} />
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
              <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 16, color: "#14132B", letterSpacing: -0.3 }}>
                SECM
              </span>
              <span style={{ fontSize: 9.5, color: "rgba(20,19,43,0.4)", fontWeight: 600, letterSpacing: 1.2, textTransform: "uppercase" }}>
                Marketplace
              </span>
            </div>
          </Link>

          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how" className="nav-link">How it works</a>
            <Link href="/login" className="nav-link">Log in</Link>
            <Link href="/register" className="btn-primary">
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-container">
          <div>
            <Reveal delay={0}>
              <span className="hero-badge">
                <IconSparkle /> Built for hackathons & coding contests
              </span>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="hero-title">
                Where organizers post challenges,{" "}
                <span className="text-gradient">students show up to win.</span>
              </h1>
            </Reveal>

            <Reveal delay={140}>
              <p className="hero-subtitle">
                SECM is a marketplace for skill-based competition —
                post a challenge, form a team, submit your work, and get scored
                by a real organizer, start to finish.
              </p>
            </Reveal>

            <Reveal delay={200}>
              <div className="hero-actions">
                <Link href="/register" className="btn-primary">
                  Get Started Free <IconArrow />
                </Link>
                <Link href="/login" className="btn-link">
                  Log in <IconArrow />
                </Link>
              </div>
            </Reveal>
          </div>

          <div className="hero-visual">
            <div className="hero-blob hero-blob-1" />
            <div className="hero-blob hero-blob-2" />
            <div className="hero-blob hero-blob-3" />

            <div className="hero-mockup">
              <div className="hero-mockup-topbar">
                <div className="hero-mockup-dot" style={{ background: "#FF5F57" }} />
                <div className="hero-mockup-dot" style={{ background: "#FEBC2E" }} />
                <div className="hero-mockup-dot" style={{ background: "#28C840" }} />
              </div>
              <div className="hero-mockup-body">
                <div className="hero-mockup-sidebar">
                  <div className="hero-mockup-sidebar-logo">
                    <LogoMark size={20} />
                  </div>
                  {["Discover", "My Challenges", "Submissions", "Leaderboard", "Messages"].map((item, i) => (
                    <div key={item} className={`hero-mockup-nav-item ${i === 0 ? "active" : ""}`}>
                      {item}
                    </div>
                  ))}
                </div>
                <div className="hero-mockup-main">
                  <div className="hero-mockup-header">
                    <span>Dashboard</span>
                    <div className="hero-mockup-pill">Live now</div>
                  </div>
                  <div className="hero-mockup-stats">
                    <div className="hero-mockup-stat">
                      <span className="hero-mockup-stat-label">Active challenges</span>
                      <span className="hero-mockup-stat-value">12</span>
                    </div>
                    <div className="hero-mockup-stat">
                      <span className="hero-mockup-stat-label">Submissions</span>
                      <span className="hero-mockup-stat-value">86</span>
                    </div>
                  </div>
                  <div className="hero-mockup-chart">
                    <svg viewBox="0 0 300 80" width="100%" height="80" preserveAspectRatio="none">
                      <polyline
                        points="0,60 40,45 80,50 120,30 160,38 200,15 240,25 300,10"
                        fill="none"
                        stroke="#6D4AFF"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="hero-mockup-list">
                    <div className="hero-mockup-list-item">
                      <div className="hero-mockup-avatar" />
                      <div className="hero-mockup-list-text">
                        <span>Team Nova submitted</span>
                        <span className="hero-mockup-list-sub">Design Sprint · 2m ago</span>
                      </div>
                    </div>
                    <div className="hero-mockup-list-item">
                      <div className="hero-mockup-avatar" />
                      <div className="hero-mockup-list-text">
                        <span>Winner announced</span>
                        <span className="hero-mockup-list-sub">Code Sprint · 1h ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee strip */}
      <div className="marquee-section">
        <div className="marquee-track">
          {[0, 1].map((dup) => (
            <div key={dup} className="marquee-group">
              {["HACKATHONS", "CODING CONTESTS", "DESIGN CHALLENGES", "IDEA PITCHING", "TEAM SUBMISSIONS", "LIVE LEADERBOARDS"].map((t) => (
                <span key={`${t}-${dup}`} className="marquee-item">
                  {t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Features Bento Grid */}
      <section id="features" className="features-section">
        <div className="features-header">
          <Reveal>
            <div>
              <span className="eyebrow">Why SECM</span>
              <h2 className="features-title">
                Everything the process needs —<br />nothing it doesn’t.
              </h2>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <p className="features-desc">
              Nine pieces that cover the whole lifecycle of a challenge, from
              the first post to the final score.
            </p>
          </Reveal>
        </div>

        <div className="bento-grid">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 60}>
              <div
                className="bento-card"
                style={{
                  "--accent": f.accent,
                  "--accent-bg": `${f.accent}14`,
                } as React.CSSProperties}
                onMouseMove={handleFeatureMouseMove}
              >
                <div className="bento-icon">
                  <f.Icon />
                </div>
                <h3 className="bento-card-title">{f.title}</h3>
                <p className="bento-card-desc">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="how-section">
        <div className="how-container">
          <Reveal>
            <span className="eyebrow">How it works</span>
            <h2 className="how-title">Three steps in.</h2>
          </Reveal>

          <div className="how-steps">
            {STEPS.map((s, i) => (
              <Reveal key={s.num} delay={i * 120}>
                <div className="how-step">
                  <div className="how-step-num">{s.num}</div>
                  <h3 className="how-step-title">{s.title}</h3>
                  <p className="how-step-desc">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Statement */}
      <section className="statement-section">
        <Reveal>
          <p className="statement-text">
            Built so a college can run its first hackathon without spreadsheets,
            and a student can build a real track record —{" "}
            <em>one win at a time.</em>
          </p>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <Reveal>
          <div className="cta-card">
            <div className="cta-glow" />
            <div className="cta-glow cta-glow-2" />

            <div className="cta-content">
              <h2 className="cta-title">Start your first challenge today.</h2>
              <p className="cta-sub">
                Free for students and organizers. No credit card, no waitlist.
              </p>
            </div>

            <Link href="/register" className="btn-primary btn-white">
              Create your account <IconArrow />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <LogoMark size={28} />
                <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 15, color: "#14132B" }}>
                  SECM
                </span>
              </div>
              <p className="footer-tagline">Skill, Experience & Contest Marketplace</p>
              <p className="footer-text">
                A platform where organizers and organizations post challenges,
                and students compete, submit, and win.
              </p>
            </div>

            <div className="footer-links">
              <div>
                <p className="footer-link-title">Contact</p>
                <a href="mailto:help.secm@gmail.com" className="footer-link">
                  help.secm@gmail.com
                </a>
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
            <p className="footer-copy">
              © {new Date().getFullYear()} SECM — Skill, Experience & Contest
              Marketplace. All rights reserved. Built by Pradip Mishra & Anish
              Subedi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}