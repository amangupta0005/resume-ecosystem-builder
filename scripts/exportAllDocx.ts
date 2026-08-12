import fs from "fs";
import path from "path";
import { DOMAIN_NAMES } from "../src/lib/constants/domains";
import { getResumeDocumentData } from "../src/features/preview/server/queries";
import { generateAtsResumeDocx } from "../src/features/preview/server/docxGenerator";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  BorderStyle,
  convertInchesToTwip,
} from "docx";

async function main() {
  const outputDir = path.join(process.cwd(), "exports");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log("Generating ATS .docx resume files for all domains...");

  for (const domainName of DOMAIN_NAMES) {
    const slug = domainName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const filename = `${slug}_resume.docx`;
    const filePath = path.join(outputDir, filename);

    const docData = await getResumeDocumentData(domainName);
    const buffer = await generateAtsResumeDocx(docData);

    fs.writeFileSync(filePath, buffer);
    console.log(`✓ Created: exports/${filename} (${buffer.length} bytes)`);
  }

  // Generate the Project Summary .docx
  console.log("Generating Project Summary .docx...");
  const summaryDoc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
            },
          },
        },
        children: [
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: "Resume Ecosystem Builder — Project Summary",
                bold: true,
                font: "Calibri",
                size: 32,
                color: "111111",
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: "Complete Architecture, Feature Modules, and ATS Output Specifications",
                italics: true,
                font: "Calibri",
                size: 22,
                color: "555555",
              }),
            ],
          }),

          // Section 1: Overview
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            border: { bottom: { color: "222222", style: BorderStyle.SINGLE, size: 6 } },
            spacing: { before: 240, after: 100 },
            children: [
              new TextRun({
                text: "1. OVERVIEW & PURPOSE",
                bold: true,
                font: "Calibri",
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: "The Resume Ecosystem Builder is a Next.js full-stack system designed to manage a centralized catalog of engineering projects and dynamically curate domain-specific, ATS-compliant resumes (AI/ML, Full-Stack, Computer Vision, and IoT+ML) with tailored bullet points, ATS compliance scoring, and direct Word (.docx) export capabilities.",
                font: "Calibri",
                size: 22,
              }),
            ],
          }),

          // Section 2: Modules Built
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            border: { bottom: { color: "222222", style: BorderStyle.SINGLE, size: 6 } },
            spacing: { before: 240, after: 100 },
            children: [
              new TextRun({
                text: "2. MODULE-BY-MODULE BREAKDOWN",
                bold: true,
                font: "Calibri",
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: "Module 1 (Database & Seeding): ",
                bold: true,
                font: "Calibri",
                size: 22,
              }),
              new TextRun({
                text: "Neon PostgreSQL database with Prisma schema supporting Projects, Domains, BulletPoints, Overrides, and 4 domain seeds with 8 production projects.",
                font: "Calibri",
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: "Module 2 (Project Management UI): ",
                bold: true,
                font: "Calibri",
                size: 22,
              }),
              new TextRun({
                text: "Full CRUD project management interface with interactive tech badges, domain tagging, dynamic bullet list editor, and search/filter.",
                font: "Calibri",
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: "Module 3 (Domain Configurator & Bullet Tailoring): ",
                bold: true,
                font: "Calibri",
                size: 22,
              }),
              new TextRun({
                text: "Domain-specific workspace allowing project inclusion toggling, custom drag/up-down reordering, and in-place bullet text overrides tailored per domain.",
                font: "Calibri",
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: "Module 4 (ATS Preview, Scorecard & Cross-Domain Matrix): ",
                bold: true,
                font: "Calibri",
                size: 22,
              }),
              new TextRun({
                text: "Real-time ATS document viewer, automated ATS readiness analysis (strong action verb ratio, bullet length checks, word count metrics), and side-by-side Cross-Domain Comparison Matrix.",
                font: "Calibri",
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: "Module 5 (Profile Management & Word .docx Export): ",
                bold: true,
                font: "Calibri",
                size: 22,
              }),
              new TextRun({
                text: "Candidate profile editor (Contact, Bio, Skills, Education, Certifications), unified ATS document aggregator, and native .docx export engine adhering to single-column ATS standards.",
                font: "Calibri",
                size: 22,
              }),
            ],
          }),

          // Section 3: ATS Specifications
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            border: { bottom: { color: "222222", style: BorderStyle.SINGLE, size: 6 } },
            spacing: { before: 240, after: 100 },
            children: [
              new TextRun({
                text: "3. ATS-FRIENDLY EXPORT RULES APPLIED",
                bold: true,
                font: "Calibri",
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: "Single-Column Layout: No tables, multi-column tables, or floating text boxes.",
                font: "Calibri",
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: "Conservative Typography: Calibri font with 18pt title, 11pt bold section headers, and 10.5pt body text.",
                font: "Calibri",
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: "Standard Section Headers: PROFESSIONAL SUMMARY, TECHNICAL SKILLS, KEY PROJECTS, EDUCATION, and CERTIFICATIONS.",
                font: "Calibri",
                size: 22,
              }),
            ],
          }),
        ],
      },
    ],
  });

  const summaryBuffer = await Packer.toBuffer(summaryDoc);
  const summaryPath = path.join(outputDir, "Resume_Ecosystem_Summary.docx");
  fs.writeFileSync(summaryPath, summaryBuffer);
  console.log(`✓ Created: exports/Resume_Ecosystem_Summary.docx (${summaryBuffer.length} bytes)`);

  console.log("\nAll .docx files successfully generated in 'exports/' folder!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
