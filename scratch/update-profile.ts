import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const profile = await prisma.profile.findFirst();
  if (!profile) return;

  const languages = Array.from(new Set([...profile.languages, "TypeScript", "HTML/CSS"]));
  const frameworks = Array.from(new Set([...profile.frameworks, "Next.js", "Prisma"]));
  const tools = Array.from(new Set([
    ...profile.tools, 
    "PostgreSQL", 
    "CI/CD", 
    "Prompt Engineering", 
    "LLMs",
    "Open-Weight Models"
  ]));

  await prisma.profile.update({
    where: { id: profile.id },
    data: {
      languages,
      frameworks,
      tools
    }
  });

  // Remove the skills override from the variant so the Live Editor and PDF match perfectly
  const domain = await prisma.domain.findUnique({ where: { name: "Full-Stack" }});
  if (domain) {
    const latestConfig = await prisma.resumeConfig.findFirst({
      where: { domainId: domain.id, isDefault: false },
      orderBy: { updatedAt: 'desc' }
    });
    if (latestConfig) {
      // Prisma JSON fields can be updated to Prisma.DbNull to erase them, or just empty array
      await prisma.resumeConfig.update({
        where: { id: latestConfig.id },
        data: { skills: null as any }
      });
    }
  }

  console.log("Profile updated successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
