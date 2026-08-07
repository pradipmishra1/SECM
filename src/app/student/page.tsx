import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import LogoutButton from "@/components/LogoutButton";

export default async function StudentDashboard() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if ((user as any).role !== "STUDENT") redirect("/login");

  return (
    <div style={{ padding: 40 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Student Dashboard</h1>
        <LogoutButton />
      </div>
      <p>Welcome, {user.name}! Challenge browsing and profile coming next.</p>
    </div>
  );
}