import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Ensure AI/ML Domain exists
  let domain = await prisma.domain.findUnique({
    where: { name: "AI/ML" }
  });

  if (!domain) {
    domain = await prisma.domain.create({
      data: { name: "AI/ML" }
    });
  }

  // 2. Fetch all projects
  const acad = await prisma.project.findFirst({ where: { title: { contains: "AcadSecure" } }});
  const aero = await prisma.project.findFirst({ where: { title: { contains: "Aero Defect" } }});
  const quick = await prisma.project.findFirst({ where: { title: { contains: "QuickGPT" } }});
  const smart = await prisma.project.findFirst({ where: { title: { contains: "SmartLogger" } }});

  if (!acad || !aero || !quick || !smart) {
      throw new Error("One or more projects not found");
  }

  const targetProjectIds = [
    { id: acad.id, order: 0 },
    { id: aero.id, order: 1 },
    { id: quick.id, order: 2 },
    { id: smart.id, order: 3 }
  ];

  // Link projects to domain if not already
  const allProjects = await prisma.project.findMany();
  for (const p of allProjects) {
      const domainProj = await prisma.projectDomain.findFirst({
          where: { domainId: domain.id, projectId: p.id }
      });
      if (!domainProj) {
          await prisma.projectDomain.create({
              data: { domainId: domain.id, projectId: p.id }
          });
      }
  }

  // Clean up any existing variants with this name to avoid duplicates on retry
  await prisma.resumeConfig.deleteMany({
    where: { domainId: domain.id, variantName: "Ai/Ml +Python" }
  });

  // 3. Create the new config
  const config = await prisma.resumeConfig.create({
    data: {
      domainId: domain.id,
      variantName: "Ai/Ml +Python",
      isDefault: true,
      title: "Ai/Ml +Python", 
    }
  });

  // 4. Create ResumeProject links
  let counter = 1000;
  for (const p of allProjects) {
    const target = targetProjectIds.find(t => t.id === p.id);
    await prisma.resumeProject.create({
      data: {
        resumeConfigId: config.id,
        projectId: p.id,
        included: !!target,
        order: target ? target.order : (counter++)
      }
    });
  }

  console.log("Successfully created AI/ML variant");
}

main().catch(console.error).finally(() => prisma.$disconnect());
