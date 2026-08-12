import { domainToSlug, type DomainName } from "@/lib/constants/domains";
import { prisma } from "@/lib/db";
import { toProjectStatusInput, isDomainName } from "@/features/projects/server/mappers";
import { getProfileData, type ProfileData } from "@/features/profile/server/queries";

const STRONG_ACTION_VERBS = new Set([
  "built",
  "developed",
  "engineered",
  "implemented",
  "architected",
  "designed",
  "optimized",
  "integrated",
  "deployed",
  "created",
  "streamlined",
  "automated",
  "authored",
  "scaled",
  "reduced",
  "accelerated",
  "orchestrated",
  "configured",
  "spearheaded",
  "established",
  "enhanced",
  "delivered",
  "constructed",
  "formulated",
  "trained",
  "fine-tuned",
  "leveraged",
]);

export type AtsAnalysisResult = {
  projectCount: number;
  bulletCount: number;
  customizedBulletCount: number;
  totalWordCount: number;
  actionVerbPercentage: number;
  weakBulletCount: number;
  lengthIssues: {
    bulletId: string;
    projectTitle: string;
    text: string;
    issue: "too_short" | "too_long";
    charCount: number;
  }[];
  atsReadinessScore: number; // 0 - 100
  recommendations: string[];
};

export type ResumeDocumentProject = {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  status: "completed" | "in-progress";
  githubUrl?: string | null;
  liveUrl?: string | null;
  order: number;
  bullets: {
    id: string;
    order: number;
    text: string;
    isOverridden: boolean;
    startsWithActionVerb: boolean;
  }[];
};

export type ResumeDocumentData = {
  domainName: DomainName;
  domainSlug: string;
  profile: ProfileData;
  projects: ResumeDocumentProject[];
  aggregatedSkills: string[];
  atsAnalysis: AtsAnalysisResult;
  titleOverride?: string | null;
  summaryOverride?: string | null;
  skillsOverride?: { category: string; skills: string }[] | null;
};

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

export function analyzeAtsCompliance(
  projects: ResumeDocumentProject[],
): AtsAnalysisResult {
  const allBullets = projects.flatMap((p) =>
    p.bullets.map((b) => ({ ...b, projectTitle: p.title })),
  );

  const bulletCount = allBullets.length;
  const customizedBulletCount = allBullets.filter((b) => b.isOverridden).length;

  let totalWords = 0;
  let actionVerbCount = 0;
  const lengthIssues: AtsAnalysisResult["lengthIssues"] = [];

  for (const b of allBullets) {
    const words = b.text.trim().split(/\s+/).filter(Boolean);
    totalWords += words.length;

    const firstWord = words[0]?.toLowerCase().replace(/[^a-z]/g, "") ?? "";
    if (STRONG_ACTION_VERBS.has(firstWord)) {
      actionVerbCount++;
    }

    if (b.text.length < 35) {
      lengthIssues.push({
        bulletId: b.id,
        projectTitle: b.projectTitle,
        text: b.text,
        issue: "too_short",
        charCount: b.text.length,
      });
    } else if (b.text.length > 250) {
      lengthIssues.push({
        bulletId: b.id,
        projectTitle: b.projectTitle,
        text: b.text,
        issue: "too_long",
        charCount: b.text.length,
      });
    }
  }

  const actionVerbPercentage =
    bulletCount > 0 ? Math.round((actionVerbCount / bulletCount) * 100) : 0;

  // Calculate ATS readiness score
  let score = 100;
  const recommendations: string[] = [];

  if (projects.length === 0) {
    return {
      projectCount: 0,
      bulletCount: 0,
      customizedBulletCount: 0,
      totalWordCount: 0,
      actionVerbPercentage: 0,
      weakBulletCount: 0,
      lengthIssues: [],
      atsReadinessScore: 0,
      recommendations: ["Include at least 3-5 projects to build a competitive resume."],
    };
  }

  if (projects.length < 3) {
    score -= 15;
    recommendations.push("Consider including 3-4 key projects to demonstrate comprehensive experience.");
  } else if (projects.length > 6) {
    score -= 10;
    recommendations.push("Consider narrowing down to top 4-5 projects to keep your resume concise and high-impact.");
  }

  if (actionVerbPercentage < 75) {
    score -= 15;
    recommendations.push(
      `Only ${actionVerbPercentage}% of bullets start with strong action verbs. Aim for 85%+ for maximum ATS & recruiter impact.`,
    );
  }

  if (lengthIssues.length > 0) {
    score -= Math.min(15, lengthIssues.length * 5);
    recommendations.push(
      `${lengthIssues.length} bullet(s) fall outside optimal length guidelines (recommended: 40-200 characters).`,
    );
  }

  return {
    projectCount: projects.length,
    bulletCount,
    customizedBulletCount,
    totalWordCount: totalWords,
    actionVerbPercentage,
    weakBulletCount: bulletCount - actionVerbCount,
    lengthIssues,
    atsReadinessScore: Math.min(100, Math.max(0, score)),
    recommendations,
  };
}

export async function getResumeDocumentData(
  domainName: DomainName,
): Promise<ResumeDocumentData> {
  const [domain, profile] = await Promise.all([
    prisma.domain.findUnique({
      where: { name: domainName },
      include: {
        resumeConfigs: {
          include: {
            projects: {
              where: { included: true },
              orderBy: { order: "asc" },
              include: {
                project: {
                  include: {
                    bullets: { orderBy: { order: "asc" } },
                  },
                },
              },
            },
            bulletOverrides: true,
          },
        },
      },
    }),
    getProfileData(),
  ]);

  const resumeConfig = domain?.resumeConfigs[0];
  const overrides = resumeConfig?.bulletOverrides ?? [];
  const overrideMap = new Map<string, string>();
  for (const ov of overrides) {
    overrideMap.set(ov.bulletId, ov.text);
  }

  const rawProjects = resumeConfig?.projects ?? [];
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

  const skillsOverride = resumeConfig?.skills
    ? (resumeConfig.skills as { category: string; skills: string }[])
    : null;

  return {
    domainName,
    domainSlug: domainToSlug(domainName),
    profile,
    projects: formattedProjects,
    aggregatedSkills: Array.from(skillsSet).sort((a, b) => a.localeCompare(b)),
    atsAnalysis,
    titleOverride: resumeConfig?.title,
    summaryOverride: resumeConfig?.summary,
    skillsOverride: skillsOverride,
  };
}

export async function getAllDomainsMatrixData(): Promise<MatrixData> {
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

  const domainCounts: MatrixData["domainCounts"] = {
    "AI/ML": { includedProjects: 0, overridesCount: 0, slug: "ai-ml" },
    "Full-Stack": { includedProjects: 0, overridesCount: 0, slug: "full-stack" },
    "Computer Vision": { includedProjects: 0, overridesCount: 0, slug: "computer-vision" },
    "IoT+ML": { includedProjects: 0, overridesCount: 0, slug: "iot-ml" },
    "AI Content Evaluation": { includedProjects: 0, overridesCount: 0, slug: "ai-content-evaluation" },
  } as any;

  for (const d of domains) {
    if (isDomainName(d.name)) {
      const config = d.resumeConfigs[0];
      domainCounts[d.name as DomainName] = {
        includedProjects: config?.projects.length ?? 0,
        overridesCount: config?.bulletOverrides.length ?? 0,
        slug: domainToSlug(d.name as DomainName),
      };
    }
  }

  const matrixProjects: MatrixProjectItem[] = projects.map((p) => {
    const inclusions: Record<DomainName, boolean> = {
      "AI/ML": false,
      "Full-Stack": false,
      "Computer Vision": false,
      "IoT+ML": false,
      "AI Content Evaluation": false,
    } as any;

    for (const rp of p.resumeProjects) {
      const dName = rp.resumeConfig.domain.name;
      if (isDomainName(dName)) {
        inclusions[dName as DomainName] = rp.included;
      }
    }

    const taggedDomains = p.domains
      .map((pd) => pd.domain.name)
      .filter(isDomainName);

    const bullets = p.bullets.map((b) => {
      const domainVariations: MatrixProjectItem["bullets"][0]["domainVariations"] = {
        "AI/ML": { text: b.text, isOverridden: false },
        "Full-Stack": { text: b.text, isOverridden: false },
        "Computer Vision": { text: b.text, isOverridden: false },
        "IoT+ML": { text: b.text, isOverridden: false },
        "AI Content Evaluation": { text: b.text, isOverridden: false },
      } as any;

      for (const ov of b.overrides) {
        const dName = ov.resumeConfig.domain.name;
        if (isDomainName(dName)) {
          domainVariations[dName as DomainName] = {
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

  return {
    projects: matrixProjects,
    domainCounts,
  };
}
