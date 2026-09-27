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
    if (body.username && body.username !== user.username) {
      const cleanUsername = body.username.trim().toLowerCase();
      if (!/^[a-z0-9_]{3,20}$/.test(cleanUsername)) {
        return NextResponse.json({ error: "Username must be 3-20 characters, letters/numbers/underscore only" }, { status: 400 });
      }
      const existing = await prisma.user.findUnique({ where: { username: cleanUsername } });
      if (existing && existing.id !== user.id) {
        return NextResponse.json({ error: "That username is already taken" }, { status: 400 });
      }
      await prisma.user.update({ where: { id: user.id }, data: { username: cleanUsername } });
    }

    if (body.name && body.name.trim() && body.name.trim() !== user.name) {
      await prisma.user.update({ where: { id: user.id }, data: { name: body.name.trim() } });
    }


   if (user.role === "STUDENT") {
  const dataFields = {
    education: body.education ?? undefined,
    bio: body.bio ?? undefined,
    skills: Array.isArray(body.skills) ? body.skills : [],
    interests: Array.isArray(body.interests) ? body.interests : [],
    portfolioUrl: body.portfolioUrl ?? undefined,
    githubUrl: body.githubUrl ?? undefined,
    linkedinUrl: body.linkedinUrl ?? undefined,
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
    update: { orgName: body.orgName, description: body.bio, githubUrl: body.githubUrl ?? undefined, linkedinUrl: body.linkedinUrl ?? undefined },
    create: { userId: user.id, orgName: body.orgName || user.name, description: body.bio, isVerified: false, githubUrl: body.githubUrl ?? undefined, linkedinUrl: body.linkedinUrl ?? undefined },
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