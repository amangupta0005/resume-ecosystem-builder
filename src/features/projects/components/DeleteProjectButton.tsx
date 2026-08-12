"use client";

import { Trash2 } from "lucide-react";

import { deleteProjectAction } from "@/features/projects/server/actions";

type DeleteProjectButtonProps = {
  projectId: string;
  projectTitle: string;
};

export function DeleteProjectButton({
  projectId,
  projectTitle,
}: DeleteProjectButtonProps) {
  return (
    <form
      action={deleteProjectAction}
      onSubmit={(event) => {
        const shouldDelete = window.confirm(`Delete ${projectTitle}?`);

        if (!shouldDelete) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="projectId" value={projectId} />
      <button
        type="submit"
        title="Delete project"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        <Trash2 aria-hidden="true" size={16} />
        <span className="sr-only">Delete project</span>
      </button>
    </form>
  );
}
