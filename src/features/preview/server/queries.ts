import { notFound } from "next/navigation";
import { DOMAIN_NAMES, domainToSlug, type DomainName } from "@/lib/constants/domains";
import { prisma } from "@/lib/db";
import { toProjectStatusInput, isDomainName } from "@/features/projects/server/mappers";
import { getProfileData, type ProfileData } from "@/features/profile/server/queries";
import { getCache, setCache, CACHE_TTL } from "@/lib/redis";

export {
  STRONG_ACTION_VERBS,
  type AtsAnalysisResult,
  type ResumeDocumentProject,
  type ResumeDocumentData,
  analyzeAtsCompliance,
} from "@/features/preview/lib/atsAnalysis";
import {
  STRONG_ACTION_VERBS,
  type ResumeDocumentData,
  type ResumeDocumentProject,
  analyzeAtsCompliance,
} from "@/features/preview/lib/atsAnalysis";

export type MatrixProjectItem = {
  id: string;
  title: string;
  status: "completed" | "in-progress";
  taggedDomains: DomainName[];
  techStack: string[];
  inclusions: Record<DomainName, boolean>;
  bullets: {
    id: string;
    order: number;
    originalText: string;
    domainVariations: Record<
      DomainName,
      {
        text: string;
        isOverridden: boolean;
      }
    >;
  }[];
};

export type MatrixData = {
  projects: MatrixProjectItem[];
  domainCounts: Record<
    DomainName,
    {
      includedProjects: number;
      overridesCount: number;
      slug: string;
    }
  >;
};

export async function getResumeDocumentData(
  domainName: DomainName,
  configId?: string
): Promise<ResumeDocumentData> {
  const cacheKey = `resume_doc:${domainName}:${configId || "default"}`;
  const cached = await getCache<ResumeDocumentData>(cacheKey);
  if (cached) {
    return cached;
  }

  const profile = await getProfileData();

  const includeQuery = {
    projects: {
      where: { included: true },
      orderBy: { order: "asc" as const },
      include: {
        project: {
          include: {
            bullets: { orderBy: { order: "asc" as const } },
          },
        },
      },
    },
    bulletOverrides: true,
  };

  let resumeConfig = null;
  if (configId) {
    resumeConfig = await prisma.resumeConfig.findUnique({
      where: { id: configId },
      include: includeQuery,
    });
  } else {
    resumeConfig = await prisma.resumeConfig.findFirst({
      where: { domain: { name: domainName }, isDefault: true },
      include: includeQuery,
    });
    if (!resumeConfig) {
      resumeConfig = await prisma.resumeConfig.findFirst({
        where: { domain: { name: domainName } },
        include: includeQuery,
      });
    }
  }

  if (!resumeConfig) {
    notFound();
  }

  const overrides = resumeConfig.bulletOverrides;
  const overrideMap = new Map<string, string>();
  for (const ov of overrides) {
    overrideMap.set(ov.bulletId, ov.text);
  }

  const rawProjects = resumeConfig.projects;
  const skillsSet = new Set<string>();

  // Add profile skills
  profile.languages.forEach((l) => skillsSet.add(l));
  profile.frameworks.forEach((f) => skillsSet.add(f));
  profile.tools.forEach((t) => skillsSet.add(t));

  const formattedProjects: ResumeDocumentProject[] = rawProjects.map((rp) => {
    rp.project.techStack.forEach((t) => skillsSet.add(t));

    const bullets = rp.project.bullets.map((b) => {
      const override = overrideMap.get(b.id);
      const effectiveText = override ?? b.text;
      const firstWord =
        effectiveText.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "") ?? "";

      return {
        id: b.id,
        order: b.order,
        text: effectiveText,
        isOverridden: override !== undefined,
        startsWithActionVerb: STRONG_ACTION_VERBS.has(firstWord),
      };
    });

    return {
      id: rp.project.id,
      title: rp.project.title,
      description: rp.project.description,
      techStack: rp.project.techStack,
      status: toProjectStatusInput(rp.project.status),
      githubUrl: rp.project.githubUrl,
      liveUrl: rp.project.liveUrl,
      order: rp.order,
      bullets,
    };
  });

  const atsAnalysis = analyzeAtsCompliance(formattedProjects);

  const skillsOverride = resumeConfig.skills
    ? (resumeConfig.skills as { category: string; skills: string }[])
    : null;

  const result: ResumeDocumentData = {
    resumeConfigId: resumeConfig.id,
    domainName,
    domainSlug: domainToSlug(domainName),
    profile,
    projects: formattedProjects,
    aggregatedSkills: Array.from(skillsSet).sort((a, b) => a.localeCompare(b)),
    atsAnalysis,
    titleOverride: resumeConfig.title,
    summaryOverride: resumeConfig.summary,
    skillsOverride: skillsOverride,
  };

  await setCache(cacheKey, result, CACHE_TTL.RESUME_DOCUMENT);
  return result;
}

export async function getAllDomainsMatrixData(): Promise<MatrixData> {
  const cacheKey = "matrix_data:all";
  const cached = await getCache<MatrixData>(cacheKey);
  if (cached) {
    return cached;
  }

  const [projects, domains] = await Promise.all([
    prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        domains: {
          include: { domain: true },
        },
        bullets: {
          orderBy: { order: "asc" },
          include: {
            overrides: {
              include: {
                resumeConfig: {
                  include: { domain: true },
                },
              },
            },
          },
        },
        resumeProjects: {
          include: {
            resumeConfig: {
              include: { domain: true },
            },
          },
        },
      },
    }),
    prisma.domain.findMany({
      include: {
        resumeConfigs: {
          include: {
            projects: { where: { included: true } },
            bulletOverrides: true,
          },
        },
      },
    }),
  ]);

  const domainCounts = {} as MatrixData["domainCounts"];
  for (const dName of DOMAIN_NAMES) {
    domainCounts[dName] = {
      includedProjects: 0,
      overridesCount: 0,
      slug: domainToSlug(dName),
    };
  }

  for (const d of domains) {
    if (isDomainName(d.name)) {
      const config = d.resumeConfigs[0];
      domainCounts[d.name] = {
        includedProjects: config?.projects.length ?? 0,
        overridesCount: config?.bulletOverrides.length ?? 0,
        slug: domainToSlug(d.name),
      };
    }
  }

  const matrixProjects: MatrixProjectItem[] = projects.map((p) => {
    const inclusions = {} as Record<DomainName, boolean>;
    for (const dName of DOMAIN_NAMES) {
      inclusions[dName] = false;
    }

    for (const rp of p.resumeProjects) {
      const dName = rp.resumeConfig.domain.name;
      if (isDomainName(dName)) {
        inclusions[dName] = rp.included;
      }
    }

    const taggedDomains = p.domains
      .map((pd) => pd.domain.name)
      .filter(isDomainName);

    const bullets = p.bullets.map((b) => {
      const domainVariations = {} as MatrixProjectItem["bullets"][0]["domainVariations"];
      for (const dName of DOMAIN_NAMES) {
        domainVariations[dName] = {
          text: b.text,
          isOverridden: false,
        };
      }

      for (const ov of b.overrides) {
        const dName = ov.resumeConfig.domain.name;
        if (isDomainName(dName)) {
          domainVariations[dName] = {
            text: ov.text,
            isOverridden: true,
          };
        }
      }

      return {
        id: b.id,
        order: b.order,
        originalText: b.text,
        domainVariations,
      };
    });

    return {
      id: p.id,
      title: p.title,
      status: toProjectStatusInput(p.status),
      taggedDomains,
      techStack: p.techStack,
      inclusions,
      bullets,
    };
  });

  const matrixResult: MatrixData = {
    projects: matrixProjects,
    domainCounts,
  };

  await setCache(cacheKey, matrixResult, CACHE_TTL.PORTFOLIO_LIST);
  return matrixResult;
}
