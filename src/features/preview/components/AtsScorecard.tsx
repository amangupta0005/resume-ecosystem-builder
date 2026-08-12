"use client";

import { CheckCircle2, AlertTriangle, Sparkles, FileText, HelpCircle } from "lucide-react";
import type { AtsAnalysisResult } from "@/features/preview/server/queries";

type AtsScorecardProps = {
  analysis: AtsAnalysisResult;
  highlightOverrides: boolean;
  onToggleHighlight: () => void;
};

export function AtsScorecard({
  analysis,
  highlightOverrides,
  onToggleHighlight,
}: AtsScorecardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 70) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 85) return "bg-emerald-600 text-white";
    if (score >= 70) return "bg-amber-600 text-white";
    return "bg-red-600 text-white";
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
      {/* Header & Score Gauge */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-semibold text-slate-900">
              ATS Compliance & Quality
            </h3>
            <span
              title="Automated analysis checking action verbs, single-column compatibility, project density, and bullet readability"
              className="cursor-pointer text-slate-400 hover:text-slate-600"
            >
              <HelpCircle size={14} />
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Standard single-column parser readiness
          </p>
        </div>

        <div
          className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 ${getScoreColor(
            analysis.atsReadinessScore,
          )}`}
        >
          <span className="text-xs font-medium">Readiness</span>
          <span
            className={`rounded px-1.5 py-0.5 text-xs font-bold ${getScoreBadge(
              analysis.atsReadinessScore,
            )}`}
          >
            {analysis.atsReadinessScore}%
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
          <span className="text-slate-500 block text-[11px]">Projects</span>
          <span className="text-base font-bold text-slate-900">
            {analysis.projectCount}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {analysis.projectCount >= 3 && analysis.projectCount <= 5
              ? "Optimal (3-5)"
              : "Adjust count"}
          </span>
        </div>

        <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
          <span className="text-slate-500 block text-[11px]">Total Bullets</span>
          <span className="text-base font-bold text-slate-900">
            {analysis.bulletCount}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            ~{analysis.totalWordCount} words
          </span>
        </div>

        <div className="rounded-lg bg-purple-50/60 p-2.5 border border-purple-100">
          <span className="text-purple-700 block text-[11px] font-medium">
            Custom Bullets
          </span>
          <span className="text-base font-bold text-purple-900">
            {analysis.customizedBulletCount}
          </span>
          <span className="text-[10px] text-purple-600 block mt-0.5">
            Domain-tailored
          </span>
        </div>

        <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
          <span className="text-slate-500 block text-[11px]">Action Verbs</span>
          <span className="text-base font-bold text-slate-900">
            {analysis.actionVerbPercentage}%
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Target &gt; 80%
          </span>
        </div>
      </div>

      {/* Recommendations & Warnings */}
      <div className="space-y-2 border-t border-slate-100 pt-3">
        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Analysis & Recommendations
        </h4>

        {analysis.recommendations.length === 0 && analysis.lengthIssues.length === 0 ? (
          <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50/70 p-2 rounded-lg border border-emerald-100">
            <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
            <span>Document meets all ATS formatting & action-verb guidelines.</span>
          </div>
        ) : (
          <ul className="space-y-1.5 text-xs text-slate-600">
            {analysis.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 bg-amber-50/50 p-2 rounded border border-amber-100/60">
                <AlertTriangle size={14} className="shrink-0 text-amber-600 mt-0.5" />
                <span className="text-slate-800">{rec}</span>
              </li>
            ))}
            {analysis.lengthIssues.map((issue, i) => (
              <li key={`len-${i}`} className="flex items-start gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                <FileText size={14} className="shrink-0 text-slate-500 mt-0.5" />
                <span>
                  <strong className="text-slate-800">{issue.projectTitle}:</strong>{" "}
                  Bullet is {issue.issue === "too_short" ? "very short" : "long"} ({issue.charCount} chars).
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Highlighter Toggle */}
      <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-purple-600" />
          <span className="text-xs text-slate-700 font-medium">
            Highlight domain overrides in preview
          </span>
        </div>
        <button
          type="button"
          onClick={onToggleHighlight}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            highlightOverrides ? "bg-purple-600" : "bg-slate-300"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              highlightOverrides ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
