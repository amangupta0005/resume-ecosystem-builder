import { ProjectForm } from "@/features/projects/components/ProjectForm";
import { createProjectAction } from "@/features/projects/server/actions";
import { getDomainOptions } from "@/features/projects/server/queries";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const domains = await getDomainOptions();

  return (
    <ProjectForm
      mode="create"
      domains={domains}
      action={createProjectAction}
    />
  );
}
