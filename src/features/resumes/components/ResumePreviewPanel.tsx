"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check, Eye, Sparkles, FileText, ExternalLink } from "lucide-react";
import { domainToSlug, type DomainName } from "@/lib/constants/domains";
import type { ResumeProjectData } from "@/features/resumes/server/queries";

type ResumePreviewPanelProps = {
  resumeConfigId: string;
  domainName: DomainName;
  includedProjects: ResumeProjectData[];
  overrideCount: number;
};

export function ResumePreviewPanel({
  resumeConfigId,
  domainName,
  includedProjects,
  overrideCount,
}: ResumePreviewPanelProps) {
  const [copied, setCopied] = useState(false);
  const slug = domainToSlug(domainName);

  const totalBullets = includedProjects.reduce(
    (acc, p) => acc + p.bullets.length,
    0,
  );

  function handleCopyText() {
    const textOutput = includedProjects
      .map((project) => {
        const header = `${project.title} | ${project.techStack.join(", ")}`;
        const bullets = project.bullets
          .map((b) => `• ${b.effectiveText}`)
          .join("\n");
        return `${header}\n${bullets}`;
      })
      .join("\n\n");

    navigator.clipboard.writeText(textOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-white">
            <Eye size={15} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {domainName} Preview
            </h3>
            <p className="text-xs text-slate-500">
              Live preview of included items
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyText}
          disabled={includedProjects.length === 0}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 transition"
        >
          {copied ? (
            <>
              <Check size={13} className="text-emerald-600" />
              <span className="text-emerald-600 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy Text</span>
            </>
          )}
        </button>
      </div>

      {/* Summary stats badge bar */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-700">
          {includedProjects.length} Projects
        </span>
        <span className="rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-700">
          {totalBullets} Bullets
        </span>
        {overrideCount > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-purple-100 px-2 py-1 font-semibold text-purple-800">
            <Sparkles size={12} />
            {overrideCount} Customized
          </span>
        ) : null}
      </div>

      {/* ATS Formatted Live Output */}
      {includedProjects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
          <FileText size={24} className="mx-auto mb-2 text-slate-400" />
          No projects included in this resume yet. Check the &ldquo;Included&rdquo; toggle on projects to add them.
        </div>
      ) : (
        <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4 font-sans text-xs space-y-4 max-h-[500px] overflow-y-auto">
          {includedProjects.map((project) => (
            <div key={project.id} className="space-y-1.5 border-b border-slate-200/60 pb-3 last:border-0 last:pb-0">
              <div className="flex flex-wrap items-baseline justify-between gap-1">
                <span className="font-bold text-slate-900 text-sm">
                  {project.title}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {project.techStack.join(" • ")}
                </span>
              </div>
              <ul className="space-y-1 pl-3 text-slate-700 leading-relaxed list-disc">
                {project.bullets.map((b) => (
                  <li
                    key={b.id}
                    className={
                      b.isOverridden
                        ? "text-slate-950 font-medium bg-purple-50/70 rounded px-1 -mx-1"
                        : "text-slate-700"
                    }
                  >
                    {b.effectiveText}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Full Preview Page Button */}
      <Link
        href={`/resumes/${slug}/${resumeConfigId}/preview`}
        className="flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition w-full"
      >
        <span>Open Full ATS Sheet & PDF Export</span>
        <ExternalLink size={13} />
      </Link>
    </aside>
  );
}
