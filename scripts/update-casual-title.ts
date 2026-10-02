import fs from "fs";
import path from "path";
import os from "os";
import { PrismaClient } from "@prisma/client";
import { getResumeDocumentData } from "../src/features/preview/server/queries";
import { generateAtsResumeDocx } from "../src/features/preview/server/docxGenerator";
import { invalidateCache } from "../src/lib/redis";

const prisma = new PrismaClient();

async function main() {
  console.log("Updating resume header title to casual existing title: 'Software Engineer'...");

  const marketingDomain = await prisma.domain.findUnique({
    where: { name: "Marketing" },
  });

  if (!marketingDomain) {
    console.error("Marketing domain not found!");
    return;
  }

  // Update ResumeConfig title to "Software Engineer"
  await prisma.resumeConfig.updateMany({
    where: { domainId: marketingDomain.id },
    data: {
      title: "Software Engineer",
    },
  });
  console.log("Updated ResumeConfig title to 'Software Engineer'.");

  // Invalidate Redis cache
  await invalidateCache("resume_doc:Marketing:default");
  await invalidateCache("resume_doc:Marketing:cmur8e3nr0006fuekpwb5cv5s");
  await invalidateCache("resume_config:Marketing:default");
  await invalidateCache("resume_config:Marketing:cmur8e3nr0006fuekpwb5cv5s");
  console.log("Cleared Redis cache.");

  // Re-generate Word file
  const docData = await getResumeDocumentData("Marketing");
  console.log(`Document title is now: ${docData.titleOverride}`);

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

  console.log("Successfully re-exported Word (.docx) file with casual title 'Software Engineer'!");
}

main()
  .catch(console.error)
  .finally(() => {
    prisma.$disconnect();
    process.exit(0);
  });
