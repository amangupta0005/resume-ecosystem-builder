"use client";

import { useState, useTransition } from "react";
import { Edit2, RotateCcw, Check, X, Sparkles } from "lucide-react";
import type { DomainName } from "@/lib/constants/domains";
import type { ResumeBulletData } from "@/features/resumes/server/queries";
import {
  saveBulletOverrideAction,
  revertBulletOverrideAction,
} from "@/features/resumes/server/actions";

type BulletOverrideEditorProps = {
  resumeConfigId: string;
  domainName: DomainName;
  bullet: ResumeBulletData;
  onBulletUpdated?: (bulletId: string, newOverrideText?: string) => void;
};

export function BulletOverrideEditor({
  resumeConfigId,
  domainName,
  bullet,
  onBulletUpdated,
}: BulletOverrideEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(bullet.effectiveText);
  const [showOriginal, setShowOriginal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleStartEditing() {
    setDraftText(bullet.effectiveText);
    setErrorMessage(null);
    setIsEditing(true);
  }

  function handleCancelEditing() {
    setDraftText(bullet.effectiveText);
    setErrorMessage(null);
    setIsEditing(false);
  }

  function handleSaveOverride() {
    if (!draftText.trim()) {
      setErrorMessage("Bullet text cannot be empty.");
      return;
    }

    setErrorMessage(null);
    startTransition(async () => {
      // If user typed exact master text, we can just revert the override
      if (draftText.trim() === bullet.originalText.trim()) {
        const result = await revertBulletOverrideAction(resumeConfigId, bullet.id);
        if (result.success) {
          setIsEditing(false);
          onBulletUpdated?.(bullet.id, undefined);
        } else {
          setErrorMessage(result.message ?? "Failed to update bullet.");
        }
        return;
      }

      const result = await saveBulletOverrideAction(
        resumeConfigId,
        bullet.id,
        draftText.trim(),
      );

      if (result.success) {
        setIsEditing(false);
        onBulletUpdated?.(bullet.id, draftText.trim());
      } else {
        setErrorMessage(result.message ?? "Failed to save bullet override.");
      }
    });
  }

  function handleRevert() {
    const confirmed = window.confirm(
      `Revert this bullet back to the original master text?\n\nOriginal: "${bullet.originalText}"`,
    );
    if (!confirmed) return;

    setErrorMessage(null);
    startTransition(async () => {
      const result = await revertBulletOverrideAction(resumeConfigId, bullet.id);
      if (result.success) {
        setDraftText(bullet.originalText);
        setIsEditing(false);
        onBulletUpdated?.(bullet.id, undefined);
      } else {
        setErrorMessage(result.message ?? "Failed to revert bullet.");
      }
    });
  }

  if (isEditing) {
    return (
      <div className="rounded-lg border border-purple-200 bg-purple-50/40 p-3.5 space-y-3 transition">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-900">
            <Sparkles size={13} className="text-purple-600" />
            <span>Customize bullet for {domainName} resume</span>
          </div>
          <span className="text-[11px] text-slate-500">
            Original master bullet will remain untouched
          </span>
        </div>

        <div className="rounded border border-slate-200 bg-white/80 p-2 text-xs text-slate-600">
          <span className="font-semibold text-slate-700">Master Text: </span>
          {bullet.originalText}
        </div>

        <textarea
          rows={3}
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          placeholder="Enter customized bullet text tailored for this domain..."
          disabled={isPending}
          className="w-full rounded-md border border-purple-300 bg-white px-3 py-2 text-sm leading-relaxed text-slate-900 shadow-sm outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200 disabled:opacity-60"
        />

        {errorMessage ? (
          <p className="text-xs font-medium text-red-600">{errorMessage}</p>
        ) : null}

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleCancelEditing}
            disabled={isPending}
            className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <X size={13} />
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveOverride}
            disabled={isPending}
            className="inline-flex h-8 items-center gap-1 rounded-md bg-purple-950 px-3 text-xs font-medium text-white hover:bg-purple-900 disabled:opacity-50"
          >
            <Check size={13} />
            {isPending ? "Saving..." : "Save for this Resume"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group relative rounded-md border p-3 transition ${
        bullet.isOverridden
          ? "border-purple-200 bg-purple-50/20 hover:bg-purple-50/40"
          : "border-slate-100 bg-slate-50/40 hover:border-slate-200 hover:bg-slate-50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {bullet.isOverridden ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-semibold text-purple-800">
                <Sparkles size={11} />
                Customized for {domainName}
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                Master bullet
              </span>
            )}

            {bullet.isOverridden ? (
              <button
                type="button"
                onClick={() => setShowOriginal((prev) => !prev)}
                className="text-[11px] text-purple-700 underline hover:text-purple-900"
              >
                {showOriginal ? "Hide master text" : "View master text"}
              </button>
            ) : null}
          </div>

          <p className="text-sm leading-relaxed text-slate-800">
            <span className="mr-2 text-slate-400">•</span>
            {bullet.effectiveText}
          </p>

          {showOriginal && bullet.isOverridden ? (
            <div className="mt-2 rounded border border-slate-200 bg-white p-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Original Master: </span>
              {bullet.originalText}
            </div>
          ) : null}

          {errorMessage ? (
            <p className="text-xs font-medium text-red-600">{errorMessage}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition">
          <button
            type="button"
            onClick={handleStartEditing}
            disabled={isPending}
            title={
              bullet.isOverridden
                ? "Edit customized text"
                : `Customize text for ${domainName}`
            }
            className={`inline-flex h-7 items-center gap-1 rounded px-2 text-xs font-medium transition ${
              bullet.isOverridden
                ? "border border-purple-300 bg-white text-purple-700 hover:bg-purple-50"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Edit2 size={12} />
            <span className="hidden sm:inline">
              {bullet.isOverridden ? "Edit" : "Customize"}
            </span>
          </button>

          {bullet.isOverridden ? (
            <button
              type="button"
              onClick={handleRevert}
              disabled={isPending}
              title="Revert to original master text"
              className="inline-flex h-7 items-center gap-1 rounded border border-slate-200 bg-white px-2 text-xs font-medium text-slate-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition"
            >
              <RotateCcw size={12} />
              <span className="hidden sm:inline">Revert</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
