import { z } from "zod";

export const toggleProjectInclusionSchema = z.object({
  resumeConfigId: z.string().cuid(),
  projectId: z.string().cuid(),
  included: z.boolean(),
});

export const reorderResumeProjectsSchema = z.object({
  resumeConfigId: z.string().cuid(),
  projectIds: z.array(z.string().cuid()).min(1),
});

export const saveBulletOverrideSchema = z.object({
  resumeConfigId: z.string().cuid(),
  bulletId: z.string().cuid(),
  text: z.string().trim().min(1, "Bullet override text cannot be empty"),
});

export const revertBulletOverrideSchema = z.object({
  resumeConfigId: z.string().cuid(),
  bulletId: z.string().cuid(),
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
