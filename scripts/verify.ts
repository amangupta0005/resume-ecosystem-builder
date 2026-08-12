import fs from "fs";
import { getResumeDocumentData } from "../src/features/preview/server/queries";
import { generateAtsResumeDocx } from "../src/features/preview/server/docxGenerator";

async function main() {
  const domainName = "AI Content Evaluation" as any;
  const documentData = await getResumeDocumentData(domainName);
  
  console.log(`Document Data for ${domainName}:`);
  console.log(`Projects: ${documentData.projects.length}`);
  
  for (const project of documentData.projects) {
    console.log(`\nProject: ${project.title}`);
    for (const bullet of project.bullets) {
      console.log(`  - [${bullet.isOverridden ? 'OVERRIDE' : 'ORIGINAL'}] ${bullet.text}`);
    }
  }

  const docxBuffer = await generateAtsResumeDocx(documentData);
  const outPath = `exports/AI_Content_Evaluation_resume.docx`;
  fs.writeFileSync(outPath, docxBuffer);
  console.log(`\nSuccessfully exported to ${outPath}`);
}

main().catch(console.error);
