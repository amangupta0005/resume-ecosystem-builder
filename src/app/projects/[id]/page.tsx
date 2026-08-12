import { redirect } from "next/navigation";

type ProjectPageProps = {
  params: {
    id: string;
  };
};

export default function ProjectPage({ params }: ProjectPageProps) {
  redirect(`/projects/${params.id}/edit`);
}
