import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ExternalHyperlink,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  convertInchesToTwip,
} from "docx";
import type { ResumeDocumentData } from "./queries";

export async function generateAtsResumeDocx(
  documentData: ResumeDocumentData,
): Promise<Buffer> {
  const { domainName, profile, projects } = documentData;
  const FONT_FAMILY = "Calibri";

  const children: Paragraph[] = [];

  // Helper for section headings
  function createSectionHeading(title: string): Paragraph {
    return new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 100 },
      border: {
        bottom: {
          color: "222222",
          space: 2,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
      children: [
        new TextRun({
          text: title.toUpperCase(),
          bold: true,
          font: FONT_FAMILY,
          size: 22, // 11pt in half-points
          color: "111111",
        }),
      ],
    });
  }

  // 1. CANDIDATE HEADER (Name, Target Title, Contact info)
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: profile.fullName.toUpperCase(),
          bold: true,
          font: FONT_FAMILY,
          size: 36, // 18pt
          color: "000000",
        }),
      ],
    }),
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: documentData.titleOverride 
            ? documentData.titleOverride.toUpperCase() 
            : `SOFTWARE ENGINEER — ${domainName.toUpperCase()}`,
          bold: true,
          font: FONT_FAMILY,
          size: 22, // 11pt
          color: "333333",
        }),
      ],
    }),
  );

  // Contact line
  const contactParts: string[] = [];
  if (profile.email) contactParts.push(profile.email);
  if (profile.phone) contactParts.push(profile.phone);
  if (profile.location) contactParts.push(profile.location);
  if (profile.linkedinUrl) contactParts.push(profile.linkedinUrl.replace(/^https?:\/\//, ""));
  if (profile.githubUrl) contactParts.push(profile.githubUrl.replace(/^https?:\/\//, ""));
  if (profile.websiteUrl) contactParts.push(profile.websiteUrl.replace(/^https?:\/\//, ""));

  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 180 },
        children: [
          new TextRun({
            text: contactParts.join("  |  "),
            font: FONT_FAMILY,
            size: 19, // 9.5pt
            color: "555555",
          }),
        ],
      }),
    );
  }

  // 2. PROFESSIONAL SUMMARY
  const displaySummary = documentData.summaryOverride || profile.summary;
  if (displaySummary) {
    children.push(createSectionHeading("Professional Summary"));
    children.push(
      new Paragraph({
        spacing: { after: 120, line: 260 },
        children: [
          new TextRun({
            text: displaySummary,
            font: FONT_FAMILY,
            size: 21, // 10.5pt
            color: "222222",
          }),
        ],
      }),
    );
  }

  // 3. TECHNICAL SKILLS
  if (documentData.skillsOverride && documentData.skillsOverride.length > 0) {
    children.push(createSectionHeading("Technical Skills"));
    for (const skill of documentData.skillsOverride) {
      children.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: `${skill.category}: `,
              bold: true,
              font: FONT_FAMILY,
              size: 21,
              color: "111111",
            }),
            new TextRun({
              text: skill.skills,
              font: FONT_FAMILY,
              size: 21,
              color: "333333",
            }),
          ],
        }),
      );
    }
  } else {
    const hasSkillCategories =
      profile.languages.length > 0 ||
      profile.frameworks.length > 0 ||
      profile.tools.length > 0 ||
      (profile.strengths?.length ?? 0) > 0;

    if (hasSkillCategories || documentData.aggregatedSkills.length > 0) {
      children.push(createSectionHeading("Technical Skills"));

      if (profile.languages.length > 0) {
        children.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: "Programming Languages: ",
                bold: true,
                font: FONT_FAMILY,
                size: 21,
                color: "111111",
              }),
              new TextRun({
                text: profile.languages.join(", "),
                font: FONT_FAMILY,
                size: 21,
                color: "333333",
              }),
            ],
          }),
        );
      }

      if (profile.frameworks.length > 0) {
        children.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: "Frameworks & Libraries: ",
                bold: true,
                font: FONT_FAMILY,
                size: 21,
                color: "111111",
              }),
              new TextRun({
                text: profile.frameworks.join(", "),
                font: FONT_FAMILY,
                size: 21,
                color: "333333",
              }),
            ],
          }),
        );
      }

      if (profile.tools.length > 0) {
        children.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: "Tools, Cloud & Databases: ",
                bold: true,
                font: FONT_FAMILY,
                size: 21,
                color: "111111",
              }),
              new TextRun({
                text: profile.tools.join(", "),
                font: FONT_FAMILY,
                size: 21,
                color: "333333",
              }),
            ],
          }),
        );
      }

      if (profile.strengths && profile.strengths.length > 0) {
        children.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: "Core Competencies: ",
                bold: true,
                font: FONT_FAMILY,
                size: 21,
                color: "111111",
              }),
              new TextRun({
                text: profile.strengths.join(", "),
                font: FONT_FAMILY,
                size: 21,
                color: "333333",
              }),
            ],
          }),
        );
      }

      if (!hasSkillCategories && documentData.aggregatedSkills.length > 0) {
        children.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: "Proficiencies: ",
                bold: true,
                font: FONT_FAMILY,
                size: 21,
                color: "111111",
              }),
              new TextRun({
                text: documentData.aggregatedSkills.join(", "),
                font: FONT_FAMILY,
                size: 21,
                color: "333333",
              }),
            ],
          }),
        );
      }
    }
  }

  // 4. KEY PROJECTS
  if (projects.length > 0) {
    children.push(createSectionHeading("Key Projects"));

    for (const project of projects) {
      // Project Header: Title | Tech stack | [GitHub] | [Live Demo]
      const headerChildren: (TextRun | ExternalHyperlink)[] = [
        new TextRun({
          text: project.title,
          bold: true,
          font: FONT_FAMILY,
          size: 22, // 11pt
          color: "000000",
        }),
      ];

      if (project.techStack.length > 0) {
        headerChildren.push(
          new TextRun({
            text: `  |  ${project.techStack.join(", ")}`,
            font: FONT_FAMILY,
            size: 20, // 10pt
            color: "555555",
          }),
        );
      }

      if (project.githubUrl) {
        headerChildren.push(
          new TextRun({
            text: "  ",
            font: FONT_FAMILY,
            size: 20,
          }),
          new ExternalHyperlink({
            children: [
              new TextRun({
                text: "[GitHub]",
                style: "Hyperlink",
                font: FONT_FAMILY,
                size: 20,
                color: "0000EE",
              }),
            ],
            link: project.githubUrl,
          }),
        );
      }

      if (project.liveUrl) {
        headerChildren.push(
          new TextRun({
            text: "  ",
            font: FONT_FAMILY,
            size: 20,
          }),
          new ExternalHyperlink({
            children: [
              new TextRun({
                text: "[Live Demo]",
                style: "Hyperlink",
                font: FONT_FAMILY,
                size: 20,
                color: "006600",
              }),
            ],
            link: project.liveUrl,
          }),
        );
      }

      children.push(
        new Paragraph({
          spacing: { before: 120, after: 40 },
          children: headerChildren,
        }),
      );

      // Project Bullets
      for (const bullet of project.bullets) {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 40, line: 240 },
            children: [
              new TextRun({
                text: bullet.text,
                font: FONT_FAMILY,
                size: 21, // 10.5pt
                color: "222222",
              }),
            ],
          }),
        );
      }
    }
  }

  // 5. EDUCATION
  if (profile.educations.length > 0) {
    children.push(createSectionHeading("Education"));

    for (const edu of profile.educations) {
      const parts: string[] = [];
      if (edu.fieldOfStudy) parts.push(edu.fieldOfStudy);
      if (edu.grade) parts.push(edu.grade);

      const dateStr =
        edu.startDate && edu.endDate
          ? `${edu.startDate} – ${edu.endDate}`
          : edu.endDate || edu.startDate || "";

      children.push(
        new Paragraph({
          spacing: { before: 80, after: 30 },
          children: [
            new TextRun({
              text: edu.degree,
              bold: true,
              font: FONT_FAMILY,
              size: 21,
              color: "111111",
            }),
            new TextRun({
              text: ` — ${edu.institution}`,
              font: FONT_FAMILY,
              size: 21,
              color: "333333",
            }),
            ...(dateStr
              ? [
                  new TextRun({
                    text: ` (${dateStr})`,
                    font: FONT_FAMILY,
                    size: 20,
                    color: "666666",
                  }),
                ]
              : []),
          ],
        }),
      );

      if (parts.length > 0) {
        children.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: parts.join("  |  "),
                font: FONT_FAMILY,
                size: 20,
                color: "555555",
              }),
            ],
          }),
        );
      }
    }
  }

  // 6. CERTIFICATIONS
  if (profile.certifications.length > 0) {
    children.push(createSectionHeading("Certifications"));

    for (const cert of profile.certifications) {
      const dateText = cert.issueDate ? ` (${cert.issueDate})` : "";
      children.push(
        new Paragraph({
          spacing: { before: 60, after: 40 },
          children: [
            new TextRun({
              text: `${cert.name}`,
              bold: true,
              font: FONT_FAMILY,
              size: 21,
              color: "111111",
            }),
            new TextRun({
              text: ` — ${cert.issuer}${dateText}`,
              font: FONT_FAMILY,
              size: 21,
              color: "444444",
            }),
          ],
        }),
      );
    }
  }

  // Create standard single-column document with 1-inch margins
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.8),
              bottom: convertInchesToTwip(0.8),
              left: convertInchesToTwip(0.8),
              right: convertInchesToTwip(0.8),
            },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
