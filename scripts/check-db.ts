import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== PROJECTS IN DATABASE ===");
  const projects = await prisma.project.findMany({
    include: {
      bullets: { orderBy: { order: "asc" } },
      domains: { include: { domain: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  for (const p of projects) {
    console.log(`\nID: ${p.id}`);
    console.log(`Title: ${p.title}`);
    console.log(`Description: ${p.description}`);
    console.log(`Tech Stack: ${p.techStack.join(", ")}`);
    console.log(`Domains: ${p.domains.map((d) => d.domain.name).join(", ")}`);
    console.log("Bullets:");
    p.bullets.forEach((b) => console.log(`  [${b.order}] ${b.text}`));
  }

  console.log("\n=== RESUME CONFIGS (VARIANTS) ===");
  const configs = await prisma.resumeConfig.findMany({
    include: {
      domain: true,
      projects: {
        include: {
          project: { select: { title: true } },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  for (const c of configs) {
    console.log(`\nConfig ID: ${c.id}`);
    console.log(`Domain: ${c.domain.name} | Variant: ${c.variantName} | Default: ${c.isDefault}`);
    console.log(`Projects:`);
    c.projects.forEach((rp) => console.log(`  [${rp.order}] ${rp.project.title} (included: ${rp.included})`));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
