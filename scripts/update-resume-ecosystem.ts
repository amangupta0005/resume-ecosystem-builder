import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Updating Resume Ecosystem Builder project in PostgreSQL...");

  const existing = await prisma.project.findFirst({
    where: {
      OR: [
        { title: { contains: "Resume Ecosystem", mode: "insensitive" } },
        { id: "cmsq8z4vq0000fuiof4azemsv" },
      ],
    },
    include: { bullets: true },
  });

  if (!existing) {
    console.error("Resume Ecosystem Builder project not found in database!");
    return;
  }

  console.log(`Found project: ${existing.title} (${existing.id})`);

  // Update project metadata
  const updatedProject = await prisma.project.update({
    where: { id: existing.id },
    data: {
      title: "Resume Ecosystem Builder – Multi-Variant ATS Engine",
      description:
        "Production-grade multi-variant resume builder and ATS intelligence platform featuring real-time keyword parsing, drag-and-drop curation, Redis caching, and automated cloud deployment.",
      techStack: [
        "Next.js 14",
        "React 18",
        "TypeScript",
        "Tailwind CSS",
        "Prisma ORM",
        "PostgreSQL",
        "Redis",
        "Docker",
        "AWS EC2",
        "DuckDNS",
        "Systemd",
        "Zod",
      ],
      liveUrl: "http://aman-resumes.duckdns.org",
      githubUrl: "https://github.com/aman-coder-005/resume-ecosystem-builder",
    },
  });

  console.log("Updated project metadata.");

  // Delete existing bullets and insert enhanced blended bullets
  await prisma.bullet.deleteMany({
    where: { projectId: existing.id },
  });

  const newBullets = [
    {
      order: 0,
      text: "Architected a multi-variant resume platform with Next.js 14 App Router, TypeScript, and Tailwind CSS, featuring drag-and-drop project curation (@hello-pangea/dnd), real-time ATS keyword auditing, and instant 1-click Markdown export for LLMs.",
    },
    {
      order: 1,
      text: "Engineered an atomic PostgreSQL backend via Prisma ORM with negative-index transaction reordering, paired with an in-memory Redis 7 cache and sliding-window rate limiter, reducing query latency by 80%+ and preventing brute-force access.",
    },
    {
      order: 2,
      text: "Containerized the full stack into an ultra-lean multi-stage Docker image (~130MB Next.js standalone) and deployed on AWS EC2 Free Tier with 2GB swap, configuring zero-touch systemd boot automation for dynamic DuckDNS domain synchronization.",
    },
  ];

  for (const b of newBullets) {
    await prisma.bullet.create({
      data: {
        projectId: existing.id,
        order: b.order,
        text: b.text,
      },
    });
  }

  console.log("Successfully inserted 3 blended high-impact bullets.");

  // Verify across all resume configs
  const resumeProjects = await prisma.resumeProject.findMany({
    where: { projectId: existing.id },
    include: {
      resumeConfig: {
        include: { domain: true },
      },
    },
  });

  console.log(`\nResume Ecosystem Builder is currently linked to ${resumeProjects.length} resume configs:`);
  for (const rp of resumeProjects) {
    console.log(
      ` - Domain: ${rp.resumeConfig.domain.name} | Variant: ${rp.resumeConfig.variantName} | Included: ${rp.included} | Order: ${rp.order}`
    );
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
