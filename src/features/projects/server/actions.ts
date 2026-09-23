"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { projectSchema, type ProjectInput } from "@/lib/validations/resume";

import { toPrismaProjectStatus } from "./mappers";
import { invalidateAllResumeCaches } from "@/lib/redis";

export type ProjectFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<keyof ProjectInput, string[]>>;
};

const idleState: ProjectFormState = {
  status: "idle",
};

const projectIdSchema = z.string().cuid();

function validationError(
  message: string,
  fieldErrors?: Partial<Record<keyof ProjectInput, string[]>>,
): ProjectFormState {
  return {
    status: "error",
    message,
    fieldErrors,
  };
}

function parseProjectPayload(formData: FormData):
  | { success: true; data: ProjectInput }
  | { success: false; state: ProjectFormState } {
  const rawPayload = formData.get("payload");

  if (typeof rawPayload !== "string") {
    return {
      success: false,
      state: validationError("Project form data is missing."),
    };
  }

  let jsonPayload: unknown;

  try {
    jsonPayload = JSON.parse(rawPayload);
  } catch {
    return {
      success: false,
      state: validationError("Project form data could not be read."),
    };
  }

  const parsedProject = projectSchema.safeParse(jsonPayload);

  if (!parsedProject.success) {
    const flattenedError = parsedProject.error.flatten();
    return {
      success: false,
      state: validationError(
        "Please fix the highlighted project details.",
        flattenedError.fieldErrors,
      ),
    };
  }

  return {
    success: true,
    data: parsedProject.data,
  };
}

function getProjectWriteData(project: ProjectInput) {
  return {
    title: project.title,
    description: project.description,
    techStack: project.techStack,
    status: toPrismaProjectStatus(project.status),
    githubUrl: project.githubUrl || null,
    liveUrl: project.liveUrl || null,
    bullets: {
      create: project.bullets.map((bullet, index) => ({
        text: bullet.text,
        order: index,
      })),
    },
    domains: {
      create: project.domainNames.map((name) => ({
        domain: {
          connect: { name },
        },
      })),
    },
  };
}

export async function createProjectAction(
  _previousState: ProjectFormState = idleState,
  formData: FormData,
): Promise<ProjectFormState> {
  const parsedPayload = parseProjectPayload(formData);

  if (!parsedPayload.success) {
    return parsedPayload.state;
  }

  await prisma.project.create({
    data: getProjectWriteData(parsedPayload.data),
  });

  await invalidateAllResumeCaches();
  revalidatePath("/");
  redirect("/");
}

export async function updateProjectAction(
  projectId: string,
  _previousState: ProjectFormState = idleState,
  formData: FormData,
): Promise<ProjectFormState> {
  const parsedId = projectIdSchema.safeParse(projectId);

  if (!parsedId.success) {
    return validationError("Project id is invalid.");
  }

  const parsedPayload = parseProjectPayload(formData);

  if (!parsedPayload.success) {
    return parsedPayload.state;
  }

  const project = parsedPayload.data;

  await prisma.project.update({
    where: { id: parsedId.data },
    data: {
      title: project.title,
      description: project.description,
      techStack: project.techStack,
      status: toPrismaProjectStatus(project.status),
      githubUrl: project.githubUrl || null,
      liveUrl: project.liveUrl || null,
      bullets: {
        deleteMany: {},
        create: project.bullets.map((bullet, index) => ({
          text: bullet.text,
          order: index,
        })),
      },
      domains: {
        deleteMany: {},
        create: project.domainNames.map((name) => ({
          domain: {
            connect: { name },
          },
        })),
      },
    },
  });

  await invalidateAllResumeCaches();
  revalidatePath("/");
  revalidatePath(`/projects/${parsedId.data}/edit`);
  redirect("/");
}

export async function deleteProjectAction(formData: FormData): Promise<void> {
  const rawProjectId = formData.get("projectId");
  const parsedProjectId = projectIdSchema.safeParse(rawProjectId);

  if (!parsedProjectId.success) {
    throw new Error("Project id is invalid.");
  }

  await prisma.project.delete({
    where: { id: parsedProjectId.data },
  });

  await invalidateAllResumeCaches();
  revalidatePath("/");
}
