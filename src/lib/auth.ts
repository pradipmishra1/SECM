import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
  additionalFields: {
    role: {
      type: "string",
      required: true,
      defaultValue: "STUDENT",
    },
    username: {
      type: "string",
      required: false,
    },
    status: {
      type: "string",
      required: false,
      defaultValue: "ACTIVE",
    },
  },
},
  databaseHooks: {
    user: {
      create: {
        before: async (user: any) => {
          const base = user.name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12) || "user";
          let username = "";
          let attempts = 0;
          while (attempts < 10) {
            const suffix = Math.floor(10000 + Math.random() * 90000);
            username = `${base}${suffix}`;
            const existing = await prisma.user.findUnique({ where: { username } });
            if (!existing) break;
            attempts++;
          }
          return { data: { ...user, username } };
        },
        after: async (user: any) => {
          if (user.role === "STUDENT") {
            await prisma.studentProfile.create({
              data: { userId: user.id },
            });
         } else if (user.role === "ORGANIZER") {
            await prisma.organizerProfile.create({
              data: {
                userId: user.id,
                orgName: user.name,
                isVerified: false,
              },
            });
          }
        },
      },
    },
  },
});