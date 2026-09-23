"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  toggleProjectInclusionSchema,
  reorderResumeProjectsSchema,
  saveBulletOverrideSchema,
  revertBulletOverrideSchema,
  duplicateResumeConfigSchema,
} from "@/features/resumes/validations/resumeConfig";

export type ResumeActionResult = {
  success: boolean;
  message?: string;
};

export async function toggleProjectInclusionAction(
  resumeConfigId: string,
  projectId: string,
  included: boolean,
): Promise<ResumeActionResult> {
  const parsed = toggleProjectInclusionSchema.safeParse({
    resumeConfigId,
    projectId,
    included,
  });

  if (!parsed.success) {
    return { success: false, message: "Invalid project toggle data." };
  }

  try {
    await prisma.resumeProject.update({
      where: {
        resumeConfigId_projectId: {
          resumeConfigId: parsed.data.resumeConfigId,
          projectId: parsed.data.projectId,
        },
      },
      data: {
        included: parsed.data.included,
      },
    });

    revalidatePath("/resumes", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle project inclusion:", error);
    return { success: false, message: "Failed to update project inclusion." };
  }
}

export async function reorderResumeProjectsAction(
  resumeConfigId: string,
  projectIds: string[],
): Promise<ResumeActionResult> {
  const parsed = reorderResumeProjectsSchema.safeParse({
    resumeConfigId,
    projectIds,
  });

  if (!parsed.success) {
    return { success: false, message: "Invalid project reordering data." };
  }

  try {
    // Execute ordering updates in a transaction.
    // Temporary negative indices avoid unique constraint collisions during shift.
    await prisma.$transaction(async (tx) => {
      // Step 1: Set temporary negative order to prevent @@unique([resumeConfigId, order]) collision
      for (let i = 0; i < parsed.data.projectIds.length; i++) {
        const pId = parsed.data.projectIds[i];
        await tx.resumeProject.update({
          where: {
            resumeConfigId_projectId: {
              resumeConfigId: parsed.data.resumeConfigId,
              projectId: pId,
            },
          },
          data: { order: -(i + 1) },
        });
      }

      // Step 2: Set final zero-indexed order
      for (let i = 0; i < parsed.data.projectIds.length; i++) {
        const pId = parsed.data.projectIds[i];
        await tx.resumeProject.update({
          where: {
            resumeConfigId_projectId: {
              resumeConfigId: parsed.data.resumeConfigId,
              projectId: pId,
            },
          },
          data: { order: i },
        });
      }
    });

    revalidatePath("/resumes", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to reorder projects:", error);
    return { success: false, message: "Failed to save project order." };
  }
}

export async function saveBulletOverrideAction(
  resumeConfigId: string,
  bulletId: string,
  text: string,
): Promise<ResumeActionResult> {
  const parsed = saveBulletOverrideSchema.safeParse({
    resumeConfigId,
    bulletId,
    text,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid bullet override data.",
    };
  }

  try {
    await prisma.resumeBulletOverride.upsert({
      where: {
        resumeConfigId_bulletId: {
          resumeConfigId: parsed.data.resumeConfigId,
          bulletId: parsed.data.bulletId,
        },
      },
      update: {
        text: parsed.data.text,
      },
      create: {
        resumeConfigId: parsed.data.resumeConfigId,
        bulletId: parsed.data.bulletId,
        text: parsed.data.text,
      },
    });

    revalidatePath("/resumes", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to save bullet override:", error);
    return { success: false, message: "Failed to save bullet customization." };
  }
}

export async function revertBulletOverrideAction(
  resumeConfigId: string,
  bulletId: string,
): Promise<ResumeActionResult> {
  const parsed = revertBulletOverrideSchema.safeParse({
    resumeConfigId,
    bulletId,
  });

  if (!parsed.success) {
    return { success: false, message: "Invalid revert data." };
  }

  try {
    await prisma.resumeBulletOverride.deleteMany({
      where: {
        resumeConfigId: parsed.data.resumeConfigId,
        bulletId: parsed.data.bulletId,
      },
    });

    revalidatePath("/resumes", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to revert bullet override:", error);
    return { success: false, message: "Failed to revert bullet to master." };
  }
}

export async function duplicateResumeConfigAction(
  sourceConfigId: string,
  newVariantName: string
): Promise<{ success: boolean; newConfigId?: string; message?: string }> {
  const parsed = duplicateResumeConfigSchema.safeParse({
    sourceConfigId,
    newVariantName,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid variant duplication data.",
    };
  }

  try {
    const sourceConfig = await prisma.resumeConfig.findUnique({
      where: { id: parsed.data.sourceConfigId },
      include: {
        projects: true,
        bulletOverrides: true,
      },
    });

    if (!sourceConfig) {
      return { success: false, message: "Source resume config not found." };
    }

    const newConfig = await prisma.resumeConfig.create({
      data: {
        domainId: sourceConfig.domainId,
        variantName: parsed.data.newVariantName,
        isDefault: false,
        title: sourceConfig.title,
        summary: sourceConfig.summary,
        skills: sourceConfig.skills ?? undefined,
        projects: {
          create: sourceConfig.projects.map((p) => ({
            projectId: p.projectId,
            included: p.included,
            order: p.order,
          })),
        },
        bulletOverrides: {
          create: sourceConfig.bulletOverrides.map((bo) => ({
            bulletId: bo.bulletId,
            text: bo.text,
          })),
        },
      },
    });

    revalidatePath("/resumes", "layout");
    return { success: true, newConfigId: newConfig.id };
  } catch (error) {
    console.error("Failed to duplicate resume config:", error);
    return { success: false, message: "Failed to duplicate resume variant." };
  }
}
