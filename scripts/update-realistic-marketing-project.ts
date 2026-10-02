import fs from "fs";
import path from "path";
import os from "os";
import { PrismaClient } from "@prisma/client";
import { getResumeDocumentData } from "../src/features/preview/server/queries";
import { generateAtsResumeDocx } from "../src/features/preview/server/docxGenerator";
import { invalidateCache } from "../src/lib/redis";

const prisma = new PrismaClient();

async function main() {
  console.log("Updating real estate project to realistic, interview-proof version...");

  const existingProject = await prisma.project.findFirst({
    where: {
      OR: [
        { title: { contains: "Micro-Market Real Estate" } },
        { title: { contains: "Co-Living" } },
      ],
    },
    include: { bullets: true },
  });

  if (!existingProject) {
    console.error("Project not found!");
    return;
  }

  // 1. Update project details
  await prisma.project.update({
    where: { id: existingProject.id },
    data: {
      title: "Co-Living & Real Estate Micro-Market Study (Independent Research)",
      description:
        "Independent micro-market research study benchmarking co-living & managed housing spaces, paired with an automated Google Sheets lead tracking and follow-up pipeline.",
      techStack: [
        "Google Sheets (Formulas)",
        "MS Excel",
        "Market Research",
        "Canva",
        "Outreach Drafting",
        "Data Analysis",
      ],
      githubUrl: null,
      liveUrl: null,
    },
  });

  // 2. Update bullets
  await prisma.bullet.deleteMany({
    where: { projectId: existingProject.id },
  });

  const bullets = [
    {
      order: 0,
      text: "Researched and benchmarked 40+ co-living and managed residential properties across key micro-markets (pricing per bed, amenities, occupancy patterns); synthesized findings into structured comparative briefs and visual summary decks in Canva.",
    },
    {
      order: 1,
      text: "Built a modular pipeline tracker in Google Sheets using conditional formatting, status dropdowns, and date-based reminder formulas to simulate tracking prospect meetings and open follow-up loops.",
    },
    {
      order: 2,
      text: "Drafted concise cold outreach message templates and meeting agendas targeted at property managers and operators, focusing on clarity, professionalism, and structured next steps.",
    },
  ];

  for (const b of bullets) {
    await prisma.bullet.create({
      data: {
        projectId: existingProject.id,
        order: b.order,
        text: b.text,
      },
    });
  }

  console.log("Updated project and bullets in database.");

  // 3. Clear Redis cache
  await invalidateCache("resume_doc:Marketing:default");
  await invalidateCache("resume_doc:Marketing:cmur8e3nr0006fuekpwb5cv5s");
  await invalidateCache("resume_config:Marketing:default");
  await invalidateCache("resume_config:Marketing:cmur8e3nr0006fuekpwb5cv5s");
  console.log("Cleared Redis cache.");

  // 4. Re-generate clean Word document
  const docData = await getResumeDocumentData("Marketing");
  const buffer = await generateAtsResumeDocx(docData);

  const filename = "Aman_Gupta_Virtual_Assistant_Founders_Office.docx";
  const downloadsPath = path.join(os.homedir(), "Downloads", filename);
  const workspacePath = path.join(process.cwd(), filename);
  const artifactsPath = path.join(
    os.homedir(),
    ".gemini",
    "antigravity",
    "brain",
    "256bb20d-2b29-4a21-85f8-98529403c2f0",
    filename
  );

  fs.writeFileSync(downloadsPath, buffer);
  fs.writeFileSync(workspacePath, buffer);
  try {
    fs.writeFileSync(artifactsPath, buffer);
  } catch (e) {
    console.warn(e);
  }

  console.log("Successfully regenerated and saved clean, interview-proof Word resume!");
}

main()
  .catch(console.error)
  .finally(() => {
    prisma.$disconnect();
    process.exit(0);
  });
