import { notFound } from "next/navigation";
import { slugToDomain } from "@/lib/constants/domains";
import {
  getDomainResumesOverview,
  getResumeConfigData,
} from "@/features/resumes/server/queries";
import { DomainTabs } from "@/features/resumes/components/DomainTabs";
import { ResumeConfigManager } from "@/features/resumes/components/ResumeConfigManager";

export const dynamic = "force-dynamic";

type ResumeDomainPageProps = {
  params: {
    domain: string;
  };
};

export default async function ResumeDomainPage({ params }: ResumeDomainPageProps) {
  const domainName = slugToDomain(params.domain);

  if (!domainName) {
    notFound();
  }

  const [overviewItems, configData] = await Promise.all([
    getDomainResumesOverview(),
    getResumeConfigData(domainName),
  ]);

  return (
    <div className="space-y-6">
      <DomainTabs
        currentDomain={domainName}
        overviewItems={overviewItems}
      />
      <ResumeConfigManager configData={configData} />
    </div>
  );
}
