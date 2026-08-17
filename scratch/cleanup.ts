import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const domains = await prisma.domain.findMany({ include: { resumeConfigs: { orderBy: { createdAt: 'asc' } } } });
  let deleted = 0;
  for (const domain of domains) {
    const defaults = domain.resumeConfigs.filter(c => c.isDefault);
    if (defaults.length > 1) {
      const toDelete = defaults.slice(1);
      for (const c of toDelete) {
        await prisma.resumeConfig.delete({ where: { id: c.id } });
        deleted++;
      }
    }
  }
  console.log(`Deleted ${deleted} duplicate default configs.`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
