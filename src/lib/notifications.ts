import { prisma } from "@/lib/prisma";

type NotificationType =
  | "TEAM_INVITE"
  | "TEAM_INVITE_ACCEPTED"
  | "SUBMISSION_REVIEWED"
  | "WINNER_ANNOUNCED"
  | "ORGANIZER_VERIFIED"
  | "ACCOUNT_STATUS_CHANGE";

export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
}: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}) {
  return prisma.notification.create({
    data: { userId, type, title, message, link },
  });
}