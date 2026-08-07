"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Icon } from "./icons";
import NotificationBell from "./NotificationBell";

type NavItem = { label: string; href: string; icon: keyof typeof Icon };
type NavGroup = { label: string; items: NavItem[] };

const NAV_BY_ROLE: Record<string, NavGroup[]> = {
  STUDENT: [
    {
      label: "Main",
      items: [
        { label: "Discover", href: "/dashboard", icon: "home" },
        { label: "Messages", href: "/dashboard/messages", icon: "inbox" },
      ],
    },
    {
      label: "Challenges",
      items: [
        { label: "My Challenges", href: "/dashboard/my-challenges", icon: "clipboard" },
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
      ],
    },
  ],
};

export default function DashboardLayout({
  children,
  role,
  userName,
}: {
  children: React.ReactNode;
  role: string;
  userName: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const groups = NAV_BY_ROLE[role] || NAV_BY_ROLE.STUDENT;

  async function handleLogout() {
    await authClient.signOut();
    router.push("/login");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F6F5FB", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .sidebar-scroll::-webkit-scrollbar { width: 0px; background: transparent; }
        .sidebar-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        .nav-item { transition: background 0.15s ease, color 0.15s ease; }
        .nav-item:hover:not(.nav-active) { background: rgba(20,19,43,0.04); }
        .nav-active { background: #6D4AFF; }
        .logout-btn { transition: background 0.15s ease, color 0.15s ease; }
        .logout-btn:hover { background: rgba(220,38,38,0.08); color: #DC2626 !important; }
      `}</style>

      <aside
        className="sidebar-scroll"
        style={{
          width: 248,
          background: "#FFFFFF",
          borderRight: "1px solid rgba(15,23,42,0.06)",
          padding: "24px 16px",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 6px", marginBottom: 28 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: "#6D4AFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              fontFamily: "'Sora', sans-serif",
            }}
          >
            S
          </div>
          <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 17, color: "#14132B" }}>SECM</span>
        </div>

        {groups.map((group) => (
          <div key={group.label} style={{ marginBottom: 20 }}>
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                color: "rgba(20,19,43,0.35)",
                textTransform: "uppercase",
                letterSpacing: 0.6,
                padding: "0 10px",
                marginBottom: 6,
                display: "block",
              }}
            >
              {group.label}
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {group.items.map((item) => {
                const active = pathname === item.href;
                const IconComp = Icon[item.icon];
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={"nav-item" + (active ? " nav-active" : "")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "9px 10px",
                      borderRadius: 10,
                      textDecoration: "none",
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: active ? "#fff" : "rgba(20,19,43,0.6)",
                    }}
                  >
                    <IconComp width={16} height={16} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        <div style={{ marginTop: "auto", borderTop: "1px solid rgba(15,23,42,0.06)", paddingTop: 12 }}>
          <button
            className="logout-btn"
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 10px",
              borderRadius: 10,
              border: "none",
              background: "transparent",
              color: "rgba(20,19,43,0.45)",
              fontSize: 13.5,
              fontWeight: 600,
              cursor: "pointer",
              textAlign: "left",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <Icon.logout width={16} height={16} />
            Log out
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 36px",
            borderBottom: "1px solid rgba(15,23,42,0.07)",
            background: "#FFFFFF",
          }}
        >
          <div style={{ position: "relative", width: 360 }}>
            <Icon.search
              width={15}
              height={15}
              style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(20,19,43,0.3)" }}
            />
            <input
              placeholder="Search challenges, teams, events..."
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
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <NotificationBell />
            <div onClick={() => router.push("/dashboard/profile")} style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }}>
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
              <span style={{ fontSize: 13.5, fontWeight: 600, color: "#14132B" }}>{userName}</span>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: 36 }}>{children}</main>
      </div>
    </div>
  );
}