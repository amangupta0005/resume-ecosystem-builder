import { z } from "zod";

import { DOMAIN_NAMES } from "@/lib/constants/domains";

export const projectStatusSchema = z.enum(["completed", "in-progress"]);

export const domainNameSchema = z.enum(DOMAIN_NAMES);

// Security: Enforce safe web protocols (http / https) to prevent javascript: or data: XSS injection
const safeUrlSchema = z
  .string()
  .trim()
  .max(500, "URL is too long")
  .refine(
    (val) => !val || /^https?:\/\//i.test(val),
    { message: "URL must start with http:// or https://" }
  )
  .optional()
  .or(z.literal(""));

export const bulletSchema = z.object({
  id: z.string().cuid().optional(),
  text: z.string().trim().min(1, "Bullet text is required").max(2000, "Bullet text cannot exceed 2000 characters"),
  order: z.number().int().min(0).max(100),
});

export const projectSchema = z.object({
  id: z.string().cuid().optional(),
  title: z.string().trim().min(1, "Project title is required").max(120, "Title cannot exceed 120 characters"),
  description: z.string().trim().min(1, "Project description is required").max(1000, "Description cannot exceed 1000 characters"),
  techStack: z
    .array(z.string().trim().min(1, "Tech cannot be empty").max(50, "Tech tag is too long"))
    .min(1, "Add at least one tech")
    .max(30, "Cannot exceed 30 tech items"),
  status: projectStatusSchema,
  githubUrl: safeUrlSchema,
  liveUrl: safeUrlSchema,
  domainNames: z.array(domainNameSchema).min(1, "Choose at least one domain").max(10),
  bullets: z.array(bulletSchema).min(1, "Add at least one bullet").max(30, "Cannot exceed 30 bullets"),
});

export const resumeProjectSchema = z.object({
  resumeConfigId: z.string().cuid(),
  projectId: z.string().cuid(),
  included: z.boolean(),
  order: z.number().int().min(0),
});

export const resumeBulletOverrideSchema = z.object({
  resumeConfigId: z.string().cuid(),
  bulletId: z.string().cuid(),
  text: z.string().trim().min(1, "Override text is required").max(2000, "Override text cannot exceed 2000 characters"),
});

export type ProjectStatusInput = z.infer<typeof projectStatusSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type BulletInput = z.infer<typeof bulletSchema>;
export type ResumeProjectInput = z.infer<typeof resumeProjectSchema>;
export type ResumeBulletOverrideInput = z.infer<
  typeof resumeBulletOverrideSchema
>;
