import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import nodemailer from "nodemailer";
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await transporter.sendMail({
        from: `"SECM" <${process.env.GMAIL_USER}>`,
        to: user.email,
        subject: "Verify your SECM account",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
            <h2 style="color:#14132B; margin-bottom: 8px;">Verify your email</h2>
            <p style="color:#555; font-size:14px; line-height:1.6;">
              Welcome to SECM! Click the button below to verify your email address and activate your account.
            </p>
            <a href="${url}" style="display:inline-block; margin-top:16px; background:#6D4AFF; color:#fff; text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:600; font-size:14px;">
              Verify Email
            </a>
            <p style="color:#999; font-size:12px; margin-top:24px;">
              If you didn't create this account, you can safely ignore this email.
            </p>
          </div>
        `,
      });
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await transporter.sendMail({
        from: `"SECM" <${process.env.GMAIL_USER}>`,
        to: user.email,
        subject: "Reset your SECM password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
            <h2 style="color:#14132B; margin-bottom: 8px;">Reset your password</h2>
            <p style="color:#555; font-size:14px; line-height:1.6;">
              We received a request to reset your SECM account password. Click the button below to choose a new one. This link expires in 1 hour.
            </p>
            <a href="${url}" style="display:inline-block; margin-top:16px; background:#6D4AFF; color:#fff; text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:600; font-size:14px;">
              Reset Password
            </a>
            <p style="color:#999; font-size:12px; margin-top:24px;">
              If you didn't request this, you can safely ignore this email.
            </p>
          </div>
        `,
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
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