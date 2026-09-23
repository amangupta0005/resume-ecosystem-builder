"use client";

import { useState, useRef } from "react";
import {
  Columns2,
  FileText,
  Code2,
  Sparkles,
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import type { ResumeDocumentData } from "@/features/preview/server/queries";
import { analyzeAtsCompliance } from "@/features/preview/server/queries";
import type { ResumeThemeId } from "@/lib/resumeThemes";
import { ExportBar } from "./ExportBar";
import { AtsScorecard } from "./AtsScorecard";
import { FullResumeDocument } from "./FullResumeDocument";
import { LiveResumeCodeEditor } from "./LiveResumeCodeEditor";

type ResumePreviewContainerProps = {
  documentData: ResumeDocumentData;
};

type ViewMode = "split" | "document" | "code";

export function ResumePreviewContainer({
  documentData: initialDocumentData,
}: ResumePreviewContainerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [highlightOverrides, setHighlightOverrides] = useState(true);
  const [highlightAtsKeywords, setHighlightAtsKeywords] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<ResumeThemeId>("slate");
  const [liveDocData, setLiveDocData] = useState<ResumeDocumentData>(initialDocumentData);
  const [isModified, setIsModified] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);

  // Client-Side PDF Generation hook
  const handlePrintPdf = useReactToPrint({
    contentRef: resumeRef,
    documentTitle: `${liveDocData.domainSlug || "resume"}_ATS_Resume`,
    pageStyle: `
      @page {
        size: letter;
        margin: 10mm 12mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `,
  });

  // Live ATS analysis computed on the fly as liveDocData changes
  const currentAtsAnalysis = analyzeAtsCompliance(liveDocData.projects);

  const handleCodeChange = (updated: ResumeDocumentData) => {
    setLiveDocData(updated);
    setIsModified(true);
  };

  const handleReset = () => {
    setLiveDocData(initialDocumentData);
    setIsModified(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Navigation Bar */}
      <ExportBar
        documentData={liveDocData}
        isModified={isModified}
        currentTheme={currentTheme}
        onSelectTheme={setCurrentTheme}
        onPrintPdf={() => handlePrintPdf()}
      />

      {/* Mode Selector & Status Header */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
            <Sparkles size={15} className="text-purple-600" />
            <span>Workspace View:</span>
          </div>

          <div className="flex items-center rounded-lg bg-slate-100 p-1 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition ${
                viewMode === "split"
                  ? "bg-white text-slate-950 shadow-sm font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Columns2 size={13} />
              <span>Split (Code + ATS Sheet)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("document")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition ${
                viewMode === "document"
                  ? "bg-white text-slate-950 shadow-sm font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText size={13} />
              <span>Document Only</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("code")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition ${
                viewMode === "code"
                  ? "bg-white text-slate-950 shadow-sm font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Code2 size={13} />
              <span>Code Only</span>
            </button>
          </div>
        </div>

        {/* Live Status Indicator */}
        <div className="flex items-center gap-2 text-xs">
          {isModified ? (
            <span className="flex items-center gap-1.5 text-amber-700 font-medium bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Edits Active in Memory (Ready to Export)
            </span>
          ) : (
            <span className="text-slate-500 text-[11px]">
              Type in code on the left $\rightarrow$ live document updates on the right
            </span>
          )}
        </div>
      </div>

      {/* Main Workspace Layout depending on viewMode */}
      {viewMode === "split" ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left Column: Live Code Editor (5 cols) */}
          <div className="print:hidden xl:col-span-5 sticky top-20">
            <LiveResumeCodeEditor
              initialDocumentData={initialDocumentData}
              onChange={handleCodeChange}
              onReset={handleReset}
              isModified={isModified}
            />
          </div>

          {/* Right Column: ATS Scorecard & Live ATS Sheet (7 cols) */}
          <div className="xl:col-span-7 space-y-6">
            <AtsScorecard
              analysis={currentAtsAnalysis}
              highlightOverrides={highlightOverrides}
              onToggleHighlight={() => setHighlightOverrides((prev) => !prev)}
              highlightAtsKeywords={highlightAtsKeywords}
              onToggleAtsKeywords={() => setHighlightAtsKeywords((prev) => !prev)}
            />

            <FullResumeDocument
              ref={resumeRef}
              documentData={liveDocData}
              highlightOverrides={highlightOverrides}
              highlightAtsKeywords={highlightAtsKeywords}
              themeId={currentTheme}
            />
          </div>
        </div>
      ) : viewMode === "document" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <aside className="print:hidden lg:col-span-4 space-y-4">
            <AtsScorecard
              analysis={currentAtsAnalysis}
              highlightOverrides={highlightOverrides}
              onToggleHighlight={() => setHighlightOverrides((prev) => !prev)}
              highlightAtsKeywords={highlightAtsKeywords}
              onToggleAtsKeywords={() => setHighlightAtsKeywords((prev) => !prev)}
            />
          </aside>

          <main className="lg:col-span-8">
            <FullResumeDocument
              ref={resumeRef}
              documentData={liveDocData}
              highlightOverrides={highlightOverrides}
              highlightAtsKeywords={highlightAtsKeywords}
              themeId={currentTheme}
            />
          </main>
        </div>
      ) : (
        /* Code Only Full-width */
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="hidden">
            <FullResumeDocument
              ref={resumeRef}
              documentData={liveDocData}
              highlightOverrides={highlightOverrides}
              highlightAtsKeywords={false}
              themeId={currentTheme}
            />
          </div>
          <LiveResumeCodeEditor
            initialDocumentData={initialDocumentData}
            onChange={handleCodeChange}
            onReset={handleReset}
            isModified={isModified}
          />
        </div>
      )}
    </div>
  );
}
