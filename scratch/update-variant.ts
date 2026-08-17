import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Find the Full-Stack domain
  const domain = await prisma.domain.findUnique({
    where: { name: "Full-Stack" }
  });

  if (!domain) {
    console.error("Full-Stack domain not found");
    return;
  }

  // Find the latest custom config for Full-Stack
  const latestConfig = await prisma.resumeConfig.findFirst({
    where: {
      domainId: domain.id,
      isDefault: false
    },
    orderBy: {
      updatedAt: 'desc'
    },
    include: {
      projects: true
    }
  });

  if (!latestConfig) {
    console.error("No custom variant found for Full-Stack");
    return;
  }

  console.log(`Updating Variant: ${latestConfig.variantName} (${latestConfig.id})`);

  // Update Summary
  const summary = "Full-Stack AI Engineer with expertise in designing and shipping end-to-end AI-powered features from model to UI. Strong foundation in modern web development (React, Next.js, TypeScript) and SQL databases (PostgreSQL, Prisma). Experienced in leveraging LLMs and AI product patterns—including prompt engineering, structured outputs, and open-weight models—to build intelligent products. Comfortable owning work across the full stack (Model → API → UI → Server) in fast-moving, collaborative environments.";

  // Define overridden skills
  const skillsOverride = [
    { category: "Languages", skills: "TypeScript, JavaScript, Python, HTML/CSS" },
    { category: "Frameworks & Libraries", skills: "React, Next.js, Node.js, Express, Prisma" },
    { category: "Databases", skills: "PostgreSQL, MongoDB" },
    { category: "Tools & DevOps", "skills": "Docker, Linux, Git, REST APIs, CI/CD" },
    { category: "AI & LLMs", "skills": "Prompt Engineering, Structured Outputs, Open-Weight Models, Hosted LLMs" }
  ];

  // Update Config
  await prisma.resumeConfig.update({
    where: { id: latestConfig.id },
    data: {
      summary: summary,
      skills: skillsOverride as any
    }
  });

  // Find the 3 projects
  const projects = await prisma.project.findMany();
  
  const targetProjectNames = ["Resume Ecosystem", "QuickGPT", "AcadSecure"];
  
  // First, shift all orders to avoid unique constraint violations
  for (const rp of latestConfig.projects) {
    await prisma.resumeProject.update({
      where: {
        resumeConfigId_projectId: {
          resumeConfigId: latestConfig.id,
          projectId: rp.projectId
        }
      },
      data: {
        order: rp.order + 1000
      }
    });
  }

  // Now apply the actual inclusion and ordering
  for (const rp of latestConfig.projects) {
    const project = projects.find(p => p.id === rp.projectId);
    if (!project) continue;

    let shouldInclude = false;
    for (const target of targetProjectNames) {
      if (project.title.includes(target)) {
        shouldInclude = true;
        break;
      }
    }

    let finalOrder = rp.order + 1000;
    if (shouldInclude) {
      if (project.title.includes("Resume Ecosystem")) finalOrder = 0;
      if (project.title.includes("QuickGPT")) finalOrder = 1;
      if (project.title.includes("AcadSecure")) finalOrder = 2;
    }

    await prisma.resumeProject.update({
      where: {
        resumeConfigId_projectId: {
          resumeConfigId: latestConfig.id,
          projectId: rp.projectId
        }
      },
      data: {
        included: shouldInclude,
        order: finalOrder
      }
    });
  }

  console.log("Variant updated successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
