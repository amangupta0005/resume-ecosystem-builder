import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const config = await prisma.resumeConfig.findFirst({
    where: { variantName: "Ai/Ml +Python" }
  });

  if (!config) {
    throw new Error("Config not found");
  }

  await prisma.resumeConfig.update({
    where: { id: config.id },
    data: { title: "PYTHON & AI/ML ENGINEER" }
  });

  console.log("Updated title successfully");
}

main().catch(console.error).finally(() => prisma.$disconnect());
