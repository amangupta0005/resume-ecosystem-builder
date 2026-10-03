import crypto from "crypto";
import { ATS_TECH_KEYWORDS, ATS_ACTION_VERBS } from "@/lib/atsHighlighter";
import {
  callLlmStructured,
  isAiEnabled,
} from "@/lib/ai/client";
import {
  JD_EXTRACTION_SYSTEM_PROMPT,
  SKILL_GAP_ANALYSIS_SYSTEM_PROMPT,
  BULLET_SUGGESTION_SYSTEM_PROMPT,
} from "@/lib/ai/prompts";
import {
  type JdMatchResult,
  type SkillGapItem,
  type BulletSuggestionAction,
  type BulletSuggestionResult,
  jdMatchResultSchema,
  bulletSuggestionResultSchema,
} from "@/lib/validations/ai";
import { getCache, setCache, checkRateLimit } from "@/lib/redis";
import type { ResumeDocumentData } from "@/features/preview/server/queries";

// Rate limiting and cache constants
const AI_RATE_LIMIT_WINDOW = 60 * 10; // 10 minutes
const AI_MAX_REQUESTS_PER_WINDOW = 25; // 25 requests per 10 mins
const AI_ANALYSIS_CACHE_TTL = 60 * 60 * 6; // 6 hours

/**
 * Generate a deterministic hash for caching JD analysis
 */
export function generateAnalysisCacheKey(
  resumeConfigId: string,
  resumeContentHash: string,
  jobDescription: string
): string {
  const jdHash = crypto
    .createHash("sha256")
    .update(jobDescription.trim().toLowerCase())
    .digest("hex")
    .slice(0, 16);
  return `ai:jd_match:${resumeConfigId}:${resumeContentHash}:${jdHash}`;
}

/**
 * Compute SHA256 of resume text
 */
export function hashResumeContent(resume: ResumeDocumentData): string {
  const raw = [
    resume.profile.fullName,
    resume.profile.summary || "",
    resume.profile.frameworks.join(","),
    resume.profile.tools.join(","),
    resume.projects
      .map((p) => `${p.title}:${p.techStack.join(",")}:${p.bullets.map((b) => b.text).join("|")}`)
      .join(";;"),
  ].join("::");

  return crypto.createHash("sha256").update(raw).digest("hex").slice(0, 16);
}

/**
 * Step 1: Purely Deterministic Keyword & Tech Extraction
 */
export function extractDeterministicKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  const matched: string[] = [];

  for (const keyword of ATS_TECH_KEYWORDS) {
    const escaped = keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(lower)) {
      matched.push(keyword);
    }
  }

  return Array.from(new Set(matched));
}

/**
 * Step 2: Compare Resume Keywords vs JD Keywords Deterministically
 */
export function computeDeterministicMatch(
  resume: ResumeDocumentData,
  jobDescription: string
) {
  // Extract all resume text into a single search space
  const resumeText = [
    resume.profile.summary || "",
    ...resume.profile.frameworks,
    ...resume.profile.tools,
    ...resume.profile.languages,
    ...resume.profile.strengths,
    ...resume.projects.flatMap((p) => [
      p.title,
      p.description,
      ...p.techStack,
      ...p.bullets.map((b) => b.text),
    ]),
  ].join(" ");

  const resumeKeywords = new Set(
    extractDeterministicKeywords(resumeText).map((k) => k.toLowerCase())
  );
  const jdKeywords = extractDeterministicKeywords(jobDescription);

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const kw of jdKeywords) {
    if (resumeKeywords.has(kw.toLowerCase())) {
      matchedSkills.push(kw);
    } else {
      missingSkills.push(kw);
    }
  }

  const totalTargetKeywords = Math.max(1, jdKeywords.length);
  const matchedCount = matchedSkills.length;
  const coveragePercentage = Math.round((matchedCount / totalTargetKeywords) * 100);

  return {
    matchedSkills,
    missingSkills,
    keywordCoverage: {
      matchedCount,
      totalTargetKeywords,
      percentage: coveragePercentage,
    },
    // Baseline deterministic score weighted on keyword coverage
    deterministicScore: Math.min(100, coveragePercentage),
  };
}

/**
 * Perform Complete Hybrid JD Match (Deterministic Exact Match + LLM Semantic Analysis)
 */
export async function analyzeResumeAgainstJd(
  resumeConfigId: string,
  resume: ResumeDocumentData,
  jobDescription: string,
  clientIp: string = "127.0.0.1"
): Promise<{ result: JdMatchResult; fromCache: boolean }> {
  // 1. Rate Limiting Check
  const rateLimitKey = `ratelimit:ai:${clientIp}`;
  const rateLimit = await checkRateLimit(
    rateLimitKey,
    AI_MAX_REQUESTS_PER_WINDOW,
    AI_RATE_LIMIT_WINDOW
  );

  if (!rateLimit.allowed) {
    throw new Error(
      `Rate limit exceeded for AI analysis. Please wait ${Math.ceil(
        rateLimit.resetSeconds / 60
      )} minutes before running another check.`
    );
  }

  // 2. Deterministic Hash & Cache Lookup
  const contentHash = hashResumeContent(resume);
  const cacheKey = generateAnalysisCacheKey(resumeConfigId, contentHash, jobDescription);
  const cached = await getCache<JdMatchResult>(cacheKey);

  if (cached) {
    return { result: { ...cached, fromCache: true }, fromCache: true };
  }

  // 3. Compute Deterministic Foundation
  const deterministic = computeDeterministicMatch(resume, jobDescription);

  // 4. Run LLM Semantic Analysis with Deterministic Guardrails
  const fallbackGenerator = (): JdMatchResult => {
    // Generate deterministic gaps when LLM is unavailable
    const skillGaps: SkillGapItem[] = [
      ...deterministic.matchedSkills.map((s) => ({
        skill: s,
        category: "critical" as const,
        status: "already_present" as const,
        rationale: "Directly verified in projects/skills repository.",
      })),
      ...deterministic.missingSkills.map((s, idx) => ({
        skill: s,
        category: (idx === 0 ? "critical" : idx < 3 ? "important" : "nice_to_have") as SkillGapItem["category"],
        status: "missing" as const,
        rationale: "Required by job description but not explicitly found in active resume configuration.",
      })),
    ];

    const compositeScore = deterministic.deterministicScore;

    return {
      jobTitle: "Target Technical Role",
      atsMatchScore: compositeScore,
      deterministicScore: deterministic.deterministicScore,
      semanticRelevanceScore: compositeScore,
      keywordCoverage: deterministic.keywordCoverage,
      matchedSkills: deterministic.matchedSkills,
      missingSkills: deterministic.missingSkills,
      skillGaps,
      relevantExperienceSummary: `Your resume demonstrates direct alignment with ${deterministic.matchedSkills.length} key technical requirements identified in the role.`,
      recommendations: [
        deterministic.missingSkills.length > 0
          ? `If you have worked with ${deterministic.missingSkills.slice(0, 3).join(", ")}, incorporate verifiable bullet points illustrating their real-world usage.`
          : "Your technical keywords align strongly with the job posting.",
        "Ensure bullet points start with strong action verbs and articulate measurable engineering outcomes.",
      ],
      fromCache: false,
    };
  };

  const resumeCompactSummary = `
Candidate: ${resume.profile.fullName}
Summary: ${resume.profile.summary || "N/A"}
Frameworks: ${resume.profile.frameworks.join(", ")}
Tools: ${resume.profile.tools.join(", ")}
Projects:
${resume.projects
  .map(
    (p) =>
      `- ${p.title} (${p.techStack.join(", ")}):\n  ${p.bullets.map((b) => `* ${b.text}`).join("\n  ")}`
  )
  .join("\n")}
`;

  const userPrompt = `
<job_description>
${jobDescription.slice(0, 6000)}
</job_description>

<resume_content>
${resumeCompactSummary.slice(0, 6000)}
</resume_content>

<exact_matches>
Matched: ${deterministic.matchedSkills.join(", ") || "None"}
Missing: ${deterministic.missingSkills.join(", ") || "None"}
Keyword Coverage: ${deterministic.keywordCoverage.percentage}%
</exact_matches>

Extract the job title and evaluate semantic alignment and skill gaps. Follow instructions strictly.
`;

  type LlmGapResponse = {
    jobTitle?: string;
    semanticRelevanceScore?: number;
    skillGaps?: SkillGapItem[];
    relevantExperienceSummary?: string;
    recommendations?: string[];
  };

  const llmResponse = await callLlmStructured<LlmGapResponse>({
    systemPrompt: SKILL_GAP_ANALYSIS_SYSTEM_PROMPT,
    userPrompt,
    fallbackGenerator: () => ({}),
  });

  const semanticScore =
    typeof llmResponse.semanticRelevanceScore === "number"
      ? Math.min(100, Math.max(0, llmResponse.semanticRelevanceScore))
      : deterministic.deterministicScore;

  // Composite ATS Match Score: 60% deterministic keyword match + 40% semantic depth
  const atsMatchScore = Math.round(
    deterministic.deterministicScore * 0.6 + semanticScore * 0.4
  );

  const fallback = fallbackGenerator();

  const finalResult: JdMatchResult = {
    jobTitle: llmResponse.jobTitle || fallback.jobTitle,
    atsMatchScore,
    deterministicScore: deterministic.deterministicScore,
    semanticRelevanceScore: semanticScore,
    keywordCoverage: deterministic.keywordCoverage,
    matchedSkills: deterministic.matchedSkills,
    missingSkills: deterministic.missingSkills,
    skillGaps:
      Array.isArray(llmResponse.skillGaps) && llmResponse.skillGaps.length > 0
        ? llmResponse.skillGaps
        : fallback.skillGaps,
    relevantExperienceSummary:
      llmResponse.relevantExperienceSummary || fallback.relevantExperienceSummary,
    recommendations:
      Array.isArray(llmResponse.recommendations) && llmResponse.recommendations.length > 0
        ? llmResponse.recommendations
        : fallback.recommendations,
    fromCache: false,
  };

  // Validate output against Zod schema
  const parsed = jdMatchResultSchema.safeParse(finalResult);
  const validatedResult = parsed.success ? parsed.data : fallback;

  // Cache result for 6 hours
  await setCache(cacheKey, validatedResult, AI_ANALYSIS_CACHE_TTL);

  return { result: validatedResult, fromCache: false };
}

/**
 * AI Bullet Refinement Service
 */
export async function suggestBulletRefinement(params: {
  currentText: string;
  action: BulletSuggestionAction;
  jobContext?: string;
  techContext?: string[];
  clientIp?: string;
}): Promise<BulletSuggestionResult> {
  const { currentText, action, jobContext, techContext, clientIp = "127.0.0.1" } = params;

  // Rate Limiting
  const rateLimitKey = `ratelimit:ai:${clientIp}`;
  const rateLimit = await checkRateLimit(
    rateLimitKey,
    AI_MAX_REQUESTS_PER_WINDOW,
    AI_RATE_LIMIT_WINDOW
  );

  if (!rateLimit.allowed) {
    throw new Error(
      `Rate limit reached for AI suggestions. Please wait ${Math.ceil(
        rateLimit.resetSeconds / 60
      )} minutes.`
    );
  }

  // Fallback heuristic engine if offline/key missing
  const fallbackGenerator = (): BulletSuggestionResult => {
    const firstWord = currentText.trim().split(/\s+/)[0] || "";
    const hasStrongVerb = ATS_ACTION_VERBS.some(
      (v) => v.toLowerCase() === firstWord.toLowerCase()
    );

    let suggestedText = currentText;
    let actionVerbUsed = hasStrongVerb ? firstWord : "Engineered";
    let explanation = "Refined phrasing for active voice and technical clarity.";

    if (action === "fix_action_verb" || !hasStrongVerb) {
      suggestedText = `Engineered ${currentText.charAt(0).toLowerCase() + currentText.slice(1)}`;
      explanation = "Replaced passive or weak opening verb with strong engineering action verb.";
    } else if (action === "make_concise") {
      suggestedText = currentText
        .replace(/\b(in order to|with the aim of|responsible for)\b/gi, "")
        .replace(/\s{2,}/g, " ")
        .trim();
      explanation = "Eliminated redundant filler words while preserving key technologies.";
    } else if (action === "improve_impact") {
      suggestedText = `${currentText} ensuring production stability and modular maintainability.`;
      explanation = "Emphasized engineering robustness and architectural impact.";
    }

    return {
      suggestedText,
      explanation,
      actionVerbUsed,
      atsImprovementNote: "Enhanced for ATS readability and impact.",
    };
  };

  const userPrompt = `
<original_bullet>
${currentText}
</original_bullet>

Action requested: ${action}
${jobContext ? `Target Context: ${jobContext.slice(0, 1000)}` : ""}
${techContext && techContext.length > 0 ? `Associated Technologies: ${techContext.join(", ")}` : ""}

Provide the suggested refinement in valid JSON following your instructions.
`;

  const response = await callLlmStructured<BulletSuggestionResult>({
    systemPrompt: BULLET_SUGGESTION_SYSTEM_PROMPT,
    userPrompt,
    fallbackGenerator,
  });

  const parsed = bulletSuggestionResultSchema.safeParse(response);
  return parsed.success ? parsed.data : fallbackGenerator();
}
