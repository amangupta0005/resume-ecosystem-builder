import { redirect } from "next/navigation";
import { slugToDomain } from "@/lib/constants/domains";
import { getResumeConfigData } from "@/features/resumes/server/queries";

export default async function DomainResumeRedirect({
  params,
}: {
  params: { domain: string };
}) {
  const domainName = slugToDomain(params.domain);
  if (!domainName) {
    return <div className="p-8 text-red-500">Invalid Domain</div>;
  }

  const configData = await getResumeConfigData(domainName);
  
  // Redirect to the default config's URL
  redirect(`/resumes/${params.domain}/${configData.resumeConfigId}`);
}
