import { ProjectList } from "@/features/projects/components/ProjectList";
import { getProjectList } from "@/features/projects/server/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const projects = await getProjectList();

  return <ProjectList projects={projects} />;
}
