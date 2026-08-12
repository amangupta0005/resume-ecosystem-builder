"use client";

import { useState, useTransition } from "react";
import {
  Save,
  Plus,
  Trash2,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Link2,
  GraduationCap,
  Award,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Code,
} from "lucide-react";
import type { ProfileData } from "@/features/profile/server/queries";
import { saveProfileAction } from "@/features/profile/server/actions";
import type { ProfileFormState } from "@/lib/validations/profile";

type ProfileEditorFormProps = {
  initialProfile: ProfileData;
};

export function ProfileEditorForm({ initialProfile }: ProfileEditorFormProps) {
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [formState, setFormState] = useState<ProfileFormState>({ status: "idle" });
  const [isPending, startTransition] = useTransition();

  // Tag helpers for comma separated skill inputs
  const [languagesInput, setLanguagesInput] = useState(
    initialProfile.languages.join(", "),
  );
  const [frameworksInput, setFrameworksInput] = useState(
    initialProfile.frameworks.join(", "),
  );
  const [toolsInput, setToolsInput] = useState(initialProfile.tools.join(", "));
  const [strengthsInput, setStrengthsInput] = useState(
    (initialProfile.strengths ?? []).join(", "),
  );

  // Handlers for education items
  const addEducation = () => {
    setProfile((prev) => ({
      ...prev,
      educations: [
        ...prev.educations,
        {
          id: `temp-${Date.now()}`,
          institution: "",
          degree: "",
          fieldOfStudy: "",
          startDate: "",
          endDate: "",
          grade: "",
          order: prev.educations.length,
        },
      ],
    }));
  };

  const updateEducation = (
    index: number,
    field: keyof ProfileData["educations"][0],
    value: string,
  ) => {
    setProfile((prev) => {
      const next = [...prev.educations];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, educations: next };
    });
  };

  const removeEducation = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      educations: prev.educations.filter((_, i) => i !== index),
    }));
  };

  // Handlers for certification items
  const addCertification = () => {
    setProfile((prev) => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        {
          id: `temp-cert-${Date.now()}`,
          name: "",
          issuer: "",
          issueDate: "",
          credentialUrl: "",
          order: prev.certifications.length,
        },
      ],
    }));
  };

  const updateCertification = (
    index: number,
    field: keyof ProfileData["certifications"][0],
    value: string,
  ) => {
    setProfile((prev) => {
      const next = [...prev.certifications];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, certifications: next };
    });
  };

  const removeCertification = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  };

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parseSkills = (input: string) =>
      input
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    const payload = {
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      websiteUrl: profile.websiteUrl,
      githubUrl: profile.githubUrl,
      linkedinUrl: profile.linkedinUrl,
      summary: profile.summary,
      languages: parseSkills(languagesInput),
      frameworks: parseSkills(frameworksInput),
      tools: parseSkills(toolsInput),
      strengths: parseSkills(strengthsInput),
      educations: profile.educations.map((edu, idx) => ({
        institution: edu.institution,
        degree: edu.degree,
        fieldOfStudy: edu.fieldOfStudy,
        startDate: edu.startDate,
        endDate: edu.endDate,
        grade: edu.grade,
        order: idx,
      })),
      certifications: profile.certifications.map((cert, idx) => ({
        name: cert.name,
        issuer: cert.issuer,
        issueDate: cert.issueDate,
        credentialUrl: cert.credentialUrl,
        order: idx,
      })),
    };

    const formData = new FormData();
    formData.append("profileData", JSON.stringify(payload));

    startTransition(async () => {
      const res = await saveProfileAction({ status: "idle" }, formData);
      setFormState(res);
      if (res.status === "success") {
        setTimeout(() => {
          setFormState({ status: "idle" });
        }, 4000);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Toast / Status Alert */}
      {formState.status === "success" ? (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-800 shadow-sm">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{formState.message}</span>
        </div>
      ) : null}

      {formState.status === "error" ? (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-4 text-xs text-red-800 shadow-sm">
          <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">{formState.message}</p>
            {formState.fieldErrors ? (
              <ul className="mt-1 list-disc pl-4 space-y-0.5">
                {Object.entries(formState.fieldErrors).map(([k, errs]) => (
                  <li key={k}>
                    <strong>{k}:</strong> {errs.join(", ")}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* 1. Personal & Contact Information */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <User size={18} className="text-slate-700" />
          <h2 className="text-sm font-semibold text-slate-900">
            Personal & Contact Information
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-medium text-slate-700">Full Name *</label>
            <input
              type="text"
              required
              value={profile.fullName}
              onChange={(e) =>
                setProfile((p) => ({ ...p, fullName: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
              placeholder="e.g. Alex Rivera"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-medium text-slate-700">Email Address *</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={profile.email}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, email: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 pl-8 p-2.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                placeholder="alex@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-medium text-slate-700">Phone Number</label>
            <div className="relative">
              <Phone size={14} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={profile.phone}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, phone: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 pl-8 p-2.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-medium text-slate-700">Location</label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={profile.location}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, location: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 pl-8 p-2.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                placeholder="San Francisco, CA"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Links & Social Profiles */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Globe size={18} className="text-slate-700" />
          <h2 className="text-sm font-semibold text-slate-900">
            Online Presence & Links
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-medium text-slate-700">LinkedIn URL</label>
            <div className="relative">
              <Link2 size={14} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={profile.linkedinUrl}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, linkedinUrl: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 pl-8 p-2.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                placeholder="https://linkedin.com/in/alex"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-medium text-slate-700">GitHub URL</label>
            <div className="relative">
              <Link2 size={14} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={profile.githubUrl}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, githubUrl: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 pl-8 p-2.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                placeholder="https://github.com/alex"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-medium text-slate-700">Portfolio / Website</label>
            <div className="relative">
              <Globe size={14} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={profile.websiteUrl}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, websiteUrl: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 pl-8 p-2.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none"
                placeholder="https://alex.dev"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Professional Summary */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-purple-600" />
            <h2 className="text-sm font-semibold text-slate-900">
              Professional Summary / Bio
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">
            {profile.summary?.length ?? 0} characters
          </span>
        </div>

        <textarea
          rows={3}
          value={profile.summary}
          onChange={(e) =>
            setProfile((p) => ({ ...p, summary: e.target.value }))
          }
          className="w-full rounded-lg border border-slate-300 p-3 text-xs text-slate-900 leading-relaxed focus:border-slate-900 focus:outline-none"
          placeholder="Brief 2-3 sentence overview highlighting core competencies and domain strengths..."
        />
      </section>

      {/* 4. Categorized Technical Skills */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Code size={18} className="text-slate-700" />
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Core Technical Skills
            </h2>
            <p className="text-[11px] text-slate-500">
              Comma-separated list of skills per category
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-800">
              Programming Languages
            </label>
            <input
              type="text"
              value={languagesInput}
              onChange={(e) => setLanguagesInput(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none font-mono"
              placeholder="TypeScript, Python, Go, SQL, C++"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-800">
              Frameworks & Libraries
            </label>
            <input
              type="text"
              value={frameworksInput}
              onChange={(e) => setFrameworksInput(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none font-mono"
              placeholder="Next.js, React, PyTorch, FastAPI, Express"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-800">
              Tools, Cloud & Databases
            </label>
            <input
              type="text"
              value={toolsInput}
              onChange={(e) => setToolsInput(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none font-mono"
              placeholder="PostgreSQL, Docker, Redis, AWS, Git, Linux"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-800">
              Core Competencies & Strengths (DSA, OOP, System Design, etc.)
            </label>
            <input
              type="text"
              value={strengthsInput}
              onChange={(e) => setStrengthsInput(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-slate-900 focus:outline-none font-mono"
              placeholder="Data Structures & Algorithms, OOP, RESTful APIs, Database Design, Problem Solving"
            />
          </div>
        </div>
      </section>

      {/* 5. Education */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <GraduationCap size={18} className="text-slate-700" />
            <h2 className="text-sm font-semibold text-slate-900">
              Education ({profile.educations.length})
            </h2>
          </div>

          <button
            type="button"
            onClick={addEducation}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            <Plus size={14} />
            <span>Add Degree</span>
          </button>
        </div>

        <div className="space-y-4">
          {profile.educations.map((edu, idx) => (
            <div
              key={edu.id}
              className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 space-y-3 relative"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Degree #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => removeEducation(idx)}
                  className="text-red-500 hover:text-red-700 transition"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-medium text-slate-600">Institution *</label>
                  <input
                    type="text"
                    required
                    value={edu.institution}
                    onChange={(e) =>
                      updateEducation(idx, "institution", e.target.value)
                    }
                    className="w-full rounded border border-slate-300 p-2 bg-white text-xs text-slate-900 focus:outline-none"
                    placeholder="e.g. UC Berkeley"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-600">Degree *</label>
                  <input
                    type="text"
                    required
                    value={edu.degree}
                    onChange={(e) =>
                      updateEducation(idx, "degree", e.target.value)
                    }
                    className="w-full rounded border border-slate-300 p-2 bg-white text-xs text-slate-900 focus:outline-none"
                    placeholder="e.g. B.S. Computer Science"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-600">Field of Study</label>
                  <input
                    type="text"
                    value={edu.fieldOfStudy}
                    onChange={(e) =>
                      updateEducation(idx, "fieldOfStudy", e.target.value)
                    }
                    className="w-full rounded border border-slate-300 p-2 bg-white text-xs text-slate-900 focus:outline-none"
                    placeholder="e.g. Machine Learning & Systems"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-600">GPA / Honors</label>
                  <input
                    type="text"
                    value={edu.grade}
                    onChange={(e) =>
                      updateEducation(idx, "grade", e.target.value)
                    }
                    className="w-full rounded border border-slate-300 p-2 bg-white text-xs text-slate-900 focus:outline-none"
                    placeholder="e.g. GPA 3.9 / Magna Cum Laude"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-600">Start Year</label>
                  <input
                    type="text"
                    value={edu.startDate}
                    onChange={(e) =>
                      updateEducation(idx, "startDate", e.target.value)
                    }
                    className="w-full rounded border border-slate-300 p-2 bg-white text-xs text-slate-900 focus:outline-none"
                    placeholder="2019"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-600">End Year / Grad Date</label>
                  <input
                    type="text"
                    value={edu.endDate}
                    onChange={(e) =>
                      updateEducation(idx, "endDate", e.target.value)
                    }
                    className="w-full rounded border border-slate-300 p-2 bg-white text-xs text-slate-900 focus:outline-none"
                    placeholder="2023"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Certifications */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-slate-700" />
            <h2 className="text-sm font-semibold text-slate-900">
              Certifications & Credentials ({profile.certifications.length})
            </h2>
          </div>

          <button
            type="button"
            onClick={addCertification}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            <Plus size={14} />
            <span>Add Certification</span>
          </button>
        </div>

        <div className="space-y-4">
          {profile.certifications.map((cert, idx) => (
            <div
              key={cert.id}
              className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 space-y-3 relative"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Certification #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => removeCertification(idx)}
                  className="text-red-500 hover:text-red-700 transition"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-medium text-slate-600">
                    Certification Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={cert.name}
                    onChange={(e) =>
                      updateCertification(idx, "name", e.target.value)
                    }
                    className="w-full rounded border border-slate-300 p-2 bg-white text-xs text-slate-900 focus:outline-none"
                    placeholder="AWS Solutions Architect"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-600">Issuer *</label>
                  <input
                    type="text"
                    required
                    value={cert.issuer}
                    onChange={(e) =>
                      updateCertification(idx, "issuer", e.target.value)
                    }
                    className="w-full rounded border border-slate-300 p-2 bg-white text-xs text-slate-900 focus:outline-none"
                    placeholder="Amazon Web Services"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-600">Issue Date / Year</label>
                  <input
                    type="text"
                    value={cert.issueDate}
                    onChange={(e) =>
                      updateCertification(idx, "issueDate", e.target.value)
                    }
                    className="w-full rounded border border-slate-300 p-2 bg-white text-xs text-slate-900 focus:outline-none"
                    placeholder="2024"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-600">Verification URL</label>
                  <input
                    type="text"
                    value={cert.credentialUrl}
                    onChange={(e) =>
                      updateCertification(idx, "credentialUrl", e.target.value)
                    }
                    className="w-full rounded border border-slate-300 p-2 bg-white text-xs text-slate-900 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Floating / Bottom Save Bar */}
      <div className="sticky bottom-4 z-10 flex items-center justify-between rounded-xl bg-slate-950 p-4 text-white shadow-xl">
        <span className="text-xs text-slate-300">
          Save changes to synchronize all domain resumes immediately.
        </span>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50 transition"
        >
          <Save size={15} />
          <span>{isPending ? "Saving Profile..." : "Save Profile & Resumes"}</span>
        </button>
      </div>
    </form>
  );
}
