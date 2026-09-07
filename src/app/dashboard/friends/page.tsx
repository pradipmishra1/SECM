import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import DashboardLayout from "@/components/DashboardLayout";
import FriendsManager from "@/components/FriendsManager";

export default async function FriendsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const user = session.user as any;
  const { tab } = await searchParams;
  const initialTab = ["requests", "friends", "followers", "following"].includes(tab || "")
    ? (tab as "requests" | "friends" | "followers" | "following")
    : undefined;
  return (
    <DashboardLayout role={user.role} userName={user.name} userImage={user.image}>
      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 700, color: "#14132B", marginBottom: 6 }}>
        Friends
      </h1>
      <p style={{ color: "rgba(20,19,43,0.5)", fontSize: 14, marginBottom: 24 }}>
        Manage friend requests and message your friends directly.
      </p>
      <FriendsManager initialTab={initialTab} />
    </DashboardLayout>
  );
}