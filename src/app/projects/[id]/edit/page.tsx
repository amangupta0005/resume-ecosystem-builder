import { ProjectForm } from "@/features/projects/components/ProjectForm";
import { updateProjectAction } from "@/features/projects/server/actions";
import { getDomainOptions, getProjectForEdit } from "@/features/projects/server/queries";

export const dynamic = "force-dynamic";

type EditProjectPageProps = {
  params: {
    id: string;
  };
};

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const [project, domains] = await Promise.all([
    getProjectForEdit(params.id),
    getDomainOptions(),
  ]);

  const action = updateProjectAction.bind(null, params.id);

  return (
    <ProjectForm
      mode="edit"
      domains={domains}
      initialProject={project}
      action={action}
    />
  );
}
