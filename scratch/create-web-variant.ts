import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Find Full-Stack domain
  const domain = await prisma.domain.findUnique({
    where: { name: "Full-Stack" }
  });

  if (!domain) {
    throw new Error("Full-Stack domain not found");
  }

  // 2. Find the default config for Full-Stack
  const defaultConfig = await prisma.resumeConfig.findFirst({
    where: { domainId: domain.id, isDefault: true },
    include: {
      projects: true,
      bulletOverrides: true
    }
  });

  if (!defaultConfig) {
    throw new Error("Default config not found");
  }

  // 3. Create the new variant
  const newConfig = await prisma.resumeConfig.create({
    data: {
      domainId: domain.id,
      variantName: "FullStack(web-focussed)",
      isDefault: false,
      title: defaultConfig.title,
      summary: defaultConfig.summary,
      skills: defaultConfig.skills as any,
    }
  });

  // 4. Find NeuroShield project
  const neuroShield = await prisma.project.findFirst({
    where: { title: { contains: "NeuroShield" } },
    include: { bullets: { orderBy: { order: "asc" } } }
  });

  if (!neuroShield) {
    throw new Error("NeuroShield project not found");
  }

  const collabTrack = await prisma.project.findFirst({
    where: { title: { contains: "CollabTrack" } }
  });

  // 5. Clone ResumeProjects from default config, but swap CollabTrack with NeuroShield
  let orderIndex = 0;
  for (const rp of defaultConfig.projects) {
    let projectIdToInclude = rp.projectId;
    let included = rp.included;

    if (collabTrack && rp.projectId === collabTrack.id) {
      included = false;
    }

    await prisma.resumeProject.create({
      data: {
        resumeConfigId: newConfig.id,
        projectId: projectIdToInclude,
        included: included,
        order: rp.order
      }
    });
  }

  // Add NeuroShield if it wasn't already in the default config's projects
  const hasNeuroShield = defaultConfig.projects.some(rp => rp.projectId === neuroShield.id);
  if (!hasNeuroShield) {
    await prisma.resumeProject.create({
      data: {
        resumeConfigId: newConfig.id,
        projectId: neuroShield.id,
        included: true,
        order: defaultConfig.projects.length // append at the end
      }
    });
  } else {
    // If it was already there, just make sure it is included
    await prisma.resumeProject.updateMany({
      where: { resumeConfigId: newConfig.id, projectId: neuroShield.id },
      data: { included: true }
    });
  }

  // Swap their orders if needed? The user said "swap the collab track with neuro shield", meaning NeuroShield should take CollabTrack's place in the order.
  if (collabTrack && hasNeuroShield) {
    const ctRp = await prisma.resumeProject.findFirst({ where: { resumeConfigId: newConfig.id, projectId: collabTrack.id } });
    const nsRp = await prisma.resumeProject.findFirst({ where: { resumeConfigId: newConfig.id, projectId: neuroShield.id } });
    if (ctRp && nsRp) {
      const ctOrder = ctRp.order;
      const nsOrder = nsRp.order;
      
      // Temporarily change orders to avoid unique constraint
      await prisma.resumeProject.update({ where: { id: ctRp.id }, data: { order: ctOrder + 1000 } });
      await prisma.resumeProject.update({ where: { id: nsRp.id }, data: { order: nsOrder + 1000 } });
      
      // Swap them
      await prisma.resumeProject.update({ where: { id: ctRp.id }, data: { order: nsOrder } });
      await prisma.resumeProject.update({ where: { id: nsRp.id }, data: { order: ctOrder } });
    }
  } else if (collabTrack && !hasNeuroShield) {
    const ctRp = await prisma.resumeProject.findFirst({ where: { resumeConfigId: newConfig.id, projectId: collabTrack.id } });
    const nsRp = await prisma.resumeProject.findFirst({ where: { resumeConfigId: newConfig.id, projectId: neuroShield.id } });
    if (ctRp && nsRp) {
       // swap orders
       const ctOrder = ctRp.order;
       const nsOrder = nsRp.order;
       await prisma.resumeProject.update({ where: { id: ctRp.id }, data: { order: ctOrder + 1000 } });
       await prisma.resumeProject.update({ where: { id: nsRp.id }, data: { order: nsOrder + 1000 } });
       await prisma.resumeProject.update({ where: { id: ctRp.id }, data: { order: nsOrder } });
       await prisma.resumeProject.update({ where: { id: nsRp.id }, data: { order: ctOrder } });
    }
  }

  // 6. Create custom bullet overrides for NeuroShield
  const newBullets = [
    "Architected a real-time telemetry dashboard using React 19, Vite, and Tailwind CSS to monitor cognitive fatigue data via a Node.js and Express backend pipeline.",
    "Developed a Chrome Extension using Manifest V3 to seamlessly capture and sync browser interaction metrics with the live dashboard across different runtime environments.",
    "Integrated XGBoost and Scikit-Learn machine learning models into the telemetry pipeline, serving structured outputs and insights directly to the frontend interface."
  ];

  for (let i = 0; i < neuroShield.bullets.length && i < newBullets.length; i++) {
    await prisma.resumeBulletOverride.create({
      data: {
        resumeConfigId: newConfig.id,
        bulletId: neuroShield.bullets[i].id,
        text: newBullets[i]
      }
    });
  }

  console.log(`Created variant ${newConfig.variantName} successfully.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
