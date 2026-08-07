import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import LogoutButton from "@/components/LogoutButton";
import ChallengeForm from "@/components/ChallengeForm";
import ChallengeList from "@/components/ChallengeList";

export default async function OrganizerDashboard() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if ((user as any).role !== "ORGANIZER") redirect("/login");

  return (
    <div style={{ padding: 40, maxWidth: 800, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1>Organizer Dashboard</h1>
        <LogoutButton />
      </div>
      <p style={{ marginBottom: 24 }}>Welcome, {user.name}!</p>

      <h2 style={{ marginBottom: 12 }}>Create a Challenge</h2>
      <ChallengeForm />

      <h2 style={{ marginTop: 40, marginBottom: 12 }}>Your Challenges</h2>
      <ChallengeList />
    </div>
  );
}