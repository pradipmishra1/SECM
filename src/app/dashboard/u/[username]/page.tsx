import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import DashboardLayout from "@/components/DashboardLayout";
import { ProfileContent } from "@/components/ProfileModal";

async function getProfile(username: string, cookieHeader: string) {
  const res = await fetch(`${process.env.BETTER_AUTH_URL}/api/users/${username}`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const user = session.user as any;
  const cookieHeader = (await headers()).get("cookie") || "";
  const profile = await getProfile(username, cookieHeader);

  return (
    <DashboardLayout role={user.role} userName={user.name} userImage={user.image}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(20,19,43,0.5)", textDecoration: "none", marginBottom: 16 }}>
          ← Back
        </Link>
        <div style={{ background: "#fff", borderRadius: 24, overflow: "hidden", boxShadow: "0 4px 20px rgba(20,19,43,0.08)", border: "1px solid rgba(15,23,42,0.06)" }}>
          {!profile ? (
            <div style={{ padding: 70, textAlign: "center", color: "rgba(20,19,43,0.4)", fontSize: 14 }}>Loading...</div>
          ) : profile.error ? (
            <div style={{ padding: 50, textAlign: "center" }}>
              <p style={{ color: "rgba(20,19,43,0.5)", fontSize: 14 }}>User not found.</p>
            </div>
          ) : profile.status && profile.status !== "ACTIVE" ? (
            <div style={{ padding: 50, textAlign: "center" }}>
              <p style={{ color: "rgba(20,19,43,0.6)", fontSize: 14, fontWeight: 600 }}>
                {profile.status === "SUSPENDED" ? "This account is on hold" : "This account has been deleted"}
              </p>
            </div>
          ) : (
            <ProfileContent profile={profile} fullPage />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}