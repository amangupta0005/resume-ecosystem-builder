import { z } from "zod";

import { DOMAIN_NAMES } from "@/lib/constants/domains";

export const projectStatusSchema = z.enum(["completed", "in-progress"]);

export const domainNameSchema = z.enum(DOMAIN_NAMES);

export const bulletSchema = z.object({
  id: z.string().cuid().optional(),
  text: z.string().trim().min(1, "Bullet text is required"),
  order: z.number().int().min(0),
});

export const projectSchema = z.object({
  id: z.string().cuid().optional(),
  title: z.string().trim().min(1, "Project title is required"),
  description: z.string().trim().min(1, "Project description is required"),
  techStack: z.array(z.string().trim().min(1)).min(1, "Add at least one tech"),
  status: projectStatusSchema,
  githubUrl: z.string().trim().optional().or(z.literal("")),
  liveUrl: z.string().trim().optional().or(z.literal("")),
  domainNames: z.array(domainNameSchema).min(1, "Choose at least one domain"),
  bullets: z.array(bulletSchema).min(1, "Add at least one bullet"),
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
  text: z.string().trim().min(1, "Override text is required"),
});

export type ProjectStatusInput = z.infer<typeof projectStatusSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type BulletInput = z.infer<typeof bulletSchema>;
export type ResumeProjectInput = z.infer<typeof resumeProjectSchema>;
export type ResumeBulletOverrideInput = z.infer<
  typeof resumeBulletOverrideSchema
>;
