import { prisma } from "../src/lib/prisma";

async function main() {
  await prisma.featureFlag.upsert({
    where: { key: "AI_REVIEW" },
    create: { key: "AI_REVIEW", enabled: false },
    update: {},
  });
  console.log("Feature flag seeded: AI_REVIEW (disabled by default)");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});