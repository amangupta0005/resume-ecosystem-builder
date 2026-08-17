import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Find Full-Stack domain
  const domain = await prisma.domain.findUnique({
    where: { name: "Full-Stack" }
  });

  if (!domain) {
    throw new Error("Full-Stack domain not found");
  }

  // Create or Find the Project
  let resumeProject = await prisma.project.findFirst({
    where: { title: "Resume Ecosystem Builder" }
  });

  if (!resumeProject) {
    resumeProject = await prisma.project.create({
      data: {
        title: "Resume Ecosystem Builder",
        description: "Multi-variant resume generator",
        techStack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Prisma", "PostgreSQL", "Docker", "Git"],
        status: "completed",
        githubUrl: "https://github.com/aman-coder-005/resume-ecosystem-builder",
        domains: {
          create: {
            domainId: domain.id
          }
        },
        bullets: {
          create: [
            {
              order: 0,
              text: "Engineered a multi-variant resume builder using Next.js 14 and React, enabling the generation of tailored resumes from a unified professional profile."
            },
            {
              order: 1,
              text: "Designed a responsive UI with Tailwind CSS, integrating live ATS readiness scoring and on-the-fly PDF and text export capabilities."
            },
            {
              order: 2,
              text: "Architected the backend using Prisma ORM and PostgreSQL to securely store profiles, variations, and bullet overrides."
            }
          ]
        }
      }
    });
    console.log("Created Resume Ecosystem Builder project");
  }

  // Get the latest custom variant for Full-Stack
  const latestConfig = await prisma.resumeConfig.findFirst({
    where: {
      domainId: domain.id,
      isDefault: false
    },
    orderBy: { updatedAt: 'desc' },
    include: {
      projects: {
        include: { project: true }
      }
    }
  });

  if (!latestConfig) {
    throw new Error("Custom variant not found");
  }

  console.log(`Updating Variant: ${latestConfig.variantName}`);

  // Fetch QuickGPT and AcadSecure
  const quickGpt = await prisma.project.findFirst({ where: { title: { contains: "QuickGPT" } } });
  const acadSecure = await prisma.project.findFirst({ where: { title: { contains: "AcadSecure" } } });

  const targetProjectIds = [
    { id: quickGpt!.id, order: 0 },
    { id: resumeProject.id, order: 1 },
    { id: acadSecure!.id, order: 2 }
  ];

  // First, shift all orders to avoid unique constraint violations
  let tempOrder = 10000;
  for (const rp of latestConfig.projects) {
    await prisma.resumeProject.update({
      where: { id: rp.id },
      data: { order: tempOrder++ }
    });
  }

  // Check if Resume Builder is already linked to this Config, if not link it
  const isLinked = latestConfig.projects.some(rp => rp.projectId === resumeProject!.id);
  if (!isLinked) {
    await prisma.resumeProject.create({
      data: {
        resumeConfigId: latestConfig.id,
        projectId: resumeProject!.id,
        included: false,
        order: 9999
      }
    });
  }

  // Fetch updated ResumeProjects
  const allResumeProjects = await prisma.resumeProject.findMany({
    where: { resumeConfigId: latestConfig.id }
  });

  // Apply new inclusion and order
  for (const rp of allResumeProjects) {
    const target = targetProjectIds.find(t => t.id === rp.projectId);
    
    await prisma.resumeProject.update({
      where: { id: rp.id },
      data: {
        included: !!target,
        order: target ? target.order : rp.order
      }
    });
  }

  console.log("Variant updated successfully with the requested projects in order.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
