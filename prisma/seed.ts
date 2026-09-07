import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { auth } from "../src/lib/auth";
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const existingAdmin = await prisma.user.findFirst({ where: { role: "ADMIN" } });

  if (existingAdmin) {
    console.log("Admin already exists:", existingAdmin.email);
    return;
  }

  const result = await auth.api.signUpEmail({
    body: {
      name: "Admin",
      email: "admin@secm.com",
      password: "Admin@12345",
    },
  });

  const userId = (result as any)?.user?.id;
  if (!userId) {
    console.error("Failed to create admin via auth API:", result);
    return;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: "ADMIN" },
  });

  console.log("✅ Admin account created:");
  console.log("   Email: admin@secm.com");
  console.log("   Password: Admin@12345");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());