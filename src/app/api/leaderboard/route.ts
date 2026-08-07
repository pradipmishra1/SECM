import { NextRequest, NextResponse } from "next/server";
import { computeLeaderboard } from "@/lib/leaderboard";

export async function GET(req: NextRequest) {
  const challengeId = req.nextUrl.searchParams.get("challengeId") || undefined;
  const board = await computeLeaderboard(challengeId);
  return NextResponse.json({ board });
}