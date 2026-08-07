import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/DashboardLayout";
import AnnouncementsManager from "@/components/AnnouncementsManager";

export default async function AnnouncementsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const user = session.user as any;

  if (user.role !== "ORGANIZER") redirect("/dashboard");

  const organizerProfile = await prisma.organizerProfile.findUnique({ where: { userId: user.id } });
  if (!organizerProfile) redirect("/dashboard/setup-profile");

  const myAnnouncements = await prisma.announcement.findMany({
    where: { organizerId: organizerProfile.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardLayout role={user.role} userName={user.name}>
      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 700, color: "#14132B", marginBottom: 6 }}>
        Announcements
      </h1>
      <p style={{ color: "rgba(20,19,43,0.5)", fontSize: 14, marginBottom: 24 }}>
        Post updates that all students will see in their notification bell.
      </p>
      <AnnouncementsManager announcements={JSON.parse(JSON.stringify(myAnnouncements))} />
    </DashboardLayout>
  );
}