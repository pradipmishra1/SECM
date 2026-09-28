"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Icon } from "./icons";
import { useEffect, useRef } from "react";
import NotificationsPanel from "./NotificationsPanel";
import { LogoMark } from "./Logo";

type NavItem = { label: string; href: string; icon: keyof typeof Icon };
type NavGroup = { label: string; items: NavItem[] };

const NAV_BY_ROLE: Record<string, NavGroup[]> = {
  STUDENT: [
    {
      label: "Main",
      items: [
        { label: "Discover", href: "/dashboard", icon: "home" },
        { label: "Messages", href: "/dashboard/messages", icon: "inbox" },
        { label: "Friends", href: "/dashboard/friends", icon: "users" },
      ],
    },
    {
      label: "Challenges",
           items: [
        { label: "Challenges", href: "/dashboard/my-challenges", icon: "clipboard" },
        { label: "My Teams", href: "/dashboard/teams", icon: "users" },
        { label: "My Submissions", href: "/dashboard/submissions", icon: "upload" },
        { label: "My Wins", href: "/dashboard/wins", icon: "trophy" },
        { label: "Leaderboard", href: "/dashboard/leaderboard", icon: "trophy" },
      ],
    },
    {
      label: "Account",
      items: [{ label: "Profile", href: "/dashboard/profile", icon: "user" }],
    },
  ],
  ORGANIZER: [
    {
      label: "Main",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: "home" },
        { label: "Messages", href: "/dashboard/messages", icon: "inbox" },
        { label: "Friends", href: "/dashboard/friends", icon: "users" },
      ],
    },
    {
      label: "Challenges",
      items: [
        { label: "My Challenges", href: "/dashboard/my-challenges", icon: "clipboard" },
        { label: "Create New", href: "/dashboard/create", icon: "plus" },
        { label: "Submissions", href: "/dashboard/review", icon: "inbox" },
        { label: "Winners", href: "/dashboard/winners", icon: "trophy" },
        { label: "Leaderboard", href: "/dashboard/leaderboard", icon: "trophy" },
        { label: "Analytics", href: "/dashboard/analytics", icon: "clipboard" },
        { label: "Announcements", href: "/dashboard/announcements", icon: "inbox" },
      ],
    },
    {
      label: "Account",
      items: [{ label: "Profile", href: "/dashboard/profile", icon: "user" }],
    },
  ],


  ADMIN: [
    {
      label: "Main",
      items: [{ label: "Overview", href: "/dashboard", icon: "home" }],
    },
    {
      label: "Manage",
      items: [
        { label: "Verify Organizers", href: "/dashboard/verify", icon: "users" },
        { label: "Manage Users", href: "/dashboard/users", icon: "user" },
        { label: "All Challenges", href: "/dashboard/all-challenges", icon: "clipboard" },
        { label: "All Winners", href: "/dashboard/all-winners", icon: "trophy" },
        { label: "Support Messages", href: "/dashboard/support-messages", icon: "help" },
      ],
    },
  ],
};

export default function DashboardLayout({
  children,
  role,
  userName,
  userImage,
  emailVerified,
  userEmail,
}: {
  children: React.ReactNode;
  role: string;
  userName: string;
  userImage?: string | null;
  emailVerified?: boolean;
  userEmail?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const groups = NAV_BY_ROLE[role] || NAV_BY_ROLE.STUDENT;
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [resendError, setResendError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    challenges: { id: string; title: string; type: string }[];
    users: { id: string; name: string; username: string; image?: string | null }[];
  } | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data);
        setSearchOpen(true);
      } catch (err) {
        console.error("Search failed:", err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await authClient.signOut();
    router.push("/login");
  }

  async function handleResendVerification() {
    if (!userEmail || resending) return;
    setResending(true);
    setResendError("");
    try {
      const result = await authClient.sendVerificationEmail({
        email: userEmail,
        callbackURL: "/dashboard",
      });
      if (result?.error) {
        console.error("Resend verification error:", result.error);
        setResendError(result.error.message || "Failed to send. Try again.");
      } else {
        setResent(true);
        setTimeout(() => setResent(false), 5000);
      }
    } catch (err) {
      console.error("Failed to resend verification email:", err);
      setResendError("Something went wrong. Try again.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="dashboard-shell" style={{ display: "flex", minHeight: "100vh", background: "#F5F5F8", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .sidebar-scroll::-webkit-scrollbar { width: 0px; background: transparent; }
        .sidebar-scroll { scrollbar-width: none; -ms-overflow-style: none; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .nav-box {
          position: relative;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 13px 16px;
          border-radius: 14px;
          text-decoration: none;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: -0.1px;
          color: #4B4B60;
          background: transparent;
          border: 1px solid transparent;
          transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
          animation: fadeUp 0.35s ease both;
        }

        .nav-box:hover:not(.nav-box-active) {
          background: #FFFFFF;
          border-color: rgba(15,23,42,0.06);
          color: #14132B;
          box-shadow: 0 2px 6px rgba(20,19,43,0.05);
          transform: translateY(-1px);
        }

        .nav-box svg { flex-shrink: 0; transition: opacity 0.15s ease; }

        .nav-box-active {
          background: linear-gradient(100deg, #C9BEFF 0%, #DCD4FF 45%, #EFEBFF 100%);
          color: #3B2E8A;
          font-weight: 800;
          box-shadow: 0 4px 14px rgba(141,116,255,0.28), inset 0 0 0 1px rgba(141,116,255,0.25);
        }
        .nav-box-active .icon-wrap { color: #5B3FE0; }

        .icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(20,19,43,0.42);
          transition: color 0.15s ease, transform 0.15s ease;
        }
        .nav-box:hover:not(.nav-box-active) .icon-wrap { color: #6D4AFF; transform: scale(1.08); }

        .logout-box:hover {
          background: rgba(220,38,38,0.06) !important;
          border-color: rgba(220,38,38,0.15) !important;
          color: #DC2626 !important;
        }
        .logout-box:hover .icon-wrap { color: #DC2626 !important; }

        @media (max-width: 900px) {
          .dashboard-shell { flex-direction: column; }
          .dashboard-sidebar {
            width: 100% !important;
            height: auto !important;
            min-height: 0;
            position: sticky !important;
            z-index: 30;
            top: 0;
            padding: 12px 16px 8px !important;
            border-right: 0 !important;
            border-bottom: 1px solid rgba(15,23,42,0.08);
            overflow: visible !important;
          }
          .dashboard-brand-divider, .dashboard-sidebar-logout { display: none !important; }
          .dashboard-nav-groups {
            display: flex !important;
            flex-direction: row !important;
            gap: 10px !important;
            margin-top: 10px;
            overflow-x: auto;
            overscroll-behavior-x: contain;
            scrollbar-width: none;
            padding: 0 0 3px;
          }
          .dashboard-nav-groups::-webkit-scrollbar { display: none; }
          .dashboard-nav-group { flex: 0 0 auto; }
          .dashboard-nav-group > span { display: none !important; }
          .dashboard-nav-items { flex-direction: row !important; gap: 6px !important; }
          .dashboard-nav-items .nav-box { padding: 9px 11px; font-size: 13px; gap: 8px; border-radius: 11px; }
          .dashboard-header { padding: 12px 18px !important; gap: 12px; }
          .dashboard-header-search { width: min(360px, 46vw) !important; }
          .dashboard-header-tools { gap: 10px !important; }
          .dashboard-user-name { display: none; }
          .dashboard-main-content { padding: 24px 20px !important; }
        }

        @media (max-width: 520px) {
          .dashboard-sidebar { padding: 10px 12px 7px !important; }
          .dashboard-header { padding: 10px 12px !important; }
          .dashboard-header-search { width: auto !important; flex: 1; min-width: 0; }
          .dashboard-header-tools { gap: 6px !important; }
          .dashboard-header-tools > a, .dashboard-header-tools > button { flex: 0 0 auto; }
          .dashboard-main-content { padding: 18px 12px !important; }
        }
      `}</style>

      <aside
        className="sidebar-scroll dashboard-sidebar"
        style={{
          width: 280,
          background: "#FAFAFC",
          borderRight: "1px solid rgba(15,23,42,0.07)",
          padding: "26px 16px",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "2px 8px", marginBottom: 8 }}>
          <LogoMark size={34} />
          <span
            style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 800,
              fontSize: 20,
              letterSpacing: -0.3,
              color: "#14132B",
            }}
          >
            SECM
          </span>
        </div>

        <div className="dashboard-brand-divider" style={{ height: 1, background: "rgba(15,23,42,0.06)", margin: "18px 4px 22px" }} />

        {/* Nav groups */}
        <div className="dashboard-nav-groups" style={{ display: "flex", flexDirection: "column", gap: 24, flex: 1 }}>
          {groups.map((group) => (
            <div key={group.label} className="dashboard-nav-group">
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "rgba(20,19,43,0.36)",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  padding: "0 10px",
                  marginBottom: 8,
                  display: "block",
                }}
              >
                {group.label}
              </span>
              <div className="dashboard-nav-items" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {group.items.map((item, i) => {
                  const active = pathname === item.href;
                  const IconComp = Icon[item.icon];
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={"nav-box" + (active ? " nav-box-active" : "")}
                      style={{ animationDelay: `${i * 0.03}s` }}
                    >
                      <span className="icon-wrap">
                        <IconComp width={21} height={21} />
                      </span>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Logout */}
        <div className="dashboard-sidebar-logout" style={{ marginTop: 20 }}>
          <div style={{ height: 1, background: "rgba(15,23,42,0.06)", margin: "0 4px 12px" }} />
          <button
            className="nav-box logout-box"
            onClick={handleLogout}
            style={{
              width: "100%",
              cursor: "pointer",
              textAlign: "left",
              fontFamily: "'Inter', sans-serif",
              color: "rgba(20,19,43,0.55)",
            }}
          >
            <span className="icon-wrap">
              <Icon.logout width={21} height={21} />
            </span>
            Log out
          </button>
        </div>
      </aside>

      <div className="dashboard-main" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header
          className="dashboard-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 36px",
            borderBottom: "1px solid rgba(15,23,42,0.07)",
            background: "#FFFFFF",
          }}
        >
          <div ref={searchBoxRef} className="dashboard-header-search" style={{ position: "relative", width: 360 }}>
            <Icon.search
              width={15}
              height={15}
              style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(20,19,43,0.3)" }}
            />
            <input
              placeholder="Search challenges, users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults && setSearchOpen(true)}
              style={{
                width: "100%",
                padding: "9px 14px 9px 38px",
                borderRadius: 10,
                border: "1px solid rgba(15,23,42,0.08)",
                background: "#F6F5FB",
                fontSize: 13.5,
                fontFamily: "'Inter', sans-serif",
                outline: "none",
                color: "#14132B",
              }}
            />

            {searchOpen && searchResults && (searchResults.challenges.length > 0 || searchResults.users.length > 0) && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  left: 0,
                  width: "100%",
                  background: "#fff",
                  borderRadius: 12,
                  border: "1px solid rgba(15,23,42,0.08)",
                  boxShadow: "0 12px 32px rgba(20,19,43,0.12)",
                  overflow: "hidden",
                  zIndex: 50,
                }}
              >
                {searchResults.challenges.length > 0 && (
                  <div style={{ padding: "8px 0" }}>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(20,19,43,0.35)", textTransform: "uppercase", letterSpacing: 0.6, padding: "0 14px" }}>
                      Challenges
                    </span>
                    {searchResults.challenges.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery("");
                          router.push(`/dashboard/challenge/${c.id}`);
                        }}
                        style={{ padding: "8px 14px", cursor: "pointer", fontSize: 13, color: "#14132B" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#F6F5FB")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        {c.title}
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.users.length > 0 && (
                  <div style={{ padding: "8px 0", borderTop: searchResults.challenges.length > 0 ? "1px solid rgba(15,23,42,0.06)" : "none" }}>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(20,19,43,0.35)", textTransform: "uppercase", letterSpacing: 0.6, padding: "0 14px" }}>
                      Users
                    </span>
                    {searchResults.users.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery("");
                          router.push(`/dashboard/u/${u.username}`);
                        }}
                        style={{ padding: "8px 14px", cursor: "pointer", fontSize: 13, color: "#14132B", display: "flex", alignItems: "center", gap: 8 }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#F6F5FB")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        {u.name} <span style={{ color: "rgba(20,19,43,0.4)" }}>@{u.username}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
                    <div className="dashboard-header-tools" style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              onClick={() => router.push("/dashboard/help")}
              title="Help Center"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "rgba(20,19,43,0.5)",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(15,23,42,0.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Icon.help width={19} height={19} />
            </div>
                        <NotificationsPanel />
            <div onClick={() => router.push("/dashboard/profile")} style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }}>
              {userImage ? (
                <img
                  src={userImage}
                  alt={userName}
                  style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #6D4AFF, #8B5CF6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 12.5,
                    fontFamily: "'Sora', sans-serif",
                  }}
                >
                  {userName?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <span className="dashboard-user-name" style={{ fontSize: 13.5, fontWeight: 600, color: "#14132B" }}>{userName}</span>
            </div>
          </div>
        </header>

        <main className="dashboard-main-content" style={{ flex: 1, padding: 36 }}>
          {emailVerified === false && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 12, padding: "12px 18px", marginBottom: 20, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: "#92400E", fontWeight: 600 }}>
                Please verify your email — check your inbox for a verification link.
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                {resendError && <span style={{ fontSize: 12, color: "#DC2626" }}>{resendError}</span>}
                <button
                  onClick={handleResendVerification}
                  disabled={resending || resent}
                  style={{
                    background: resent ? "rgba(22,163,74,0.1)" : "#fff",
                    color: resent ? "#15803D" : "#92400E",
                    border: "1px solid " + (resent ? "rgba(22,163,74,0.3)" : "rgba(245,158,11,0.35)"),
                    borderRadius: 8,
                    padding: "7px 14px",
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: resending || resent ? "default" : "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {resent ? "✓ Sent!" : resending ? "Sending..." : "Resend verification link"}
                </button>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
