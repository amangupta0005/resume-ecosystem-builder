import type { ResumeProjectData } from "@/features/resumes/server/queries";

export interface MarkdownExportOptions {
  includePromptHeader?: boolean;
  targetRole?: string;
}

/**
 * Serializes resume projects to clean, structured Markdown optimized for LLMs (Claude, GPT).
 */
export function serializeResumeProjectsToMarkdown(
  domainName: string,
  projects: ResumeProjectData[],
  options: MarkdownExportOptions = { includePromptHeader: true }
): string {
  const lines: string[] = [];

  if (options.includePromptHeader) {
    lines.push(`<!-- Resume Portfolio Export for LLM Review / Tailoring -->`);
    lines.push(
      `> Context: Below is my project portfolio for the **${domainName}** domain. Please review these bullets for impact, technical clarity, and ATS keyword relevance.\n`
    );
  }

  lines.push(`# ${domainName} — Key Technical Projects\n`);

  for (const project of projects) {
    lines.push(`## ${project.title}`);
    lines.push(`- **Tech Stack:** ${project.techStack.join(", ")}`);
    lines.push(
      `- **Status:** ${project.status === "completed" ? "Completed" : "In Progress"}`
    );
    if (project.liveUrl) lines.push(`- **Live Demo:** ${project.liveUrl}`);
    if (project.githubUrl) lines.push(`- **GitHub:** ${project.githubUrl}`);

    lines.push(`- **Bullet Points:**`);
    for (const bullet of project.bullets) {
      lines.push(`  * ${bullet.effectiveText}`);
    }
    lines.push("");
  }

  return lines.join("\n").trim();
}

/**
 * Serializes raw project list (from DB query) into Markdown for all portfolio projects.
 */
export function serializeAllPortfolioProjects(
  projects: Array<{
    title: string;
    description: string;
    techStack: string[];
    status: string;
    githubUrl?: string | null;
    liveUrl?: string | null;
    bullets: Array<{ text: string }>;
  }>
): string {
  let md = "# Complete Engineering Portfolio Data\n\n";
  md += "> Comprehensive project list with descriptions, tech stacks, and resume bullets.\n\n";

  for (const p of projects) {
    md += `## ${p.title}\n`;
    md += `**Description:** ${p.description}\n`;
    md += `**Tech Stack:** ${p.techStack.join(", ")}\n`;
    md += `**Status:** ${p.status === "completed" ? "Completed" : "In Progress"}\n`;
    if (p.githubUrl) md += `**GitHub:** ${p.githubUrl}\n`;
    if (p.liveUrl) md += `**Live:** ${p.liveUrl}\n`;
    md += `\n**Resume Bullets:**\n`;
    for (const b of p.bullets) {
      md += `- ${b.text}\n`;
    }
    md += `\n---\n\n`;
  }

  return md.trim();
}
