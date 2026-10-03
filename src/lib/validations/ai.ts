import { z } from "zod";

// ==========================================
// 1. Job Description & Matching Schemas
// ==========================================

export const analyzeJdRequestSchema = z.object({
  resumeConfigId: z.string().cuid({ message: "Invalid resumeConfigId format" }),
  jobDescription: z
    .string()
    .trim()
    .min(50, "Job description must be at least 50 characters long.")
    .max(15000, "Job description exceeds maximum allowed length (15,000 characters)."),
});

export type AnalyzeJdRequest = z.infer<typeof analyzeJdRequestSchema>;

// Skill gap categorization
export const skillGapItemSchema = z.object({
  skill: z.string(),
  category: z.enum(["critical", "important", "nice_to_have"]),
  status: z.enum([
    "already_present",
    "missing",
    "weakly_represented",
    "potentially_relevant",
  ]),
  rationale: z.string(),
});

export type SkillGapItem = z.infer<typeof skillGapItemSchema>;

// Complete JD Match response
export const jdMatchResultSchema = z.object({
  jobTitle: z.string(),
  atsMatchScore: z.number().min(0).max(100),
  deterministicScore: z.number().min(0).max(100),
  semanticRelevanceScore: z.number().min(0).max(100),
  keywordCoverage: z.object({
    matchedCount: z.number(),
    totalTargetKeywords: z.number(),
    percentage: z.number(),
  }),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  skillGaps: z.array(skillGapItemSchema),
  relevantExperienceSummary: z.string(),
  recommendations: z.array(z.string()),
  fromCache: z.boolean().optional(),
});

export type JdMatchResult = z.infer<typeof jdMatchResultSchema>;

// ==========================================
// 2. AI Bullet & Summary Refinement Schemas
// ==========================================

export const bulletSuggestionActionSchema = z.enum([
  "improve_impact",
  "make_concise",
  "tailor_to_jd",
  "fix_action_verb",
]);

export type BulletSuggestionAction = z.infer<typeof bulletSuggestionActionSchema>;

export const bulletSuggestionRequestSchema = z.object({
  resumeConfigId: z.string().cuid(),
  bulletId: z.string().cuid().optional(),
  currentText: z
    .string()
    .trim()
    .min(10, "Original bullet text must be at least 10 characters.")
    .max(1000, "Bullet text is too long (max 1,000 characters)."),
  action: bulletSuggestionActionSchema,
  jobContext: z
    .string()
    .trim()
    .max(5000, "Job context must be under 5,000 characters.")
    .optional(),
  techContext: z.array(z.string()).optional(),
});

export type BulletSuggestionRequest = z.infer<typeof bulletSuggestionRequestSchema>;

export const bulletSuggestionResultSchema = z.object({
  suggestedText: z.string().min(5),
  explanation: z.string(),
  actionVerbUsed: z.string().optional(),
  atsImprovementNote: z.string().optional(),
});

export type BulletSuggestionResult = z.infer<typeof bulletSuggestionResultSchema>;
