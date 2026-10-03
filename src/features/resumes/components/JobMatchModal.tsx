"use client";

import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Search,
  Loader2,
  Lightbulb,
  X,
} from "lucide-react";
import type { JdMatchResult } from "@/lib/validations/ai";

interface JobMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeConfigId: string;
  domainName: string;
}

export function JobMatchModal({
  isOpen,
  onClose,
  resumeConfigId,
  domainName,
}: JobMatchModalProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<JdMatchResult | null>(null);

  if (!isOpen) return null;

  async function handleAnalyze() {
    if (!jobDescription.trim() || jobDescription.trim().length < 50) {
      setError("Please paste a job description with at least 50 characters.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeConfigId,
          jobDescription: jobDescription.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.data) {
        setAnalysisResult(data.data);
      } else {
        setError(data.error || "Analysis failed. Please try again.");
      }
    } catch {
      setError("Network or server failure while analyzing Job Description.");
    } finally {
      setIsLoading(false);
    }
  }

  const criticalGaps = analysisResult?.skillGaps.filter(
    (g) => g.category === "critical" && g.status !== "already_present"
  ) ?? [];
  const importantGaps = analysisResult?.skillGaps.filter(
    (g) => g.category === "important" && g.status !== "already_present"
  ) ?? [];
  const niceGaps = analysisResult?.skillGaps.filter(
    (g) => g.category === "nice_to_have" && g.status !== "already_present"
  ) ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-linear-to-r from-slate-900 to-indigo-950 px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-indigo-500/20 p-2 text-indigo-300 border border-indigo-400/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">AI Job Description & ATS Match</h2>
              <p className="text-xs text-indigo-200">
                Deterministic Keyword Audit & Semantic Skill Gap Analysis for {domainName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Input Section */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span>Paste Job Description (JD)</span>
              <span className="text-slate-400 lowercase font-normal">
                {jobDescription.length} characters (min 50)
              </span>
            </label>
            <textarea
              rows={5}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste full job posting requirements, responsibilities, and qualifications here..."
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition resize-y font-mono text-xs leading-relaxed"
            />
            <div className="flex items-center justify-between pt-1">
              {error ? (
                <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {error}
                </p>
              ) : (
                <p className="text-[11px] text-slate-500">
                  Data processed server-side with strict anti-injection guardrails.
                </p>
              )}
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isLoading || jobDescription.trim().length < 50}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Alignment...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Analyze Match & Skill Gaps</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Display */}
          {analysisResult && (
            <div className="space-y-6 pt-4 border-t border-slate-100">
              {/* Scorecards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Composite Score */}
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
                  <div className="flex items-center justify-between text-indigo-900 text-xs font-semibold">
                    <span>ATS Match Score</span>
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-indigo-950">
                      {analysisResult.atsMatchScore}%
                    </span>
                    <span className="text-xs text-indigo-600 font-medium">Composite</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    60% exact tech match + 40% semantic depth
                  </p>
                </div>

                {/* Keyword Coverage */}
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
                  <div className="flex items-center justify-between text-emerald-900 text-xs font-semibold">
                    <span>Keyword Coverage</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-emerald-950">
                      {analysisResult.keywordCoverage.matchedCount} /{" "}
                      {analysisResult.keywordCoverage.totalTargetKeywords}
                    </span>
                    <span className="text-xs text-emerald-700 font-medium">
                      ({analysisResult.keywordCoverage.percentage}%)
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Exact deterministic keyword hits
                  </p>
                </div>

                {/* Target Role Identified */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  <span className="text-slate-600 text-xs font-semibold">
                    Identified Role
                  </span>
                  <div className="mt-2 text-base font-bold text-slate-900 truncate">
                    {analysisResult.jobTitle || "Technical Specialist"}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 truncate">
                    Semantic score: {analysisResult.semanticRelevanceScore}%
                  </p>
                </div>
              </div>

              {/* Matched vs Missing Tech Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Matched Skills */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                  <h3 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Matched Skills ({analysisResult.matchedSkills.length})
                  </h3>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {analysisResult.matchedSkills.length > 0 ? (
                      analysisResult.matchedSkills.map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200"
                        >
                          ✓ {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">
                        No direct keyword matches detected.
                      </span>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                  <h3 className="text-xs font-bold text-rose-800 flex items-center gap-1.5 uppercase tracking-wider">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    Missing from Resume ({analysisResult.missingSkills.length})
                  </h3>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {analysisResult.missingSkills.length > 0 ? (
                      analysisResult.missingSkills.map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center rounded-md bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-800 border border-rose-200"
                        >
                          ✗ {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-emerald-600 font-medium">
                        All extracted target keywords are present!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Categorized Skill Gaps */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Prioritized Skill Gaps (Critical, Important, Nice-to-Have)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Critical */}
                  <div className="rounded-lg bg-white p-3 border border-rose-200 space-y-2">
                    <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
                      Critical Gaps ({criticalGaps.length})
                    </span>
                    {criticalGaps.length > 0 ? (
                      <ul className="text-xs space-y-1.5 text-slate-700">
                        {criticalGaps.map((g) => (
                          <li key={g.skill} className="leading-snug">
                            <span className="font-semibold text-rose-900">• {g.skill}:</span>{" "}
                            <span className="text-slate-600 text-[11px]">{g.rationale}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400">No critical gaps identified.</p>
                    )}
                  </div>

                  {/* Important */}
                  <div className="rounded-lg bg-white p-3 border border-amber-200 space-y-2">
                    <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
                      Important Gaps ({importantGaps.length})
                    </span>
                    {importantGaps.length > 0 ? (
                      <ul className="text-xs space-y-1.5 text-slate-700">
                        {importantGaps.map((g) => (
                          <li key={g.skill} className="leading-snug">
                            <span className="font-semibold text-amber-900">• {g.skill}:</span>{" "}
                            <span className="text-slate-600 text-[11px]">{g.rationale}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400">No important gaps identified.</p>
                    )}
                  </div>

                  {/* Nice to Have */}
                  <div className="rounded-lg bg-white p-3 border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                      Nice to Have ({niceGaps.length})
                    </span>
                    {niceGaps.length > 0 ? (
                      <ul className="text-xs space-y-1.5 text-slate-700">
                        {niceGaps.map((g) => (
                          <li key={g.skill} className="leading-snug">
                            <span className="font-semibold text-slate-800">• {g.skill}:</span>{" "}
                            <span className="text-slate-600 text-[11px]">{g.rationale}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400">No secondary gaps.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-4 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-indigo-600" />
                  Targeted Resume Recommendations
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {analysisResult.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-3 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            {analysisResult?.fromCache ? "⚡ Loaded from Redis cache" : "🔒 Evaluated via server-side AI guardrails"}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
