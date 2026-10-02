import fs from "fs";
import path from "path";
import os from "os";
import { PrismaClient } from "@prisma/client";
import { getResumeDocumentData } from "../src/features/preview/server/queries";
import { generateAtsResumeDocx } from "../src/features/preview/server/docxGenerator";
import { invalidateCache } from "../src/lib/redis";

const prisma = new PrismaClient();

async function main() {
  console.log("Removing dummy githubUrl and liveUrl from Micro-Market Real Estate project...");

  // 1. Update Neon PostgreSQL
  const project = await prisma.project.findFirst({
    where: { title: { contains: "Micro-Market Real Estate" } },
  });

  if (project) {
    await prisma.project.update({
      where: { id: project.id },
      data: {
        githubUrl: null,
        liveUrl: null,
      },
    });
    console.log(`Updated project ${project.id}: githubUrl and liveUrl set to null.`);
  }

  // 2. Invalidate cache
  await invalidateCache("resume_doc:Marketing:default");
  await invalidateCache("resume_doc:Marketing:cmur8e3nr0006fuekpwb5cv5s");
  await invalidateCache("resume_config:Marketing:default");
  await invalidateCache("resume_config:Marketing:cmur8e3nr0006fuekpwb5cv5s");
  console.log("Invalidated Redis cache.");

  // 3. Re-generate clean .docx
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

  console.log("Regenerated clean .docx file with zero placeholder links!");
}

main()
  .catch(console.error)
  .finally(() => {
    prisma.$disconnect();
    process.exit(0);
  });
