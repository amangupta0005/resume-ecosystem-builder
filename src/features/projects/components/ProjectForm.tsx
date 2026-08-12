"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";

import type { DomainName } from "@/lib/constants/domains";
import type {
  BulletInput,
  ProjectInput,
  ProjectStatusInput,
} from "@/lib/validations/resume";
import type { ProjectFormState } from "@/features/projects/server/actions";

type ProjectFormValues = Omit<ProjectInput, "bullets"> & {
  bullets: BulletInput[];
};

type ProjectFormProps = {
  mode: "create" | "edit";
  domains: DomainName[];
  initialProject?: ProjectFormValues;
  action: (
    previousState: ProjectFormState,
    formData: FormData,
  ) => Promise<ProjectFormState>;
};

const emptyProject: ProjectFormValues = {
  title: "",
  description: "",
  techStack: [],
  status: "completed",
  githubUrl: "",
  liveUrl: "",
  domainNames: [],
  bullets: [{ text: "", order: 0 }],
};

const initialActionState: ProjectFormState = {
  status: "idle",
};

function SubmitButton({ mode }: { mode: ProjectFormProps["mode"] }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {mode === "create" ? (
        <Plus aria-hidden="true" size={16} />
      ) : (
        <Save aria-hidden="true" size={16} />
      )}
      {pending ? "Saving" : mode === "create" ? "Create project" : "Save changes"}
    </button>
  );
}

function fieldError(
  state: ProjectFormState,
  field: keyof ProjectInput,
): string | undefined {
  return state.fieldErrors?.[field]?.[0];
}

function normalizeTags(tags: string[]): string[] {
  const seenTags = new Set<string>();

  return tags
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
    .filter((tag) => {
      const normalizedTag = tag.toLowerCase();

      if (seenTags.has(normalizedTag)) {
        return false;
      }

      seenTags.add(normalizedTag);
      return true;
    });
}

export function ProjectForm({
  mode,
  domains,
  initialProject = emptyProject,
  action,
}: ProjectFormProps) {
  const [state, formAction] = useFormState(action, initialActionState);
  const [title, setTitle] = useState(initialProject.title);
  const [description, setDescription] = useState(initialProject.description);
  const [status, setStatus] = useState<ProjectStatusInput>(
    initialProject.status,
  );
  const [domainNames, setDomainNames] = useState<DomainName[]>(
    initialProject.domainNames,
  );
  const [githubUrl, setGithubUrl] = useState(initialProject.githubUrl ?? "");
  const [liveUrl, setLiveUrl] = useState(initialProject.liveUrl ?? "");
  const [techStack, setTechStack] = useState<string[]>(
    normalizeTags(initialProject.techStack),
  );
  const [techInput, setTechInput] = useState("");
  const [bullets, setBullets] = useState<BulletInput[]>(
    initialProject.bullets.length > 0
      ? initialProject.bullets
      : emptyProject.bullets,
  );

  const payload = useMemo<ProjectInput>(
    () => ({
      title,
      description,
      status,
      githubUrl: githubUrl.trim() || undefined,
      liveUrl: liveUrl.trim() || undefined,
      domainNames,
      techStack,
      bullets: bullets.map((bullet, index) => ({
        id: bullet.id,
        text: bullet.text,
        order: index,
      })),
    }),
    [bullets, description, domainNames, githubUrl, liveUrl, status, techStack, title],
  );

  function addTechTag() {
    const nextTags = normalizeTags([...techStack, techInput]);
    setTechStack(nextTags);
    setTechInput("");
  }

  function toggleDomain(domainName: DomainName) {
    setDomainNames((currentDomains) =>
      currentDomains.includes(domainName)
        ? currentDomains.filter((domain) => domain !== domainName)
        : [...currentDomains, domainName],
    );
  }

  function updateBullet(index: number, text: string) {
    setBullets((currentBullets) =>
      currentBullets.map((bullet, bulletIndex) =>
        bulletIndex === index ? { ...bullet, text } : bullet,
      ),
    );
  }

  function moveBullet(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= bullets.length) {
      return;
    }

    setBullets((currentBullets) => {
      const nextBullets = [...currentBullets];
      const movingBullet = nextBullets[index];
      const targetBullet = nextBullets[targetIndex];

      if (!movingBullet || !targetBullet) {
        return currentBullets;
      }

      nextBullets[index] = targetBullet;
      nextBullets[targetIndex] = movingBullet;
      return nextBullets;
    });
  }

  function removeBullet(index: number) {
    setBullets((currentBullets) =>
      currentBullets.length === 1
        ? [{ text: "", order: 0 }]
        : currentBullets.filter((_bullet, bulletIndex) => bulletIndex !== index),
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="payload" value={JSON.stringify(payload)} />

      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/"
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft aria-hidden="true" size={16} />
            Projects
          </Link>
          <h1 className="text-2xl font-semibold tracking-normal text-slate-950">
            {mode === "create" ? "Add project" : "Edit project"}
          </h1>
        </div>
        <SubmitButton mode={mode} />
      </div>

      {state.status === "error" && state.message ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.message}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-[1fr_220px]">
        <div className="space-y-2">
          <label
            htmlFor="title"
            className="text-sm font-medium text-slate-800"
          >
            Title
          </label>
          <input
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          {fieldError(state, "title") ? (
            <p className="text-sm text-red-700">{fieldError(state, "title")}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium text-slate-800">Status</span>
          <div className="grid grid-cols-2 rounded-md border border-slate-300 p-1">
            {(["completed", "in-progress"] as const).map((statusOption) => (
              <button
                key={statusOption}
                type="button"
                onClick={() => setStatus(statusOption)}
                className={`h-8 rounded text-sm font-medium transition ${
                  status === statusOption
                    ? "bg-slate-950 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {statusOption}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <label
          htmlFor="description"
          className="text-sm font-medium text-slate-800"
        >
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm leading-6 text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
        {fieldError(state, "description") ? (
          <p className="text-sm text-red-700">
            {fieldError(state, "description")}
          </p>
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="githubUrl"
            className="text-sm font-medium text-slate-800"
          >
            GitHub Repository URL
          </label>
          <input
            id="githubUrl"
            placeholder="https://github.com/username/repo"
            value={githubUrl}
            onChange={(event) => setGithubUrl(event.target.value)}
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="liveUrl"
            className="text-sm font-medium text-slate-800"
          >
            Live Demo / Vercel URL
          </label>
          <input
            id="liveUrl"
            placeholder="https://my-project.vercel.app"
            value={liveUrl}
            onChange={(event) => setLiveUrl(event.target.value)}
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-3">
          <span className="text-sm font-medium text-slate-800">Tech stack</span>
          <div className="flex gap-2">
            <input
              value={techInput}
              onChange={(event) => setTechInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === ",") {
                  event.preventDefault();
                  addTechTag();
                }
              }}
              className="h-10 min-w-0 flex-1 rounded-md border border-slate-300 px-3 text-sm text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
            <button
              type="button"
              title="Add tech"
              onClick={addTechTag}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <Plus aria-hidden="true" size={16} />
              <span className="sr-only">Add tech</span>
            </button>
          </div>
          <div className="flex min-h-10 flex-wrap gap-2">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-900"
              >
                {tech}
                <button
                  type="button"
                  title={`Remove ${tech}`}
                  onClick={() =>
                    setTechStack((currentStack) =>
                      currentStack.filter((item) => item !== tech),
                    )
                  }
                  className="rounded text-amber-800 hover:text-amber-950"
                >
                  <X aria-hidden="true" size={13} />
                  <span className="sr-only">Remove {tech}</span>
                </button>
              </span>
            ))}
          </div>
          {fieldError(state, "techStack") ? (
            <p className="text-sm text-red-700">
              {fieldError(state, "techStack")}
            </p>
          ) : null}
        </div>

        <div className="space-y-3">
          <span className="text-sm font-medium text-slate-800">Domains</span>
          <div className="grid gap-2 sm:grid-cols-2">
            {domains.map((domain) => {
              const checked = domainNames.includes(domain);

              return (
                <button
                  key={domain}
                  type="button"
                  onClick={() => toggleDomain(domain)}
                  className={`flex h-10 items-center justify-between rounded-md border px-3 text-sm font-medium transition ${
                    checked
                      ? "border-blue-300 bg-blue-50 text-blue-900"
                      : "border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {domain}
                  {checked ? <Check aria-hidden="true" size={16} /> : null}
                </button>
              );
            })}
          </div>
          {fieldError(state, "domainNames") ? (
            <p className="text-sm text-red-700">
              {fieldError(state, "domainNames")}
            </p>
          ) : null}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-slate-800">Bullets</span>
          <button
            type="button"
            title="Add bullet"
            onClick={() =>
              setBullets((currentBullets) => [
                ...currentBullets,
                { text: "", order: currentBullets.length },
              ])
            }
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            <Plus aria-hidden="true" size={16} />
            Add bullet
          </button>
        </div>

        <div className="space-y-2">
          {bullets.map((bullet, index) => (
            <div
              key={`${bullet.id ?? "new"}-${index}`}
              className="grid gap-2 rounded-md border border-slate-200 bg-white p-3 sm:grid-cols-[1fr_auto]"
            >
              <textarea
                value={bullet.text}
                rows={2}
                onChange={(event) => updateBullet(index, event.target.value)}
                className="min-h-16 w-full rounded-md border border-slate-300 px-3 py-2 text-sm leading-6 text-slate-950 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
              <div className="flex items-center gap-1 sm:flex-col">
                <button
                  type="button"
                  title="Move bullet up"
                  disabled={index === 0}
                  onClick={() => moveBullet(index, -1)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowUp aria-hidden="true" size={15} />
                  <span className="sr-only">Move bullet up</span>
                </button>
                <button
                  type="button"
                  title="Move bullet down"
                  disabled={index === bullets.length - 1}
                  onClick={() => moveBullet(index, 1)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowDown aria-hidden="true" size={15} />
                  <span className="sr-only">Move bullet down</span>
                </button>
                <button
                  type="button"
                  title="Remove bullet"
                  onClick={() => removeBullet(index)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-200 text-red-700 transition hover:bg-red-50"
                >
                  <Trash2 aria-hidden="true" size={15} />
                  <span className="sr-only">Remove bullet</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        {fieldError(state, "bullets") ? (
          <p className="text-sm text-red-700">{fieldError(state, "bullets")}</p>
        ) : null}
      </section>
    </form>
  );
}
