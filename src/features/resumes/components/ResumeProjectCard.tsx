"use client";

import { useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Tag,
  FileCode,
} from "lucide-react";
import type { DomainName } from "@/lib/constants/domains";
import type { ResumeProjectData } from "@/features/resumes/server/queries";
import { BulletOverrideEditor } from "./BulletOverrideEditor";

type ResumeProjectCardProps = {
  resumeConfigId: string;
  domainName: DomainName;
  project: ResumeProjectData;
  index: number;
  totalIncluded: number;
  onToggleInclusion: (projectId: string, nextIncluded: boolean) => void;
  onMoveOrder: (index: number, direction: -1 | 1) => void;
  onBulletUpdated: (
    projectId: string,
    bulletId: string,
    newOverrideText?: string,
  ) => void;
};

export function ResumeProjectCard({
  resumeConfigId,
  domainName,
  project,
  index,
  totalIncluded,
  onToggleInclusion,
  onMoveOrder,
  onBulletUpdated,
}: ResumeProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const overriddenCount = project.bullets.filter((b) => b.isOverridden).length;

  return (
    <article
      className={`rounded-lg border transition duration-150 ${
        project.included
          ? "border-slate-300 bg-white shadow-sm ring-1 ring-slate-900/5"
          : "border-dashed border-slate-200 bg-slate-50/70 opacity-75 hover:opacity-100"
      }`}
    >
      {/* Header Bar */}
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between border-b border-slate-100">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Include / Exclude Toggle Button */}
          <button
            type="button"
            onClick={() => onToggleInclusion(project.id, !project.included)}
            title={
              project.included
                ? "Click to exclude from this resume"
                : "Click to include in this resume"
            }
            className={`mt-0.5 inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition ${
              project.included
                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                : "border border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900"
            }`}
          >
            {project.included ? (
              <>
                <CheckCircle2 size={14} />
                <span>Included</span>
              </>
            ) : (
              <>
                <Circle size={14} />
                <span>Excluded</span>
              </>
            )}
          </button>

          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {project.included ? (
                <span className="inline-flex items-center rounded-md bg-slate-900 px-1.5 py-0.5 text-[11px] font-bold text-white">
                  #{index + 1}
                </span>
              ) : null}

              <h3 className="text-base font-semibold text-slate-950 truncate">
                {project.title}
              </h3>

              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  project.status === "completed"
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border border-amber-200 bg-amber-50 text-amber-700"
                }`}
              >
                {project.status === "completed" ? "Completed" : "In Progress"}
              </span>

              {project.isDomainMatch ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-purple-200 bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700">
                  <Tag size={10} />
                  Native {domainName}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                  <Tag size={10} />
                  {project.domains.join(", ")}
                </span>
              )}

              {overriddenCount > 0 ? (
                <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-semibold text-purple-800">
                  {overriddenCount} {overriddenCount === 1 ? "override" : "overrides"}
                </span>
              ) : null}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
              {project.description}
            </p>

            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <FileCode size={12} className="text-slate-400" />
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-700"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Order controls & Collapse toggle */}
        <div className="flex shrink-0 items-center gap-1 sm:self-start">
          {project.included ? (
            <>
              <button
                type="button"
                onClick={() => onMoveOrder(index, -1)}
                disabled={index === 0}
                title="Move Project Up in Resume"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowUp size={14} />
                <span className="sr-only">Move Up</span>
              </button>
              <button
                type="button"
                onClick={() => onMoveOrder(index, 1)}
                disabled={index >= totalIncluded - 1}
                title="Move Project Down in Resume"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowDown size={14} />
                <span className="sr-only">Move Down</span>
              </button>
            </>
          ) : null}

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            title={isExpanded ? "Collapse bullets" : "Expand bullets"}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            <span className="sr-only">Toggle bullets</span>
          </button>
        </div>
      </div>

      {/* Bullets List & Override Customizer */}
      {isExpanded ? (
        <div className="p-4 space-y-2.5 bg-slate-50/30">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Bullet Points ({project.bullets.length})
            </span>
            <span className="text-[11px] text-slate-500">
              Customize wording specifically for {domainName} without changing the master project
            </span>
          </div>

          <div className="space-y-2">
            {project.bullets.map((bullet) => (
              <BulletOverrideEditor
                key={bullet.id}
                resumeConfigId={resumeConfigId}
                domainName={domainName}
                bullet={bullet}
                onBulletUpdated={(bulletId, newOverrideText) =>
                  onBulletUpdated(project.id, bulletId, newOverrideText)
                }
              />
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}
