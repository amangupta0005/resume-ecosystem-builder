"use client";

import { useState } from "react";
import Link from "next/link";
import { Printer, Copy, Check, Download, ArrowLeft, FileDown, Loader2 } from "lucide-react";
import type { ResumeDocumentData } from "@/features/preview/server/queries";

type ExportBarProps = {
  documentData: ResumeDocumentData;
  isModified?: boolean;
};

export function ExportBar({ documentData, isModified = false }: ExportBarProps) {
  const [copiedType, setCopiedType] = useState<"markdown" | "text" | null>(null);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const { profile, domainName, projects, aggregatedSkills } = documentData;

  const contactItems: string[] = [];
  if (profile.email) contactItems.push(profile.email);
  if (profile.phone) contactItems.push(profile.phone);
  if (profile.location) contactItems.push(profile.location);
  if (profile.linkedinUrl) contactItems.push(profile.linkedinUrl);
  if (profile.githubUrl) contactItems.push(profile.githubUrl);
  if (profile.websiteUrl) contactItems.push(profile.websiteUrl);

  const generateMarkdown = () => {
    const lines: string[] = [];
    lines.push(`# ${profile.fullName.toUpperCase()}`);
    lines.push(`**Software Engineer — ${domainName}**`);
    if (contactItems.length > 0) {
      lines.push(`${contactItems.join(" | ")}\n`);
    }

    if (profile.summary) {
      lines.push(`## PROFESSIONAL SUMMARY`);
      lines.push(`${profile.summary}\n`);
    }

    lines.push(`## TECHNICAL SKILLS`);
    if (profile.languages.length > 0) {
      lines.push(`- **Programming Languages:** ${profile.languages.join(", ")}`);
    }
    if (profile.frameworks.length > 0) {
      lines.push(`- **Frameworks & Libraries:** ${profile.frameworks.join(", ")}`);
    }
    if (profile.tools.length > 0) {
      lines.push(`- **Tools & Platforms:** ${profile.tools.join(", ")}`);
    }
    if (
      profile.languages.length === 0 &&
      profile.frameworks.length === 0 &&
      profile.tools.length === 0 &&
      aggregatedSkills.length > 0
    ) {
      lines.push(`- **Proficiencies:** ${aggregatedSkills.join(", ")}`);
    }
    lines.push("");

    if (projects.length > 0) {
      lines.push(`## KEY PROJECTS`);
      for (const project of projects) {
        lines.push(`### ${project.title} | ${project.techStack.join(", ")}`);
        lines.push(`*Status: ${project.status === "completed" ? "Completed" : "In Progress"}*`);
        for (const bullet of project.bullets) {
          lines.push(`- ${bullet.text}`);
        }
        lines.push("");
      }
    }

    if (profile.educations.length > 0) {
      lines.push(`## EDUCATION`);
      for (const edu of profile.educations) {
        const dateStr =
          edu.startDate && edu.endDate
            ? ` (${edu.startDate} – ${edu.endDate})`
            : edu.endDate || edu.startDate
            ? ` (${edu.endDate || edu.startDate})`
            : "";
        lines.push(`- **${edu.degree}** — ${edu.institution}${dateStr}`);
        if (edu.fieldOfStudy || edu.grade) {
          lines.push(`  * ${[edu.fieldOfStudy, edu.grade].filter(Boolean).join(" | ")}`);
        }
      }
      lines.push("");
    }

    if (profile.certifications.length > 0) {
      lines.push(`## CERTIFICATIONS`);
      for (const cert of profile.certifications) {
        const dateStr = cert.issueDate ? ` (${cert.issueDate})` : "";
        lines.push(`- **${cert.name}** — ${cert.issuer}${dateStr}`);
      }
      lines.push("");
    }

    return lines.join("\n");
  };

  const generatePlainText = () => {
    const lines: string[] = [];
    lines.push(profile.fullName.toUpperCase());
    lines.push(`Software Engineer — ${domainName}`);
    if (contactItems.length > 0) {
      lines.push(contactItems.join("  |  "));
    }
    lines.push("=".repeat(60));
    lines.push("");

    if (profile.summary) {
      lines.push("PROFESSIONAL SUMMARY");
      lines.push("-".repeat(40));
      lines.push(profile.summary);
      lines.push("");
    }

    lines.push("TECHNICAL SKILLS");
    lines.push("-".repeat(40));
    if (profile.languages.length > 0) {
      lines.push(`Programming Languages: ${profile.languages.join(", ")}`);
    }
    if (profile.frameworks.length > 0) {
      lines.push(`Frameworks & Libraries: ${profile.frameworks.join(", ")}`);
    }
    if (profile.tools.length > 0) {
      lines.push(`Tools & Platforms: ${profile.tools.join(", ")}`);
    }
    if (
      profile.languages.length === 0 &&
      profile.frameworks.length === 0 &&
      profile.tools.length === 0 &&
      aggregatedSkills.length > 0
    ) {
      lines.push(`Proficiencies: ${aggregatedSkills.join(", ")}`);
    }
    lines.push("");

    if (projects.length > 0) {
      lines.push("KEY PROJECTS");
      lines.push("-".repeat(40));
      for (const project of projects) {
        lines.push(`${project.title.toUpperCase()} [${project.techStack.join(", ")}]`);
        lines.push(`Status: ${project.status === "completed" ? "Completed" : "In Progress"}`);
        for (const bullet of project.bullets) {
          lines.push(`  * ${bullet.text}`);
        }
        lines.push("");
      }
    }

    if (profile.educations.length > 0) {
      lines.push("EDUCATION");
      lines.push("-".repeat(40));
      for (const edu of profile.educations) {
        const dateStr =
          edu.startDate && edu.endDate
            ? ` (${edu.startDate} – ${edu.endDate})`
            : edu.endDate || edu.startDate
            ? ` (${edu.endDate || edu.startDate})`
            : "";
        lines.push(`${edu.degree} — ${edu.institution}${dateStr}`);
        if (edu.fieldOfStudy || edu.grade) {
          lines.push(`  ${[edu.fieldOfStudy, edu.grade].filter(Boolean).join(" | ")}`);
        }
      }
      lines.push("");
    }

    if (profile.certifications.length > 0) {
      lines.push("CERTIFICATIONS");
      lines.push("-".repeat(40));
      for (const cert of profile.certifications) {
        const dateStr = cert.issueDate ? ` (${cert.issueDate})` : "";
        lines.push(`${cert.name} — ${cert.issuer}${dateStr}`);
      }
      lines.push("");
    }

    return lines.join("\n");
  };

  const handleCopyMarkdown = async () => {
    const md = generateMarkdown();
    await navigator.clipboard.writeText(md);
    setCopiedType("markdown");
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleCopyPlainText = async () => {
    const text = generatePlainText();
    await navigator.clipboard.writeText(text);
    setCopiedType("text");
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleDownloadTxt = () => {
    const text = generatePlainText();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${documentData.domainSlug}_resume.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Instant Custom .docx Download from live state
  const handleDownloadDocx = async () => {
    try {
      setIsExportingDocx(true);
      const res = await fetch("/api/resumes/export/docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(documentData),
      });

      if (!res.ok) {
        throw new Error("Failed to generate DOCX file");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${documentData.domainSlug}_resume.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Error generating .docx file. Please try again.");
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="print:hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Navigation back */}
        <Link
          href={`/resumes/${documentData.domainSlug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 transition"
        >
          <ArrowLeft size={14} />
          <span>Back to Configurator</span>
        </Link>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Download Word DOCX with live modified support */}
          <button
            type="button"
            onClick={handleDownloadDocx}
            disabled={isExportingDocx}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {isExportingDocx ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <FileDown size={14} />
            )}
            <span>
              {isExportingDocx
                ? "Generating .docx..."
                : isModified
                ? "Download Edited .docx"
                : "Download .docx (Word)"}
            </span>
          </button>

          {/* Print PDF */}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition"
          >
            <Printer size={14} />
            <span>Print to PDF</span>
          </button>

          {/* Copy Markdown */}
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            {copiedType === "markdown" ? (
              <>
                <Check size={14} className="text-emerald-600" />
                <span className="text-emerald-700">Copied MD!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy Markdown</span>
              </>
            )}
          </button>

          {/* Copy Plain Text */}
          <button
            type="button"
            onClick={handleCopyPlainText}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            {copiedType === "text" ? (
              <>
                <Check size={14} className="text-emerald-600" />
                <span className="text-emerald-700">Copied Text!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy Plain Text</span>
              </>
            )}
          </button>

          {/* Download TXT */}
          <button
            type="button"
            onClick={handleDownloadTxt}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <Download size={14} />
            <span>Download .txt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
