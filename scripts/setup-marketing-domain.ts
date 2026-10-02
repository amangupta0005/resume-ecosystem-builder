import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Setting up Marketing / Founder's Office domain...");

  // 1. Ensure Marketing Domain exists
  const marketingDomain = await prisma.domain.upsert({
    where: { name: "Marketing" },
    update: {},
    create: { name: "Marketing" },
  });
  console.log(`Domain ensured: ${marketingDomain.name} (${marketingDomain.id})`);

  // 2. Create or update the specialized Real Estate & Lead Tracker project
  let realEstateProject = await prisma.project.findFirst({
    where: {
      OR: [
        { title: { contains: "Micro-Market Real Estate" } },
        { title: { contains: "Co-Living" } },
      ],
    },
  });

  const projectData = {
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
    status: "completed" as const,
    githubUrl: null,
    liveUrl: null,
  };

  if (!realEstateProject) {
    realEstateProject = await prisma.project.create({
      data: {
        ...projectData,
        bullets: {
          create: [
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
          ],
        },
      },
    });
    console.log(`Created project: ${realEstateProject.title}`);
  } else {
    realEstateProject = await prisma.project.update({
      where: { id: realEstateProject.id },
      data: projectData,
    });
    console.log(`Updated project: ${realEstateProject.title}`);
  }

  // Ensure project is tagged to Marketing domain
  await prisma.projectDomain.upsert({
    where: {
      projectId_domainId: {
        projectId: realEstateProject.id,
        domainId: marketingDomain.id,
      },
    },
    update: {},
    create: {
      projectId: realEstateProject.id,
      domainId: marketingDomain.id,
    },
  });

  // Find other projects to tag to Marketing
  const collabTrack = await prisma.project.findFirst({
    where: { title: { contains: "CollabTrack" } },
    include: { bullets: { orderBy: { order: "asc" } } },
  });

  const resumeBuilder = await prisma.project.findFirst({
    where: { title: { contains: "Resume Ecosystem" } },
    include: { bullets: { orderBy: { order: "asc" } } },
  });

  if (collabTrack) {
    await prisma.projectDomain.upsert({
      where: {
        projectId_domainId: {
          projectId: collabTrack.id,
          domainId: marketingDomain.id,
        },
      },
      update: {},
      create: {
        projectId: collabTrack.id,
        domainId: marketingDomain.id,
      },
    });
  }

  if (resumeBuilder) {
    await prisma.projectDomain.upsert({
      where: {
        projectId_domainId: {
          projectId: resumeBuilder.id,
          domainId: marketingDomain.id,
        },
      },
      update: {},
      create: {
        projectId: resumeBuilder.id,
        domainId: marketingDomain.id,
      },
    });
  }

  // 3. Create or update Default ResumeConfig for Marketing
  let resumeConfig = await prisma.resumeConfig.findFirst({
    where: { domainId: marketingDomain.id, isDefault: true },
  });

  const tailoredSkills = [
    {
      category: "Executive Assistance & Operations",
      skills:
        "Calendar Scheduling, Meeting Agendas & Briefs, Lead Pipeline Tracking, Email & WhatsApp Coordination, Open-Item Follow-ups, Confidential Data Handling",
    },
    {
      category: "Research & Strategy",
      skills:
        "Micro-Market Real Estate Research, Demographic & Competitor Analysis, Report Writing, Executive Decks (Canva/Slides), Proposal Drafting",
    },
    {
      category: "Tools & Productivity",
      skills:
        "Google Workspace (Sheets, Docs, Slides, Drive, Calendar, Gmail), MS Excel & Office, Canva, LinkedIn & Sales Navigator, CRM Systems, Automation",
    },
    {
      category: "Communication & Languages",
      skills:
        "Professional Written & Spoken English (Fluent), Hindi (Fluent), Stakeholder Outreach, Cross-Functional Team Collaboration",
    },
  ];

  const configData = {
    title: "Virtual Assistant – Founder's Office | Operations & Market Intelligence",
    variantName: "Default",
    isDefault: true,
    summary:
      "Proactive, tech-enabled engineering student with a 9.42 CGPA and strong competencies in executive coordination, micro-market research, and data-driven lead management. Highly proficient in Google Workspace, MS Excel, Canva, and LinkedIn outreach, with a proven ability to synthesize market data into actionable executive briefs. Known for proactive follow-ups, meticulous calendar management, and building automated tracking systems that eliminate operational friction for fast-moving founders.",
    skills: tailoredSkills,
  };

  if (!resumeConfig) {
    resumeConfig = await prisma.resumeConfig.create({
      data: {
        domainId: marketingDomain.id,
        ...configData,
      },
    });
    console.log(`Created ResumeConfig for Marketing: ${resumeConfig.id}`);
  } else {
    resumeConfig = await prisma.resumeConfig.update({
      where: { id: resumeConfig.id },
      data: configData,
    });
    console.log(`Updated ResumeConfig for Marketing: ${resumeConfig.id}`);
  }

  // 4. Set up ResumeProjects for this config
  const allProjects = await prisma.project.findMany();
  
  // Clear existing ResumeProjects for this config
  await prisma.resumeProject.deleteMany({
    where: { resumeConfigId: resumeConfig.id },
  });

  // Target inclusion priority:
  // 0: Micro-Market Real Estate
  // 1: CollabTrack
  // 2: Resume Ecosystem Builder
  const prioritizedIds = [
    realEstateProject.id,
    collabTrack?.id,
    resumeBuilder?.id,
  ].filter(Boolean) as string[];

  let orderIndex = 0;
  for (const pId of prioritizedIds) {
    await prisma.resumeProject.create({
      data: {
        resumeConfigId: resumeConfig.id,
        projectId: pId,
        included: true,
        order: orderIndex++,
      },
    });
  }

  // Add the remaining projects as unincluded
  for (const p of allProjects) {
    if (!prioritizedIds.includes(p.id)) {
      await prisma.resumeProject.create({
        data: {
          resumeConfigId: resumeConfig.id,
          projectId: p.id,
          included: false,
          order: orderIndex++,
        },
      });
    }
  }

  // 5. Add tailored Bullet Overrides for CollabTrack and Resume Ecosystem on this resume
  await prisma.resumeBulletOverride.deleteMany({
    where: { resumeConfigId: resumeConfig.id },
  });

  if (collabTrack && collabTrack.bullets.length >= 3) {
    const ctOverrides = [
      "Coordinated end-to-end team workflows and stakeholder communications across student initiatives, managing role delegation, timeline milestones, and accountability trackers.",
      "Maintained centralized documentation, meeting notes, and action-item trackers, proactively following up with team leads to close open deliverables ahead of deadlines.",
      "Designed intuitive tracking dashboards and communication protocols, reducing project bottlenecks and improving response turnaround times.",
    ];

    for (let i = 0; i < 3; i++) {
      if (collabTrack.bullets[i]) {
        await prisma.resumeBulletOverride.create({
          data: {
            resumeConfigId: resumeConfig.id,
            bulletId: collabTrack.bullets[i].id,
            text: ctOverrides[i],
          },
        });
      }
    }
  }

  if (resumeBuilder && resumeBuilder.bullets.length >= 3) {
    const rbOverrides = [
      "Developed a high-precision document generation platform producing tailored, executive-ready profile documents and reports with strict quality standards.",
      "Synthesized complex requirements into clean visual layouts and structured data summaries, optimizing readability and engagement for executive reviewers.",
      "Managed end-to-end project deployment and domain automation, demonstrating high ownership, self-directed problem solving, and technical versatility.",
    ];

    for (let i = 0; i < 3; i++) {
      if (resumeBuilder.bullets[i]) {
        await prisma.resumeBulletOverride.create({
          data: {
            resumeConfigId: resumeConfig.id,
            bulletId: resumeBuilder.bullets[i].id,
            text: rbOverrides[i],
          },
        });
      }
    }
  }

  console.log("Marketing / Founder's Office resume configuration completely setup!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
