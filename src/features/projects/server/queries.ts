import { notFound } from "next/navigation";

import { DOMAIN_NAMES, type DomainName } from "@/lib/constants/domains";
import { prisma } from "@/lib/db";
import type { ProjectInput, ProjectStatusInput } from "@/lib/validations/resume";

import { isDomainName, toProjectStatusInput } from "./mappers";

export type ProjectListItem = {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  status: ProjectStatusInput;
  domains: DomainName[];
  bulletCount: number;
};

export type ProjectEditorData = ProjectInput & {
  id: string;
};

export async function getProjectList(): Promise<ProjectListItem[]> {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      domains: {
        include: {
          domain: true,
        },
      },
      _count: {
        select: {
          bullets: true,
        },
      },
    },
  });

  return projects.map((project) => ({
    id: project.id,
    title: project.title,
    description: project.description,
    techStack: project.techStack,
    status: toProjectStatusInput(project.status),
    domains: project.domains
      .map((entry) => entry.domain.name)
      .filter(isDomainName)
      .sort((first, second) => first.localeCompare(second)),
    bulletCount: project._count.bullets,
  }));
}

export async function getDomainOptions(): Promise<DomainName[]> {
  const domains = await prisma.domain.findMany({
    orderBy: { name: "asc" },
    select: { name: true },
  });

  const seededDomains = domains.map((domain) => domain.name).filter(isDomainName);
  return DOMAIN_NAMES.filter((domainName) => seededDomains.includes(domainName));
}

export async function getProjectForEdit(id: string): Promise<ProjectEditorData> {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      bullets: {
        orderBy: { order: "asc" },
      },
      domains: {
        include: {
          domain: true,
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  return {
    id: project.id,
    title: project.title,
    description: project.description,
    techStack: project.techStack,
    status: toProjectStatusInput(project.status),
    githubUrl: project.githubUrl ?? undefined,
    liveUrl: project.liveUrl ?? undefined,
    domainNames: project.domains
      .map((entry) => entry.domain.name)
      .filter(isDomainName),
    bullets: project.bullets.map((bullet) => ({
      id: bullet.id,
      text: bullet.text,
      order: bullet.order,
    })),
  };
}
