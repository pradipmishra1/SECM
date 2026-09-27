import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const user = session.user as any;

  const account = await prisma.account.findFirst({
    where: { userId: user.id, providerId: "github" },
  });
  if (!account?.accessToken) {
    return NextResponse.json({ error: "No GitHub account linked" }, { status: 400 });
  }

  const res = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${account.accessToken}`, "User-Agent": "SECM-App" },
  });
  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch GitHub profile" }, { status: 500 });
  }
  const ghUser = await res.json();
  const githubUrl = ghUser.html_url as string;

  if (user.role === "STUDENT") {
    await prisma.studentProfile.upsert({
      where: { userId: user.id },
      update: { githubUrl },
      create: { userId: user.id, githubUrl },
    });
  } else if (user.role === "ORGANIZER") {
    await prisma.organizerProfile.upsert({
      where: { userId: user.id },
      update: { githubUrl },
      create: { userId: user.id, orgName: user.name, githubUrl, isVerified: false },
    });
  }

  return NextResponse.json({ githubUrl, username: ghUser.login });
}