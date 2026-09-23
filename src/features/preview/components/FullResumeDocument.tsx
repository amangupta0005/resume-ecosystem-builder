"use client";

import React, { forwardRef } from "react";
import type { ResumeDocumentData } from "@/features/preview/server/queries";
import { renderAtsHighlightedText } from "@/lib/atsHighlighter";
import { RESUME_THEMES, type ResumeThemeId } from "@/lib/resumeThemes";

type FullResumeDocumentProps = {
  documentData: ResumeDocumentData;
  highlightOverrides?: boolean;
  highlightAtsKeywords?: boolean;
  themeId?: ResumeThemeId;
};

export const FullResumeDocument = forwardRef<HTMLDivElement, FullResumeDocumentProps>(
  function FullResumeDocument(
    {
      documentData,
      highlightOverrides = true,
      highlightAtsKeywords = false,
      themeId = "slate",
    },
    ref
  ) {
  const theme = RESUME_THEMES[themeId] || RESUME_THEMES.slate;
  const { domainName, profile, projects, aggregatedSkills } = documentData;

  const contactItems: string[] = [];
  if (profile.email) contactItems.push(profile.email);
  if (profile.phone) contactItems.push(profile.phone);
  if (profile.location) contactItems.push(profile.location);
  if (profile.linkedinUrl) contactItems.push(profile.linkedinUrl.replace(/^https?:\/\//, ""));
  if (profile.githubUrl) contactItems.push(profile.githubUrl.replace(/^https?:\/\//, ""));
  if (profile.websiteUrl) contactItems.push(profile.websiteUrl.replace(/^https?:\/\//, ""));

  const hasCategorizedSkills =
    profile.languages.length > 0 ||
    profile.frameworks.length > 0 ||
    profile.tools.length > 0 ||
    (profile.strengths?.length ?? 0) > 0;

  return (
    <div
      ref={ref}
      id="ats-resume-sheet"
      className="mx-auto max-w-[820px] bg-white p-8 sm:p-12 shadow-md print:shadow-none print:p-0 print:max-w-none text-slate-900 font-sans leading-relaxed border border-slate-200 print:border-none space-y-5"
    >
      {/* Resume Header */}
      <header className={`border-b-2 ${theme.headerBorder} pb-4 text-center space-y-1.5`}>
        <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${theme.titleText} uppercase`}>
          {profile.fullName}
        </h1>
        <div className={`text-xs font-bold uppercase tracking-widest ${theme.sectionTitle}`}>
          {documentData.titleOverride ? documentData.titleOverride : `Software Engineer — ${domainName}`}
        </div>
        {contactItems.length > 0 ? (
          <p className="text-[11px] text-slate-600 tracking-normal pt-1">
            {contactItems.join("  •  ")}
          </p>
        ) : null}
      </header>

      {/* Professional Summary */}
      {(documentData.summaryOverride || profile.summary) ? (
        <section className="space-y-1.5">
          <h2 className={`text-xs font-bold uppercase tracking-widest ${theme.sectionTitle} border-b ${theme.sectionBorder} pb-0.5`}>
            Professional Summary
          </h2>
          <p className="text-xs leading-relaxed text-slate-800 text-justify">
            {documentData.summaryOverride || profile.summary}
          </p>
        </section>
      ) : null}

      {/* Technical Skills Section */}
      {documentData.skillsOverride && documentData.skillsOverride.length > 0 ? (
        <section className="space-y-2">
          <h2 className={`text-xs font-bold uppercase tracking-widest ${theme.sectionTitle} border-b ${theme.sectionBorder} pb-0.5`}>
            Technical Skills
          </h2>
          <div className="text-xs space-y-1 text-slate-800">
            {documentData.skillsOverride.map((skill, index) => (
              <div key={index}>
                <span className={`font-bold ${theme.titleText}`}>{skill.category}: </span>
                <span>{skill.skills}</span>
              </div>
            ))}
          </div>
        </section>
      ) : hasCategorizedSkills || aggregatedSkills.length > 0 ? (
        <section className="space-y-2">
          <h2 className={`text-xs font-bold uppercase tracking-widest ${theme.sectionTitle} border-b ${theme.sectionBorder} pb-0.5`}>
            Technical Skills
          </h2>
          <div className="text-xs space-y-1 text-slate-800">
            {profile.languages.length > 0 ? (
              <div>
                <span className={`font-bold ${theme.titleText}`}>Programming Languages: </span>
                <span>{profile.languages.join(", ")}</span>
              </div>
            ) : null}

            {profile.frameworks.length > 0 ? (
              <div>
                <span className={`font-bold ${theme.titleText}`}>Frameworks & Libraries: </span>
                <span>{profile.frameworks.join(", ")}</span>
              </div>
            ) : null}

            {profile.tools.length > 0 ? (
              <div>
                <span className={`font-bold ${theme.titleText}`}>Tools, Cloud & Databases: </span>
                <span>{profile.tools.join(", ")}</span>
              </div>
            ) : null}

            {profile.strengths && profile.strengths.length > 0 ? (
              <div>
                <span className={`font-bold ${theme.titleText}`}>Core Competencies: </span>
                <span>{profile.strengths.join(", ")}</span>
              </div>
            ) : null}

            {!hasCategorizedSkills && aggregatedSkills.length > 0 ? (
              <div>
                <span className={`font-bold ${theme.titleText}`}>Proficiencies: </span>
                <span>{aggregatedSkills.join(", ")}</span>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Featured Projects Section */}
      <section className="space-y-4">
        <h2 className={`text-xs font-bold uppercase tracking-widest ${theme.sectionTitle} border-b ${theme.sectionBorder} pb-0.5`}>
          Key Projects ({projects.length})
        </h2>

        {projects.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 italic">
            No projects currently included for this resume. Return to the configurator to toggle projects on.
          </div>
        ) : (
          projects.map((project) => (
            <article key={project.id} className="space-y-1 break-inside-avoid">
              {/* Project Header */}
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h3 className={`text-xs font-bold ${theme.titleText}`}>
                    {project.title}
                  </h3>
                  {project.techStack.length > 0 ? (
                    <span className="text-xs text-slate-600 font-normal">
                      | {project.techStack.join(", ")}
                    </span>
                  ) : null}
                  {project.githubUrl ? (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-medium text-blue-700 hover:underline print:text-slate-700"
                    >
                      [GitHub]
                    </a>
                  ) : null}
                  {project.liveUrl ? (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-medium text-emerald-700 hover:underline print:text-slate-700"
                    >
                      [Live Demo]
                    </a>
                  ) : null}
                </div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase">
                  {project.status === "completed" ? "Completed" : "In Progress"}
                </span>
              </div>

              {/* Bullet Points */}
              <ul className="space-y-1 pl-4 text-xs text-slate-800 leading-relaxed list-disc">
                {project.bullets.map((bullet) => (
                  <li
                    key={bullet.id}
                    className={`transition ${
                      bullet.isOverridden && highlightOverrides
                        ? "print:bg-transparent print:font-normal bg-purple-50/80 rounded px-1 -mx-1 text-slate-950 font-medium"
                        : "text-slate-800"
                    }`}
                  >
                    {renderAtsHighlightedText(bullet.text, highlightAtsKeywords)}
                  </li>
                ))}
              </ul>
            </article>
          ))
        )}
      </section>

      {/* Education Section */}
      {profile.educations.length > 0 ? (
        <section className="space-y-2 break-inside-avoid">
          <h2 className={`text-xs font-bold uppercase tracking-widest ${theme.sectionTitle} border-b ${theme.sectionBorder} pb-0.5`}>
            Education
          </h2>
          <div className="space-y-2">
            {profile.educations.map((edu) => {
              const dateStr =
                edu.startDate && edu.endDate
                  ? `${edu.startDate} – ${edu.endDate}`
                  : edu.endDate || edu.startDate || "";

              return (
                <div key={edu.id} className="text-xs">
                  <div className={`flex flex-wrap items-baseline justify-between gap-1 font-semibold ${theme.titleText}`}>
                    <span>
                      {edu.degree} — {edu.institution}
                    </span>
                    {dateStr ? (
                      <span className="text-slate-600 font-normal">{dateStr}</span>
                    ) : null}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    {edu.fieldOfStudy ? <span>{edu.fieldOfStudy}</span> : null}
                    {edu.fieldOfStudy && edu.grade ? " • " : null}
                    {edu.grade ? <span>{edu.grade}</span> : null}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* Certifications Section */}
      {profile.certifications.length > 0 ? (
        <section className="space-y-2 break-inside-avoid">
          <h2 className={`text-xs font-bold uppercase tracking-widest ${theme.sectionTitle} border-b ${theme.sectionBorder} pb-0.5`}>
            Certifications
          </h2>
          <ul className="text-xs space-y-1 text-slate-800">
            {profile.certifications.map((cert) => (
              <li key={cert.id} className="flex flex-wrap items-baseline justify-between gap-1">
                <div>
                  <span className={`font-semibold ${theme.titleText}`}>{cert.name}</span>
                  <span className="text-slate-600"> — {cert.issuer}</span>
                </div>
                {cert.issueDate ? (
                  <span className="text-[11px] text-slate-500">{cert.issueDate}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
});
