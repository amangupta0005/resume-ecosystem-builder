import { notFound } from "next/navigation";
import { DOMAIN_NAMES, domainToSlug, type DomainName } from "@/lib/constants/domains";
import { prisma } from "@/lib/db";
import { toProjectStatusInput, isDomainName } from "@/features/projects/server/mappers";

export type ResumeBulletData = {
  id: string;
  order: number;
  originalText: string;
  overrideText?: string;
  effectiveText: string;
  isOverridden: boolean;
};

export type ResumeProjectData = {
  id: string;
  resumeProjectId: string;
  title: string;
  description: string;
  techStack: string[];
  status: "completed" | "in-progress";
  domains: DomainName[];
  isDomainMatch: boolean;
  included: boolean;
  order: number;
  githubUrl?: string | null;
  liveUrl?: string | null;
  bullets: ResumeBulletData[];
};

export type ResumeConfigData = {
  resumeConfigId: string;
  domainName: DomainName;
  domainSlug: string;
  projects: ResumeProjectData[];
  includedCount: number;
  overrideCount: number;
};

export type DomainResumeOverviewItem = {
  domainName: DomainName;
  domainSlug: string;
  taggedProjectCount: number;
  includedProjectCount: number;
  overrideCount: number;
};

export type ResumeVariantItem = {
  id: string;
  variantName: string;
  isDefault: boolean;
};

export async function getDomainResumesOverview(): Promise<DomainResumeOverviewItem[]> {
  const domains = await prisma.domain.findMany({
    include: {
      projects: true,
      resumeConfigs: {
        include: {
          projects: {
            where: { included: true },
          },
          bulletOverrides: true,
        },
      },
    },
  });

  return DOMAIN_NAMES.map((name) => {
    const domainRecord = domains.find((d) => d.name === name);
    const resumeConfig = domainRecord?.resumeConfigs[0];

    return {
      domainName: name,
      domainSlug: domainToSlug(name),
      taggedProjectCount: domainRecord?.projects.length ?? 0,
      includedProjectCount: resumeConfig?.projects.length ?? 0,
      overrideCount: resumeConfig?.bulletOverrides.length ?? 0,
    };
  });
}

export async function getDomainVariants(domainName: DomainName): Promise<ResumeVariantItem[]> {
  const domain = await prisma.domain.findUnique({
    where: { name: domainName },
    include: {
      resumeConfigs: {
        select: { id: true, variantName: true, isDefault: true },
        orderBy: { isDefault: "desc" },
      },
    },
  });
  return domain?.resumeConfigs ?? [];
}

export async function getResumeConfigData(
  domainName: DomainName,
  configId?: string
): Promise<ResumeConfigData> {
  // 1. Ensure Domain exists
  let domain = await prisma.domain.findUnique({
    where: { name: domainName },
  });

  if (!domain) {
    domain = await prisma.domain.create({
      data: { name: domainName },
    });
  }

  // 2. Ensure ResumeConfig exists
  let resumeConfig = null;
  
  if (configId) {
    resumeConfig = await prisma.resumeConfig.findUnique({
      where: { id: configId },
    });
    if (!resumeConfig) {
      notFound();
    }
  } else {
    resumeConfig = await prisma.resumeConfig.findFirst({
      where: { domainId: domain.id, isDefault: true },
    });
    if (!resumeConfig) {
      resumeConfig = await prisma.resumeConfig.findFirst({
        where: { domainId: domain.id },
      });
    }
  }

  if (!resumeConfig) {
    resumeConfig = await prisma.resumeConfig.create({
      data: { 
        domainId: domain.id,
        variantName: "Default",
        isDefault: true
      },
    });
  }

  // 3. Fetch all projects with their domains and bullets
  const allProjects = await prisma.project.findMany({
    include: {
      domains: {
        include: {
          domain: true,
        },
      },
      bullets: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // 4. Fetch existing ResumeProject entries for this config
  const existingResumeProjects = await prisma.resumeProject.findMany({
    where: { resumeConfigId: resumeConfig.id },
    orderBy: { order: "asc" },
  });

  const existingProjectIds = new Set(existingResumeProjects.map((rp) => rp.projectId));

  // 5. If any projects are missing from ResumeProject, create them
  // Tagged projects are set included=true by default, others included=false
  let nextOrder = existingResumeProjects.length;
  for (const project of allProjects) {
    if (!existingProjectIds.has(project.id)) {
      const isTagged = project.domains.some((pd) => pd.domain.name === domainName);
      await prisma.resumeProject.create({
        data: {
          resumeConfigId: resumeConfig.id,
          projectId: project.id,
          included: isTagged,
          order: nextOrder++,
        },
      });
    }
  }

  // 6. Refetch all ResumeProjects in order with full project relations
  const resumeProjects = await prisma.resumeProject.findMany({
    where: { resumeConfigId: resumeConfig.id },
    orderBy: { order: "asc" },
    include: {
      project: {
        include: {
          domains: {
            include: { domain: true },
          },
          bullets: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  // 7. Fetch all bullet overrides for this resume config
  const overrides = await prisma.resumeBulletOverride.findMany({
    where: { resumeConfigId: resumeConfig.id },
  });

  const overrideMap = new Map<string, string>();
  for (const ov of overrides) {
    overrideMap.set(ov.bulletId, ov.text);
  }

  // 8. Transform into typed UI structure
  const formattedProjects: ResumeProjectData[] = resumeProjects.map((rp) => {
    const projectDomains = rp.project.domains
      .map((pd) => pd.domain.name)
      .filter(isDomainName);
    const isDomainMatch = projectDomains.includes(domainName);

    const formattedBullets: ResumeBulletData[] = rp.project.bullets.map((b) => {
      const overrideText = overrideMap.get(b.id);
      return {
        id: b.id,
        order: b.order,
        originalText: b.text,
        overrideText: overrideText,
        effectiveText: overrideText ?? b.text,
        isOverridden: overrideText !== undefined,
      };
    });

    return {
      id: rp.project.id,
      resumeProjectId: rp.id,
      title: rp.project.title,
      description: rp.project.description,
      techStack: rp.project.techStack,
      status: toProjectStatusInput(rp.project.status),
      domains: projectDomains,
      isDomainMatch,
      included: rp.included,
      order: rp.order,
      githubUrl: rp.project.githubUrl,
      liveUrl: rp.project.liveUrl,
      bullets: formattedBullets,
    };
  });

  const includedCount = formattedProjects.filter((p) => p.included).length;
  const overrideCount = overrides.length;

  return {
    resumeConfigId: resumeConfig.id,
    domainName,
    domainSlug: domainToSlug(domainName),
    projects: formattedProjects,
    includedCount,
    overrideCount,
  };
}
