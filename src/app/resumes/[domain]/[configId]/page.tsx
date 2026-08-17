import { notFound } from "next/navigation";
import { slugToDomain } from "@/lib/constants/domains";
import {
  getDomainResumesOverview,
  getResumeConfigData,
  getDomainVariants,
} from "@/features/resumes/server/queries";
import { DomainTabs } from "@/features/resumes/components/DomainTabs";
import { ResumeConfigManager } from "@/features/resumes/components/ResumeConfigManager";

export const dynamic = "force-dynamic";

type ResumeDomainConfigPageProps = {
  params: {
    domain: string;
    configId: string;
  };
};

export default async function ResumeDomainConfigPage({ params }: ResumeDomainConfigPageProps) {
  const domainName = slugToDomain(params.domain);

  if (!domainName) {
    notFound();
  }

  const [overviewItems, configData, variants] = await Promise.all([
    getDomainResumesOverview(),
    getResumeConfigData(domainName, params.configId),
    getDomainVariants(domainName),
  ]);

  return (
    <div className="space-y-6">
      <DomainTabs
        currentDomain={domainName}
        overviewItems={overviewItems}
      />
      <ResumeConfigManager configData={configData} variants={variants} />
    </div>
  );
}
