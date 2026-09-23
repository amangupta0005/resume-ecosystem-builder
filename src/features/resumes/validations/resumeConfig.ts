import { z } from "zod";

export const toggleProjectInclusionSchema = z.object({
  resumeConfigId: z.string().cuid(),
  projectId: z.string().cuid(),
  included: z.boolean(),
});

export const reorderResumeProjectsSchema = z.object({
  resumeConfigId: z.string().cuid(),
  projectIds: z.array(z.string().cuid()).min(1).max(50),
});

export const saveBulletOverrideSchema = z.object({
  resumeConfigId: z.string().cuid(),
  bulletId: z.string().cuid(),
  text: z.string().trim().min(1, "Bullet override text cannot be empty").max(2000, "Override text cannot exceed 2000 characters"),
});

export const revertBulletOverrideSchema = z.object({
  resumeConfigId: z.string().cuid(),
  bulletId: z.string().cuid(),
});

export const duplicateResumeConfigSchema = z.object({
  sourceConfigId: z.string().cuid(),
  newVariantName: z.string().trim().min(1, "Variant name cannot be empty").max(60, "Variant name cannot exceed 60 characters"),
});

export type ToggleProjectInclusionInput = z.infer<
  typeof toggleProjectInclusionSchema
>;
export type ReorderResumeProjectsInput = z.infer<
  typeof reorderResumeProjectsSchema
>;
export type SaveBulletOverrideInput = z.infer<typeof saveBulletOverrideSchema>;
export type RevertBulletOverrideInput = z.infer<
  typeof revertBulletOverrideSchema
>;
export type DuplicateResumeConfigInput = z.infer<
  typeof duplicateResumeConfigSchema
>;
