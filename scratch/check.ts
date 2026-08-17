import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const cfg = await prisma.resumeConfig.findFirst({
    where: { isDefault: false },
    orderBy: { updatedAt: 'desc' },
    include: {
      projects: {
        include: { project: true }
      }
    }
  });
  console.log("Config Name:", cfg?.variantName);
  console.log("Summary:", cfg?.summary?.slice(0, 50));
  console.log("Included Projects:");
  for (const rp of cfg?.projects || []) {
    if (rp.included) console.log(`- [${rp.order}] ${rp.project.title}`);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
