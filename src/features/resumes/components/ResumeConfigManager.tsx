"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, ListFilter, ExternalLink } from "lucide-react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import type { ResumeConfigData, ResumeProjectData, ResumeVariantItem } from "@/features/resumes/server/queries";
import {
  toggleProjectInclusionAction,
  reorderResumeProjectsAction,
  duplicateResumeConfigAction,
} from "@/features/resumes/server/actions";
import { ResumeProjectCard } from "./ResumeProjectCard";
import { ResumePreviewPanel } from "./ResumePreviewPanel";

type ResumeConfigManagerProps = {
  configData: ResumeConfigData;
  variants: ResumeVariantItem[];
};

export function ResumeConfigManager({ configData, variants }: ResumeConfigManagerProps) {
  const router = useRouter();
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [projects, setProjects] = useState<ResumeProjectData[]>(configData.projects);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "included" | "domain-only">("included");
  const [isMounted, setIsMounted] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const includedProjects = projects.filter((p) => p.included);
  const totalOverrides = projects.reduce(
    (acc, p) => acc + p.bullets.filter((b) => b.isOverridden).length,
    0,
  );

  // Filter projects according to search query and active tab
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.techStack.some((tech) =>
        tech.toLowerCase().includes(searchQuery.toLowerCase()),
      ) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterMode === "included") {
      return p.included;
    }

    if (filterMode === "domain-only") {
      return p.isDomainMatch;
    }

    return true;
  });

  // Toggle inclusion handler
  function handleToggleInclusion(projectId: string, nextIncluded: boolean) {
    setProjects((prevProjects) => {
      const updated = prevProjects.map((p) =>
        p.id === projectId ? { ...p, included: nextIncluded } : p,
      );

      // Re-index orders for included projects
      let currentOrder = 0;
      return updated.map((p) => {
        if (p.included) {
          return { ...p, order: currentOrder++ };
        }
        return p;
      });
    });

    startTransition(async () => {
      await toggleProjectInclusionAction(
        configData.resumeConfigId,
        projectId,
        nextIncluded,
      );
    });
  }

  // Move project order handler
  function handleMoveOrder(indexInIncluded: number, direction: -1 | 1) {
    const targetIndex = indexInIncluded + direction;
    if (targetIndex < 0 || targetIndex >= includedProjects.length) return;

    const currentIncluded = [...includedProjects];
    const movingProject = currentIncluded[indexInIncluded];
    const targetProject = currentIncluded[targetIndex];

    if (!movingProject || !targetProject) return;

    // Swap in included list
    currentIncluded[indexInIncluded] = targetProject;
    currentIncluded[targetIndex] = movingProject;

    // Reconstruct full projects array preserving non-included
    const newIncludedIds = currentIncluded.map((p) => p.id);
    const nonIncludedProjects = projects.filter((p) => !p.included);

    const reorderedIncluded = currentIncluded.map((p, idx) => ({
      ...p,
      order: idx,
    }));

    const nextProjects = [...reorderedIncluded, ...nonIncludedProjects];
    setProjects(nextProjects);

    startTransition(async () => {
      await reorderResumeProjectsAction(
        configData.resumeConfigId,
        newIncludedIds,
      );
    });
  }

  // Drag-and-drop reorder handler
  function handleDragEnd(result: DropResult) {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    if (sourceIndex === destIndex) return;

    const currentIncluded = [...includedProjects];
    const [movedProject] = currentIncluded.splice(sourceIndex, 1);
    if (!movedProject) return;
    currentIncluded.splice(destIndex, 0, movedProject);

    const newIncludedIds = currentIncluded.map((p) => p.id);
    const nonIncludedProjects = projects.filter((p) => !p.included);

    const reorderedIncluded = currentIncluded.map((p, idx) => ({
      ...p,
      order: idx,
    }));

    const nextProjects = [...reorderedIncluded, ...nonIncludedProjects];
    setProjects(nextProjects);

    startTransition(async () => {
      await reorderResumeProjectsAction(
        configData.resumeConfigId,
        newIncludedIds,
      );
    });
  }

  function handleSwapProject(includedProjectId: string, excludedProjectId: string) {
    const currentIncludedIds = includedProjects.map((p) => p.id);
    const index = currentIncludedIds.indexOf(includedProjectId);
    if (index === -1) return;
    
    currentIncludedIds[index] = excludedProjectId;

    setProjects((prev) => {
      const updated = prev.map((p) => {
        if (p.id === includedProjectId) return { ...p, included: false };
        if (p.id === excludedProjectId) return { ...p, included: true };
        return p;
      });
      
      return updated.map(p => {
        if (p.included) {
           return { ...p, order: currentIncludedIds.indexOf(p.id) };
        }
        return { ...p, order: 0 };
      }).sort((a, b) => {
        if (a.included && b.included) return a.order - b.order;
        if (a.included) return -1;
        if (b.included) return 1;
        return 0;
      });
    });

    startTransition(async () => {
      await toggleProjectInclusionAction(configData.resumeConfigId, includedProjectId, false);
      await toggleProjectInclusionAction(configData.resumeConfigId, excludedProjectId, true);
      await reorderResumeProjectsAction(configData.resumeConfigId, currentIncludedIds);
    });
  }

  // Bullet updated handler (customized or reverted)
  function handleBulletUpdated(
    projectId: string,
    bulletId: string,
    newOverrideText?: string,
  ) {
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project;

        const updatedBullets = project.bullets.map((b) => {
          if (b.id !== bulletId) return b;

          return {
            ...b,
            overrideText: newOverrideText,
            effectiveText: newOverrideText ?? b.originalText,
            isOverridden: newOverrideText !== undefined,
          };
        });

        return {
          ...project,
          bullets: updatedBullets,
        };
      }),
    );
  }

  async function handleDuplicate() {
    const name = prompt("Enter a name for the new variant:");
    if (!name) return;
    
    setIsDuplicating(true);
    const result = await duplicateResumeConfigAction(configData.resumeConfigId, name);
    setIsDuplicating(false);
    
    if (result.success && result.newConfigId) {
      router.push(`/resumes/${configData.domainSlug}/${result.newConfigId}`);
    } else {
      alert(result.message || "Failed to duplicate");
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Statistics */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">
              {configData.domainName} Resume
            </h1>
            <select
              value={configData.resumeConfigId}
              onChange={(e) => router.push(`/resumes/${configData.domainSlug}/${e.target.value}`)}
              className="rounded-md border border-slate-300 text-sm py-1 pl-2 pr-8 focus:ring-1 focus:ring-slate-500"
            >
              {variants.map(v => (
                <option key={v.id} value={v.id}>
                  {v.variantName} {v.isDefault ? "(Default)" : ""}
                </option>
              ))}
            </select>
            <button
              onClick={handleDuplicate}
              disabled={isDuplicating}
              className="rounded-md bg-slate-100 hover:bg-slate-200 px-3 py-1 text-sm font-medium text-slate-700 transition disabled:opacity-50 cursor-pointer"
            >
              {isDuplicating ? "Copying..." : "Duplicate Variant"}
            </button>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Configure included projects, order, and per-bullet customizations for this domain.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-xs">
            <span className="font-semibold text-slate-950">{includedProjects.length}</span>{" "}
            projects active
          </div>
          <div className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-900 shadow-xs">
            <span>{totalOverrides}</span> customized bullets
          </div>
          <Link
            href={`/resumes/${configData.domainSlug}/${configData.resumeConfigId}/preview`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition"
          >
            <span>Full ATS Preview</span>
            <ExternalLink size={13} />
          </Link>
        </div>
      </div>

      {/* Main Grid: Configurator on Left, Live Preview on Right */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px]">
        {/* Left Column: Projects Configurator */}
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
            {/* Filter pills */}
            <div className="flex items-center gap-1.5">
              <ListFilter size={15} className="text-slate-400 mr-1" />
              <button
                type="button"
                onClick={() => setFilterMode("included")}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  filterMode === "included"
                    ? "bg-slate-950 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Included ({includedProjects.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("domain-only")}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  filterMode === "domain-only"
                    ? "bg-slate-950 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Tagged {configData.domainName}
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("all")}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  filterMode === "all"
                    ? "bg-slate-950 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                All Projects ({projects.length})
              </button>
            </div>

            {/* Search input */}
            <div className="relative min-w-[200px]">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects or tech..."
                className="h-8 w-full rounded-md border border-slate-300 pl-8 pr-3 text-xs text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>

          {/* Projects List */}
          {filteredProjects.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
              <SlidersHorizontal size={28} className="mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-medium text-slate-700">No projects found</p>
              <p className="text-xs text-slate-500 mt-1">
                {filterMode === "included"
                  ? "No projects currently included. Switch to 'All Projects' to include projects in this resume."
                  : "Try clearing your search filters."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filterMode === "included" && !searchQuery && includedProjects.length > 1 && (
                <div className="flex items-center justify-between px-1 text-[11px] text-slate-500">
                  <span>💡 Drag the grip handle on any project card to reorder, or use the arrow buttons.</span>
                  <span>{includedProjects.length} projects</span>
                </div>
              )}

              {isMounted ? (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable
                    droppableId="resume-projects-droppable"
                    isDropDisabled={filterMode !== "included" || Boolean(searchQuery)}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="space-y-3"
                      >
                        {filteredProjects.map((project) => {
                          const includedIndex = includedProjects.findIndex(
                            (p) => p.id === project.id,
                          );
                          const isDraggable =
                            project.included && filterMode === "included" && !searchQuery;

                          return (
                            <Draggable
                              key={project.id}
                              draggableId={project.id}
                              index={includedIndex >= 0 ? includedIndex : 0}
                              isDragDisabled={!isDraggable}
                            >
                              {(dragProvided, snapshot) => (
                                <div
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  className={
                                    snapshot.isDragging
                                      ? "opacity-95 shadow-2xl ring-2 ring-slate-900 rounded-lg transition-shadow"
                                      : ""
                                  }
                                >
                                  <ResumeProjectCard
                                    resumeConfigId={configData.resumeConfigId}
                                    domainName={configData.domainName}
                                    project={project}
                                    index={includedIndex >= 0 ? includedIndex : 0}
                                    totalIncluded={includedProjects.length}
                                    onToggleInclusion={handleToggleInclusion}
                                    onMoveOrder={handleMoveOrder}
                                    onBulletUpdated={handleBulletUpdated}
                                    excludedProjects={projects.filter((p) => !p.included)}
                                    onSwapProject={handleSwapProject}
                                    dragHandleProps={
                                      isDraggable ? dragProvided.dragHandleProps : null
                                    }
                                  />
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              ) : (
                <div className="space-y-3">
                  {filteredProjects.map((project) => {
                    const includedIndex = includedProjects.findIndex(
                      (p) => p.id === project.id,
                    );

                    return (
                      <ResumeProjectCard
                        key={project.id}
                        resumeConfigId={configData.resumeConfigId}
                        domainName={configData.domainName}
                        project={project}
                        index={includedIndex >= 0 ? includedIndex : 0}
                        totalIncluded={includedProjects.length}
                        onToggleInclusion={handleToggleInclusion}
                        onMoveOrder={handleMoveOrder}
                        onBulletUpdated={handleBulletUpdated}
                        excludedProjects={projects.filter((p) => !p.included)}
                        onSwapProject={handleSwapProject}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Sticky Live Preview */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ResumePreviewPanel
            resumeConfigId={configData.resumeConfigId}
            domainName={configData.domainName}
            includedProjects={includedProjects}
            overrideCount={totalOverrides}
          />
        </div>
      </div>
    </div>
  );
}
