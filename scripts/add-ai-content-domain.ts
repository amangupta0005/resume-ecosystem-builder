import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const domainName = "AI Content Evaluation";

  // Step 1: Add new Domain
  console.log(`Creating domain: ${domainName}`);
  const domain = await prisma.domain.upsert({
    where: { name: domainName },
    update: {},
    create: { name: domainName },
  });

  // Fetch projects
  const projectTitles = [
    "AcadSecure – AI Plagiarism & Collusion Detection", 
    "QuickGPT – AI Chatbot Platform", 
    "Aero Defect AI – Automated Defect Inspection"
  ];
  
  const projects = await prisma.project.findMany({
    where: {
      title: {
        in: projectTitles
      }
    },
    include: {
      bullets: true
    }
  });

  if (projects.length !== 3) {
      console.warn("Could not find all 3 projects. Found:", projects.map(p => p.title));
  }

  // Step 2: Tag existing projects to this domain
  for (const project of projects) {
    console.log(`Linking project to domain: ${project.title}`);
    await prisma.projectDomain.upsert({
      where: {
        projectId_domainId: {
          projectId: project.id,
          domainId: domain.id
        }
      },
      update: {},
      create: {
        projectId: project.id,
        domainId: domain.id
      }
    });
  }

  // Step 3: Create a ResumeConfig for this domain
  console.log(`Creating ResumeConfig for domain`);
  const resumeConfig = await prisma.resumeConfig.upsert({
    where: { domainId: domain.id },
    update: {},
    create: { domainId: domain.id },
  });

  // Create ResumeProject entries
  const orderMapping: Record<string, number> = {
    "AcadSecure – AI Plagiarism & Collusion Detection": 0,
    "QuickGPT – AI Chatbot Platform": 1,
    "Aero Defect AI – Automated Defect Inspection": 2,
  };

  for (const project of projects) {
    const order = orderMapping[project.title];
    if (order !== undefined) {
      console.log(`Adding ResumeProject for ${project.title} at order ${order}`);
      await prisma.resumeProject.upsert({
        where: {
          resumeConfigId_projectId: {
            resumeConfigId: resumeConfig.id,
            projectId: project.id
          }
        },
        update: {
          order: order,
          included: true
        },
        create: {
          resumeConfigId: resumeConfig.id,
          projectId: project.id,
          included: true,
          order: order,
        }
      });
    }
  }

  // Step 4: Add ResumeBulletOverride entries
  const overridesMapping: Record<string, string[]> = {
    "AcadSecure – AI Plagiarism & Collusion Detection": [
      "Designed evaluation criteria to detect AI-generated text using a RoBERTa-based classifier (HC3 dataset), assessing content for authenticity and compliance across student submissions",
      "Applied TF-IDF cosine similarity scoring and DBSCAN clustering to identify content overlap and collusion patterns, evaluating submissions for accuracy and quality against defined criteria",
      "Built review workflows with tamper-proof audit logging (Ethereum/Ganache) to ensure evaluation integrity and traceability"
    ],
    "QuickGPT – AI Chatbot Platform": [
      "Worked hands-on with LLM output (Gemini 2.5 Flash) across varied conversational and multimodal scenarios, developing an understanding of model response quality, relevance, and failure modes",
      "Evaluated and refined AI-generated responses for coherence and accuracy while building chat history and content-review features"
    ],
    "Aero Defect AI – Automated Defect Inspection": [
      "Assessed visual/image content against defined quality criteria, classifying defects (cracks, dents, corrosion, scratches) by type and severity for compliance-driven maintenance reporting",
      "Built a structured evaluation pipeline (YOLOv8 detection + severity scoring) to judge image content against a consistent rubric, generating auditable reports"
    ]
  };
  
  for (const project of projects) {
    const newBullets = overridesMapping[project.title];
    if (newBullets) {
        const sortedBullets = project.bullets.sort((a, b) => a.order - b.order);
        for (let i = 0; i < sortedBullets.length; i++) {
            if (newBullets[i] && newBullets[i] !== "") {
                 console.log(`Adding override for ${project.title} bullet order ${sortedBullets[i].order}`);
                 await prisma.resumeBulletOverride.upsert({
                    where: {
                        resumeConfigId_bulletId: {
                            resumeConfigId: resumeConfig.id,
                            bulletId: sortedBullets[i].id
                        }
                    },
                    update: {
                        text: newBullets[i]
                    },
                    create: {
                        resumeConfigId: resumeConfig.id,
                        bulletId: sortedBullets[i].id,
                        text: newBullets[i]
                    }
                 });
            } else {
                 console.log(`Original bullet retained for ${project.title} at order ${sortedBullets[i].order}`);
            }
        }
    }
  }

  console.log("Done seeding AI Content Evaluation domain data.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
