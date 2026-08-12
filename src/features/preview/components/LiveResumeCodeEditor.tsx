"use client";

import { useState, useEffect } from "react";
import {
  Code,
  RotateCcw,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
} from "lucide-react";
import type { ResumeDocumentData } from "@/features/preview/server/queries";

type LiveResumeCodeEditorProps = {
  initialDocumentData: ResumeDocumentData;
  onChange: (updatedData: ResumeDocumentData) => void;
  onReset: () => void;
  isModified: boolean;
};

// Simplified editable data structure for fast editing
export type EditableResumePayload = {
  candidate: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    websiteUrl: string;
    githubUrl: string;
    linkedinUrl: string;
    summary: string;
  };
  skills: {
    languages: string[];
    frameworks: string[];
    tools: string[];
    strengths?: string[];
  };
  projects: {
    id: string;
    title: string;
    techStack: string[];
    githubUrl?: string;
    liveUrl?: string;
    bullets: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    grade: string;
  }[];
  certifications: {
    name: string;
    issuer: string;
    issueDate: string;
  }[];
};

export function docDataToEditablePayload(
  doc: ResumeDocumentData,
): EditableResumePayload {
  return {
    candidate: {
      fullName: doc.profile.fullName,
      email: doc.profile.email,
      phone: doc.profile.phone,
      location: doc.profile.location,
      websiteUrl: doc.profile.websiteUrl,
      githubUrl: doc.profile.githubUrl,
      linkedinUrl: doc.profile.linkedinUrl,
      summary: doc.profile.summary,
    },
    skills: {
      languages: doc.profile.languages,
      frameworks: doc.profile.frameworks,
      tools: doc.profile.tools,
      strengths: doc.profile.strengths ?? [],
    },
    projects: doc.projects.map((p) => ({
      id: p.id,
      title: p.title,
      techStack: p.techStack,
      githubUrl: p.githubUrl ?? "",
      liveUrl: p.liveUrl ?? "",
      bullets: p.bullets.map((b) => b.text),
    })),
    education: doc.profile.educations.map((e) => ({
      institution: e.institution,
      degree: e.degree,
      fieldOfStudy: e.fieldOfStudy,
      startDate: e.startDate,
      endDate: e.endDate,
      grade: e.grade,
    })),
    certifications: doc.profile.certifications.map((c) => ({
      name: c.name,
      issuer: c.issuer,
      issueDate: c.issueDate,
    })),
  };
}

export function editablePayloadToDocData(
  payload: EditableResumePayload,
  originalDoc: ResumeDocumentData,
): ResumeDocumentData {
  const aggregatedSkills = new Set<string>();
  payload.skills.languages.forEach((s) => aggregatedSkills.add(s));
  payload.skills.frameworks.forEach((s) => aggregatedSkills.add(s));
  payload.skills.tools.forEach((s) => aggregatedSkills.add(s));
  payload.projects.forEach((p) => p.techStack.forEach((t) => aggregatedSkills.add(t)));

  const projects = payload.projects.map((p, pIdx) => {
    return {
      id: p.id || `proj-${pIdx}`,
      title: p.title,
      description: "",
      techStack: p.techStack || [],
      status: "completed" as const,
      githubUrl: p.githubUrl || null,
      liveUrl: p.liveUrl || null,
      order: pIdx,
      bullets: (p.bullets || []).map((bText, bIdx) => ({
        id: `bullet-${pIdx}-${bIdx}`,
        order: bIdx,
        text: bText,
        isOverridden: true,
        startsWithActionVerb: true,
      })),
    };
  });

  return {
    ...originalDoc,
    profile: {
      ...originalDoc.profile,
      fullName: payload.candidate.fullName || originalDoc.profile.fullName,
      email: payload.candidate.email || originalDoc.profile.email,
      phone: payload.candidate.phone ?? "",
      location: payload.candidate.location ?? "",
      websiteUrl: payload.candidate.websiteUrl ?? "",
      githubUrl: payload.candidate.githubUrl ?? "",
      linkedinUrl: payload.candidate.linkedinUrl ?? "",
      summary: payload.candidate.summary ?? "",
      languages: payload.skills.languages || [],
      frameworks: payload.skills.frameworks || [],
      tools: payload.skills.tools || [],
      strengths: payload.skills.strengths || [],
      educations: (payload.education || []).map((e, idx) => ({
        id: `edu-${idx}`,
        institution: e.institution,
        degree: e.degree,
        fieldOfStudy: e.fieldOfStudy || "",
        startDate: e.startDate || "",
        endDate: e.endDate || "",
        grade: e.grade || "",
        order: idx,
      })),
      certifications: (payload.certifications || []).map((c, idx) => ({
        id: `cert-${idx}`,
        name: c.name,
        issuer: c.issuer,
        issueDate: c.issueDate || "",
        credentialUrl: "",
        order: idx,
      })),
    },
    projects,
    aggregatedSkills: Array.from(aggregatedSkills).sort((a, b) => a.localeCompare(b)),
  };
}

export function LiveResumeCodeEditor({
  initialDocumentData,
  onChange,
  onReset,
  isModified,
}: LiveResumeCodeEditorProps) {
  const [codeString, setCodeString] = useState(() =>
    JSON.stringify(docDataToEditablePayload(initialDocumentData), null, 2),
  );
  const [parseError, setParseError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync if initialDocumentData changes externally
  useEffect(() => {
    if (!isModified) {
      setCodeString(
        JSON.stringify(docDataToEditablePayload(initialDocumentData), null, 2),
      );
      setParseError(null);
    }
  }, [initialDocumentData, isModified]);

  const handleCodeChange = (newCode: string) => {
    setCodeString(newCode);
    try {
      const parsed = JSON.parse(newCode) as EditableResumePayload;
      setParseError(null);
      const updated = editablePayloadToDocData(parsed, initialDocumentData);
      onChange(updated);
    } catch (err) {
      if (err instanceof Error) {
        setParseError(err.message);
      } else {
        setParseError("Invalid JSON syntax");
      }
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(codeString);
      const formatted = JSON.stringify(parsed, null, 2);
      setCodeString(formatted);
      setParseError(null);
    } catch {
      // ignore
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Line count for gutter
  const lineCount = codeString.split("\n").length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-800 bg-slate-950 text-slate-100 shadow-xl overflow-hidden font-mono text-xs">
      {/* Editor Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900/90 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Code size={15} className="text-emerald-400" />
          <span className="font-semibold text-slate-200 text-xs">
            Live Code Editor (JSON / TypeScript)
          </span>
          {isModified ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 text-[10px] font-medium text-amber-300">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              Live Modified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
              Synced with DB
            </span>
          )}
        </div>

        {/* Toolbar Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleFormat}
            title="Format & Beautify JSON"
            className="inline-flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2 py-1 text-[11px] text-slate-300 transition"
          >
            <Sparkles size={12} className="text-yellow-400" />
            <span>Format</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            title="Copy Code Payload"
            className="inline-flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2 py-1 text-[11px] text-slate-300 transition"
          >
            {copied ? (
              <Check size={12} className="text-emerald-400" />
            ) : (
              <Copy size={12} />
            )}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>

          {isModified ? (
            <button
              type="button"
              onClick={onReset}
              title="Reset all changes to Database template"
              className="inline-flex items-center gap-1 rounded bg-red-950/60 border border-red-800/50 hover:bg-red-900/60 px-2 py-1 text-[11px] text-red-300 transition"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Real-time Syntax Error Alert */}
      {parseError ? (
        <div className="flex items-center gap-2 bg-red-950/90 border-b border-red-800 px-4 py-2 text-[11px] text-red-200">
          <AlertCircle size={14} className="text-red-400 shrink-0" />
          <span className="truncate">{parseError}</span>
        </div>
      ) : (
        <div className="flex items-center justify-between border-b border-slate-900/60 bg-slate-900/40 px-4 py-1.5 text-[10px] text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 size={12} /> Valid JSON • Live preview active
          </span>
          <span>
            {lineCount} lines • {codeString.length} chars
          </span>
        </div>
      )}

      {/* Editor Body with Gutter */}
      <div className="relative flex flex-1 overflow-hidden min-h-[500px] max-h-[750px]">
        {/* Line Numbers Gutter */}
        <div className="select-none bg-slate-950/90 px-3 py-3 text-right font-mono text-[11px] text-slate-600 border-r border-slate-800/80 overflow-hidden shrink-0">
          {lineNumbers.map((n) => (
            <div key={n} className="leading-5">
              {n}
            </div>
          ))}
        </div>

        {/* Code Textarea */}
        <textarea
          value={codeString}
          onChange={(e) => handleCodeChange(e.target.value)}
          spellCheck={false}
          className="flex-1 w-full bg-slate-950 p-3 font-mono text-[11px] leading-5 text-slate-200 focus:outline-none resize-none selection:bg-blue-900 selection:text-white"
          style={{ tabSize: 2 }}
        />
      </div>
    </div>
  );
}
