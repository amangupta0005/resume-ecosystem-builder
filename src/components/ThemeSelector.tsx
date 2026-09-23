"use client";

import React from "react";
import { Palette } from "lucide-react";
import {
  RESUME_THEMES,
  type ResumeThemeId,
  type ResumeTheme,
} from "@/lib/resumeThemes";

interface ThemeSelectorProps {
  currentTheme: ResumeThemeId;
  onSelectTheme: (themeId: ResumeThemeId) => void;
  compact?: boolean;
}

export function ThemeSelector({
  currentTheme,
  onSelectTheme,
  compact = false,
}: ThemeSelectorProps) {
  const themeList = Object.values(RESUME_THEMES);

  return (
    <div className="flex items-center gap-2">
      {!compact && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Palette size={13} className="text-slate-400" />
          <span>Theme Accent:</span>
        </div>
      )}

      <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-lg border border-slate-200/60">
        {themeList.map((theme) => {
          const isSelected = currentTheme === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onSelectTheme(theme.id)}
              title={`${theme.name} Theme`}
              className={`relative flex items-center justify-center h-5 w-5 rounded-full transition-transform ${
                isSelected
                  ? "ring-2 ring-slate-900 ring-offset-1 scale-110"
                  : "hover:scale-105 opacity-80 hover:opacity-100"
              }`}
            >
              <span className={`h-4 w-4 rounded-full ${theme.swatchBg}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
