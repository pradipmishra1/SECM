import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// Simple in-memory store: { "userId-otherUserId": timestamp }
const typingMap = new Map<string, number>();
const TYPING_TIMEOUT = 4000;

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const userId = (session.user as any).id;
  const { toUserId } = await req.json();
  typingMap.set(`${userId}->${toUserId}`, Date.now());
  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const userId = (session.user as any).id;
  const otherUserId = req.nextUrl.searchParams.get("otherUserId");
  if (!otherUserId) return NextResponse.json({ typing: false });

  const key = `${otherUserId}->${userId}`;
  const last = typingMap.get(key);
  const typing = !!last && Date.now() - last < TYPING_TIMEOUT;
  return NextResponse.json({ typing });
}