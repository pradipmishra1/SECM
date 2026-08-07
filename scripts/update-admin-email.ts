import { prisma } from "../src/lib/prisma";

async function main() {
  const updated = await prisma.user.updateMany({
    where: { email: "admin@secm.com" },
    data: { email: "help.secm@gmail.com" },
  });

  console.log("Updated user rows:", updated.count);

  // Better-Auth also stores email on the linked account/session records via the User table only (Account table doesn't store email),
  // so updating User.email above is sufficient for login to work with the new email.

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});