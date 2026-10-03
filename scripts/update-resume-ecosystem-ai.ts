import { PrismaClient } from "@prisma/client";
import { invalidateAllResumeCaches } from "../src/lib/redis";

const prisma = new PrismaClient();

async function main() {
  console.log("Updating Resume Ecosystem Builder with blended AI platform details...");

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
  await prisma.project.update({
    where: { id: existing.id },
    data: {
      title: "Resume Ecosystem Builder – AI-Powered ATS & Resume Intelligence Platform",
      description:
        "Production-grade multi-variant resume builder and ATS intelligence platform featuring hybrid deterministic-semantic JD matching with Gemini 3.5 Flash, drag-and-drop curation, Redis 7 caching, and automated AWS EC2 deployment.",
      techStack: [
        "Next.js 14",
        "React 18",
        "TypeScript",
        "Tailwind CSS",
        "Prisma ORM",
        "PostgreSQL",
        "Redis 7",
        "Gemini 3.5 Flash",
        "LLMs",
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

  console.log("Updated project title, description, and tech stack.");

  // Delete existing bullets and insert blended AI-augmented bullets
  await prisma.bullet.deleteMany({
    where: { projectId: existing.id },
  });

  const blendedBullets = [
    {
      order: 0,
      text: "Architected a multi-variant resume platform with Next.js 14 App Router, TypeScript, and Tailwind CSS, featuring drag-and-drop project curation (@hello-pangea/dnd), real-time ATS keyword auditing, and instant 1-click Markdown export for LLMs",
    },
    {
      order: 1,
      text: "Engineered a hybrid ATS matching engine pairing deterministic regex keyword extraction with server-side Gemini 3.5 Flash LLM analysis, generating explainable match scores, categorized skill gaps (Critical/Important/Nice-to-Have), and in-editor bullet refinement without metric hallucination",
    },
    {
      order: 2,
      text: "Built an atomic PostgreSQL backend via Prisma ORM with negative-index transaction reordering, backed by an in-memory Redis 7 cache with SHA-256 analysis hashing and sliding-window rate limiters, cutting query latency by 80%+ and preventing brute-force access",
    },
    {
      order: 3,
      text: "Containerized the full stack into an ultra-lean multi-stage Docker image (~130MB Next.js standalone) and deployed on AWS EC2 Free Tier with 2GB swap, configuring zero-touch systemd boot automation for dynamic DuckDNS domain synchronization",
    },
  ];

  for (const b of blendedBullets) {
    await prisma.bullet.create({
      data: {
        projectId: existing.id,
        order: b.order,
        text: b.text,
      },
    });
  }

  console.log(`Successfully inserted ${blendedBullets.length} blended bullets into PostgreSQL.`);

  // Update profile with aligned skills and summary
  const profile = await prisma.profile.findFirst();
  if (profile) {
    await prisma.profile.update({
      where: { id: profile.id },
      data: {
        summary:
          "Proactive Full-Stack Software Engineer with a strong foundation in Computer Science fundamentals, modern distributed architectures, and AI/ML systems. Proven track record building high-performance web applications using Next.js 14, React 18, TypeScript, Node.js, Express, PostgreSQL (Prisma), and Redis, with hands-on experience in LLM APIs (Gemini 3.5 Flash), semantic matching, and cloud tooling.",
        languages: ["C", "C++", "Java", "Python", "JavaScript", "TypeScript", "SQL"],
        frameworks: [
          "Next.js 14",
          "React 18",
          "Node.js",
          "Express",
          "FastAPI",
          "Prisma ORM",
          "Tailwind CSS",
          "REST APIs",
          "Vite",
        ],
        tools: [
          "PostgreSQL",
          "Redis 7",
          "Docker",
          "AWS EC2",
          "MongoDB Atlas",
          "Git",
          "GitHub",
          "Postman",
          "LLMs (Gemini API)",
          "Prompt Engineering",
          "NumPy",
          "Pandas",
        ],
      },
    });
    console.log("Updated candidate Profile summary, languages, frameworks, and tools in PostgreSQL.");
  }

  // Flush Redis caches so changes reflect immediately
  await invalidateAllResumeCaches();
  console.log("Flushed Redis cache.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
