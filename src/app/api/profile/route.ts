import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const user = session.user as any;
  const body = await req.json();

  try {
   if (user.role === "STUDENT") {
  const dataFields = {
    education: body.education ?? undefined,
    bio: body.bio ?? undefined,
    skills: Array.isArray(body.skills) ? body.skills : [],
    interests: Array.isArray(body.interests) ? body.interests : [],
    portfolioUrl: body.portfolioUrl ?? undefined,
    bannerText: body.bannerText ?? undefined,
  };
  const updated = await prisma.studentProfile.upsert({
    where: { userId: user.id },
    update: dataFields,
    create: { userId: user.id, ...dataFields },
  });
  console.log("Saved studentProfile:", updated);
} else if (user.role === "ORGANIZER") {
  await prisma.organizerProfile.upsert({
    where: { userId: user.id },
    update: { orgName: body.orgName, description: body.bio },
    create: { userId: user.id, orgName: body.orgName || user.name, description: body.bio, isVerified: false },
  });
}

    if (body.avatar) {
      await prisma.user.update({ where: { id: user.id }, data: { image: body.avatar } });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Profile save error:", err);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}