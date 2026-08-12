import Link from "next/link";
import { Edit3, FileText, Plus } from "lucide-react";

import { DeleteProjectButton } from "@/features/projects/components/DeleteProjectButton";
import type { ProjectListItem } from "@/features/projects/server/queries";

type ProjectListProps = {
  projects: ProjectListItem[];
};

export function ProjectList({ projects }: ProjectListProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-slate-950">
            Projects
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {projects.length} saved projects
          </p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500"
        >
          <Plus aria-hidden="true" size={16} />
          Add project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="border border-dashed border-slate-300 p-8 text-center">
          <FileText className="mx-auto text-slate-400" size={28} />
          <p className="mt-3 text-sm text-slate-600">No projects saved yet.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {projects.map((project) => (
            <article
              key={project.id}
              className="rounded-md border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-lg font-semibold text-slate-950">
                      {project.title}
                    </h2>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        project.status === "completed"
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border border-amber-200 bg-amber-50 text-amber-700"
                      }`}
                    >
                      {project.status === "completed" ? "Completed" : "In Progress"}
                    </span>
                  </div>

                  <p className="max-w-4xl text-sm leading-relaxed text-slate-600">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {project.domains.map((domain) => (
                      <span
                        key={domain}
                        className="rounded-md border border-blue-200 bg-blue-50/80 px-2 py-0.5 text-xs font-medium text-blue-700"
                      >
                        {domain}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
                    <span className="font-medium">{project.bulletCount} bullets</span>
                    <span className="text-slate-300">•</span>
                    <span>{project.techStack.join(", ")}</span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/projects/${project.id}/edit`}
                    title="Edit project"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500"
                  >
                    <Edit3 aria-hidden="true" size={16} />
                    <span className="sr-only">Edit project</span>
                  </Link>
                  <DeleteProjectButton
                    projectId={project.id}
                    projectTitle={project.title}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
