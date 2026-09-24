import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const quickgpt = await prisma.project.findFirst({
    where: { title: { contains: "QuickGPT" } },
  });

  if (!quickgpt) {
    console.error("QuickGPT not found!");
    return;
  }

  const updated = await prisma.project.update({
    where: { id: quickgpt.id },
    data: {
      liveUrl: "https://quickgpt-api.duckdns.org",
    },
  });

  console.log(`Updated ${updated.title} liveUrl to: ${updated.liveUrl}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
