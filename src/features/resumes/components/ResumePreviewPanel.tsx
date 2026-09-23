"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check, Eye, Sparkles, FileText, ExternalLink, Bot, Zap } from "lucide-react";
import { domainToSlug, type DomainName } from "@/lib/constants/domains";
import type { ResumeProjectData } from "@/features/resumes/server/queries";
import { serializeResumeProjectsToMarkdown } from "@/lib/markdownSerializer";
import { renderAtsHighlightedText } from "@/lib/atsHighlighter";
import { ThemeSelector } from "@/components/ThemeSelector";
import { RESUME_THEMES, type ResumeThemeId } from "@/lib/resumeThemes";

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
  const [copiedText, setCopiedText] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [highlightAts, setHighlightAts] = useState(true);
  const [previewTheme, setPreviewTheme] = useState<ResumeThemeId>("slate");
  const slug = domainToSlug(domainName);
  const theme = RESUME_THEMES[previewTheme] || RESUME_THEMES.slate;

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
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  }

  function handleCopyClaudeMarkdown() {
    const mdOutput = serializeResumeProjectsToMarkdown(domainName, includedProjects, {
      includePromptHeader: true,
    });

    navigator.clipboard.writeText(mdOutput);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  }

  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
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

        {/* 1-Click Export Actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopyClaudeMarkdown}
            disabled={includedProjects.length === 0}
            title="Copy structured Markdown formatted for Claude, ChatGPT & LLM reviews"
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 px-2.5 text-xs font-semibold text-white shadow-xs hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition"
          >
            {copiedMarkdown ? (
              <>
                <Check size={13} className="text-white" />
                <span>Copied for Claude! ✨</span>
              </>
            ) : (
              <>
                <Bot size={13} />
                <span>Copy for Claude/GPT</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopyText}
            disabled={includedProjects.length === 0}
            title="Copy standard plain text format"
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 transition"
          >
            {copiedText ? (
              <>
                <Check size={13} className="text-emerald-600" />
                <span className="text-emerald-600 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span className="hidden sm:inline">Plain Text</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary stats badge bar & ATS Highlighter Toggle */}
      <div className="flex flex-col gap-2 border-b border-slate-100 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
              {includedProjects.length} Projects
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
              {totalBullets} Bullets
            </span>
            {overrideCount > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-purple-100 px-2 py-0.5 font-semibold text-purple-800">
                <Sparkles size={11} />
                {overrideCount} Customized
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Swatches */}
            <ThemeSelector
              currentTheme={previewTheme}
              onSelectTheme={setPreviewTheme}
              compact
            />

            {/* Magic ATS Toggle */}
            <button
              type="button"
              onClick={() => setHighlightAts((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition border ${
                highlightAts
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs hover:bg-emerald-100"
                  : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
              }`}
              title="Toggle ATS keyword highlighting for action verbs and tech terms"
            >
              <Zap
                size={12}
                className={highlightAts ? "text-emerald-600 fill-emerald-500" : "text-slate-400"}
              />
              <span>{highlightAts ? "ATS Highlights: ON" : "ATS Highlights: OFF"}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Legend when ATS Highlighter is ON */}
        {highlightAts && (
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 pt-0.5 animate-fadeIn">
            <span className="text-slate-400 font-medium">Detecting:</span>
            <span className="inline-flex items-center rounded px-1.5 py-0.2 bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              Action Verbs
            </span>
            <span className="inline-flex items-center rounded px-1.5 py-0.2 bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              Tech Stack
            </span>
            <span className="inline-flex items-center rounded px-1.5 py-0.2 bg-purple-50 text-purple-700 font-semibold border border-purple-200">
              Metrics & Numbers
            </span>
          </div>
        )}
      </div>

      {/* ATS Formatted Live Output */}
      {includedProjects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
          <FileText size={24} className="mx-auto mb-2 text-slate-400" />
          No projects included in this resume yet. Check the &ldquo;Included&rdquo; toggle on projects to add them.
        </div>
      ) : (
        <div className={`rounded-lg border ${theme.previewBorder} bg-slate-50/60 p-4 font-sans text-xs space-y-4 max-h-[500px] overflow-y-auto transition-colors`}>
          {includedProjects.map((project) => (
            <div key={project.id} className="space-y-1.5 border-b border-slate-200/60 pb-3 last:border-0 last:pb-0">
              <div className="flex flex-wrap items-baseline justify-between gap-1">
                <span className={`font-bold text-sm ${theme.titleText}`}>
                  {project.title}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {project.techStack.join(" • ")}
                </span>
              </div>
              <ul className="space-y-1.5 pl-3 text-slate-700 leading-relaxed list-disc">
                {project.bullets.map((b) => (
                  <li
                    key={b.id}
                    className={
                      b.isOverridden
                        ? "text-slate-950 font-medium bg-purple-50/70 rounded px-1 -mx-1"
                        : "text-slate-700"
                    }
                  >
                    {renderAtsHighlightedText(b.effectiveText, highlightAts)}
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
