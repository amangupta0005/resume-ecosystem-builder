import { getProfileData } from "@/features/profile/server/queries";
import { ProfileEditorForm } from "@/features/profile/components/ProfileEditorForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Candidate Profile & Credentials | Resume Ecosystem Builder",
  description:
    "Manage your personal info, professional summary, technical skills, education, and certifications.",
};

export default async function ProfilePage() {
  const profile = await getProfileData();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Candidate Profile & Credentials
        </h1>
        <p className="text-sm text-slate-500">
          Set your contact information, professional bio, technical skill categories, education history, and certifications. These automatically populate across all domain resume documents and Word .docx exports.
        </p>
      </div>

      <ProfileEditorForm initialProfile={profile} />
    </div>
  );
}
