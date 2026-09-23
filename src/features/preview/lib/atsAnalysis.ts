import type { DomainName } from "@/lib/constants/domains";
import type { ProfileData } from "@/features/profile/server/queries";

export const STRONG_ACTION_VERBS = new Set([
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
  resumeConfigId: string;
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
