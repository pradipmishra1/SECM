import { prisma } from "@/lib/prisma";

export async function getAccountStatus(userId: string): Promise<"ACTIVE" | "SUSPENDED" | "DELETED"> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { status: true } });
  return (user?.status as any) || "ACTIVE";
}