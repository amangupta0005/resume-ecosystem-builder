"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  Eye,
  Cpu,
  ExternalLink,
} from "lucide-react";
import { DOMAIN_NAMES, type DomainName } from "@/lib/constants/domains";
import type { MatrixData } from "@/features/preview/server/queries";

type DomainMatrixViewProps = {
  matrixData: MatrixData;
};

function renderDomainIcon(domain: DomainName) {
  switch (domain) {
    case "AI/ML":
      return <Sparkles size={16} className="text-purple-500" />;
    case "Full-Stack":
      return <Layers size={16} className="text-blue-500" />;
    case "Computer Vision":
      return <Eye size={16} className="text-emerald-500" />;
    case "IoT+ML":
      return <Cpu size={16} className="text-amber-500" />;
    default:
      return null;
  }
}

export function DomainMatrixView({ matrixData }: DomainMatrixViewProps) {
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [activeCompareDomain, setActiveCompareDomain] = useState<DomainName>("AI/ML");

  const toggleExpand = (id: string) => {
    setExpandedProjectId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-8">
      {/* Header Domain Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {DOMAIN_NAMES.map((dName) => {
          const stats = matrixData.domainCounts[dName];

          return (
            <div
              key={dName}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 hover:border-slate-300 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm">
                  {renderDomainIcon(dName)}
                  <span>{dName}</span>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                  {stats.includedProjects} projects
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2.5">
                <span>Tailored bullets:</span>
                <span className="font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                  {stats.overridesCount} overrides
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Link
                  href={`/resumes/${stats.slug}`}
                  className="flex-1 text-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
                >
                  Configure
                </Link>
                <Link
                  href={`/resumes/${stats.slug}/preview`}
                  className="flex-1 text-center rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition inline-flex items-center justify-center gap-1"
                >
                  <span>Preview</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Projects Cross-Domain Inclusion & Bullet Matrix */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/75 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            Cross-Domain Project & Bullet Variations Matrix
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any project row to inspect its domain-specific bullet text variations side by side.
          </p>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/50 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-6">Project Title & Tech</th>
                <th className="py-3 px-3 text-center">Status</th>
                {DOMAIN_NAMES.map((dName) => (
                  <th key={dName} className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {renderDomainIcon(dName)}
                      <span>{dName}</span>
                    </div>
                  </th>
                ))}
                <th className="py-3 px-4 text-right">Variations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {matrixData.projects.map((project) => {
                const isExpanded = expandedProjectId === project.id;
                const totalOverrides = project.bullets.reduce(
                  (acc, b) =>
                    acc +
                    Object.values(b.domainVariations).filter((v) => v.isOverridden).length,
                  0,
                );

                return (
                  <tr
                    key={project.id}
                    className={`hover:bg-slate-50/60 transition ${
                      isExpanded ? "bg-purple-50/20" : ""
                    }`}
                  >
                    <td className="py-4 px-6 align-top">
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">
                          {project.title}
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {project.techStack.map((tech) => (
                            <span
                              key={tech}
                              className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 font-medium"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-3 text-center align-top">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          project.status === "completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {project.status === "completed" ? "Done" : "In Dev"}
                      </span>
                    </td>

                    {DOMAIN_NAMES.map((dName) => {
                      const isIncluded = project.inclusions[dName];

                      return (
                        <td
                          key={dName}
                          className="py-4 px-4 text-center align-top"
                        >
                          {isIncluded ? (
                            <span
                              title={`Included in ${dName} resume`}
                              className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 text-emerald-700"
                            >
                              <CheckCircle2 size={15} />
                            </span>
                          ) : (
                            <span
                              title={`Not included in ${dName}`}
                              className="inline-flex items-center justify-center h-6 w-6 text-slate-300 text-sm font-bold"
                            >
                              —
                            </span>
                          )}
                        </td>
                      );
                    })}

                    <td className="py-4 px-4 text-right align-top">
                      <button
                        type="button"
                        onClick={() => toggleExpand(project.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
                      >
                        <span>
                          {totalOverrides > 0
                            ? `★ ${totalOverrides} custom`
                            : `${project.bullets.length} bullets`}
                        </span>
                        {isExpanded ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Expanded Project Bullets Comparison Drawer */}
        {expandedProjectId ? (
          <div className="border-t-2 border-purple-200 bg-purple-50/15 p-6 space-y-5">
            {(() => {
              const selectedProject = matrixData.projects.find(
                (p) => p.id === expandedProjectId,
              );
              if (!selectedProject) return null;

              return (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-100 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Comparing Bullets for: {selectedProject.title}
                      </h3>
                      <p className="text-xs text-slate-500">
                        See how bullet points are adapted per domain.
                      </p>
                    </div>

                    {/* Domain switcher tabs */}
                    <div className="flex rounded-lg bg-slate-200/70 p-0.5 text-xs">
                      {DOMAIN_NAMES.map((dName) => (
                        <button
                          key={dName}
                          type="button"
                          onClick={() => setActiveCompareDomain(dName)}
                          className={`flex items-center gap-1.5 rounded-md px-3 py-1 font-medium transition ${
                            activeCompareDomain === dName
                              ? "bg-white text-slate-900 font-bold shadow-sm"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          {renderDomainIcon(dName)}
                          <span>{dName}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bullet variations list */}
                  <div className="space-y-3">
                    {selectedProject.bullets.map((bullet, idx) => {
                      const variation =
                        bullet.domainVariations[activeCompareDomain];
                      const isCustom = variation?.isOverridden;

                      return (
                        <div
                          key={bullet.id}
                          className={`rounded-lg border p-3.5 space-y-2 ${
                            isCustom
                              ? "border-purple-200 bg-purple-50/50"
                              : "border-slate-200 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-700">
                              Bullet #{idx + 1}
                            </span>
                            {isCustom ? (
                              <span className="inline-flex items-center gap-1 rounded bg-purple-100 px-2 py-0.5 font-bold text-purple-700 text-[11px]">
                                ★ Domain Tailored Override
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">
                                Standard Project Bullet
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-900 leading-relaxed font-medium">
                            {variation?.text ?? bullet.originalText}
                          </p>

                          {isCustom ? (
                            <div className="border-t border-purple-100 pt-2 text-[11px] text-slate-500">
                              <span className="font-semibold text-slate-700">
                                Original base text:
                              </span>{" "}
                              {bullet.originalText}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        ) : null}
      </div>
    </div>
  );
}
