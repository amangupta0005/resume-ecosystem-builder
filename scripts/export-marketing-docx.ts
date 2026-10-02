import fs from "fs";
import path from "path";
import os from "os";
import { getResumeDocumentData } from "../src/features/preview/server/queries";
import { generateAtsResumeDocx } from "../src/features/preview/server/docxGenerator";

async function main() {
  console.log("Generating Word (.docx) file for Marketing / Founder's Office resume...");

  const docData = await getResumeDocumentData("Marketing");
  console.log(`Loaded document data: ${docData.titleOverride || docData.domainName}`);

  const buffer = await generateAtsResumeDocx(docData);

  const filename = "Aman_Gupta_Virtual_Assistant_Founders_Office.docx";

  // Target paths
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
  console.log(`Saved to Downloads: ${downloadsPath}`);

  fs.writeFileSync(workspacePath, buffer);
  console.log(`Saved to Workspace: ${workspacePath}`);

  try {
    fs.writeFileSync(artifactsPath, buffer);
    console.log(`Saved to Artifacts: ${artifactsPath}`);
  } catch (e) {
    console.warn("Could not write to artifacts directory:", e);
  }

  console.log(`\nSuccessfully created Word (.docx) file: ${buffer.length} bytes`);
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
