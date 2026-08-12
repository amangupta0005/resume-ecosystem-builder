import { ProjectStatus } from "@prisma/client";

import { DOMAIN_NAMES, type DomainName } from "@/lib/constants/domains";
import type { ProjectStatusInput } from "@/lib/validations/resume";

export function toProjectStatusInput(status: ProjectStatus): ProjectStatusInput {
  return status === ProjectStatus.in_progress ? "in-progress" : "completed";
}

export function toPrismaProjectStatus(status: ProjectStatusInput): ProjectStatus {
  return status === "in-progress"
    ? ProjectStatus.in_progress
    : ProjectStatus.completed;
}

export function isDomainName(value: string): value is DomainName {
  return DOMAIN_NAMES.some((domainName) => domainName === value);
}
