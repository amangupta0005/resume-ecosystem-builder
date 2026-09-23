export type ResumeThemeId = "slate" | "blue" | "emerald" | "violet" | "rose";

export interface ResumeTheme {
  id: ResumeThemeId;
  name: string;
  swatchBg: string;
  headerBorder: string;
  sectionTitle: string;
  sectionBorder: string;
  titleText: string;
  tagBg: string;
  tagText: string;
  linkText: string;
  previewBorder: string;
}

export const RESUME_THEMES: Record<ResumeThemeId, ResumeTheme> = {
  slate: {
    id: "slate",
    name: "Classic Slate",
    swatchBg: "bg-slate-900",
    headerBorder: "border-slate-900",
    sectionTitle: "text-slate-900",
    sectionBorder: "border-slate-300",
    titleText: "text-slate-950",
    tagBg: "bg-slate-100",
    tagText: "text-slate-700",
    linkText: "text-slate-700",
    previewBorder: "border-slate-200",
  },
  blue: {
    id: "blue",
    name: "Corporate Blue",
    swatchBg: "bg-blue-600",
    headerBorder: "border-blue-700",
    sectionTitle: "text-blue-900",
    sectionBorder: "border-blue-200",
    titleText: "text-blue-950",
    tagBg: "bg-blue-50",
    tagText: "text-blue-700",
    linkText: "text-blue-700",
    previewBorder: "border-blue-200",
  },
  emerald: {
    id: "emerald",
    name: "Hacker Emerald",
    swatchBg: "bg-emerald-600",
    headerBorder: "border-emerald-700",
    sectionTitle: "text-emerald-900",
    sectionBorder: "border-emerald-200",
    titleText: "text-emerald-950",
    tagBg: "bg-emerald-50",
    tagText: "text-emerald-700",
    linkText: "text-emerald-700",
    previewBorder: "border-emerald-200",
  },
  violet: {
    id: "violet",
    name: "Modern Violet",
    swatchBg: "bg-purple-600",
    headerBorder: "border-purple-700",
    sectionTitle: "text-purple-900",
    sectionBorder: "border-purple-200",
    titleText: "text-purple-950",
    tagBg: "bg-purple-50",
    tagText: "text-purple-700",
    linkText: "text-purple-700",
    previewBorder: "border-purple-200",
  },
  rose: {
    id: "rose",
    name: "Executive Rose",
    swatchBg: "bg-rose-600",
    headerBorder: "border-rose-700",
    sectionTitle: "text-rose-900",
    sectionBorder: "border-rose-200",
    titleText: "text-rose-950",
    tagBg: "bg-rose-50",
    tagText: "text-rose-700",
    linkText: "text-rose-700",
    previewBorder: "border-rose-200",
  },
};
