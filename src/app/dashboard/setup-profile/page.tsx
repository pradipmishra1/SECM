import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function SetupProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const user = session.user as any;

  if (user.role === "ORGANIZER") {
    const existing = await prisma.organizerProfile.findUnique({ where: { userId: user.id } });
    if (!existing) {
      await prisma.organizerProfile.create({
        data: { userId: user.id, orgName: user.name, isVerified: true },
      });
    }
  } else if (user.role === "STUDENT") {
    const existing = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
    if (!existing) {
      await prisma.studentProfile.create({ data: { userId: user.id } });
    }
  }

  redirect("/dashboard");
}