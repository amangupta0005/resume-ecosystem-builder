import { notFound } from "next/navigation";
import { slugToDomain } from "@/lib/constants/domains";
import { getResumeDocumentData } from "@/features/preview/server/queries";
import { ResumePreviewContainer } from "@/features/preview/components/ResumePreviewContainer";

export const dynamic = "force-dynamic";

type PreviewPageProps = {
  params: {
    domain: string;
    configId: string;
  };
};

export default async function ResumePreviewPage({ params }: PreviewPageProps) {
  const domainName = slugToDomain(params.domain);

  if (!domainName) {
    notFound();
  }

  const documentData = await getResumeDocumentData(domainName, params.configId);

  return (
    <div className="space-y-6">
      {/* Top Banner (hidden in print) */}
      <div className="print:hidden flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          ATS Resume Document — {domainName}
        </h1>
        <p className="text-sm text-slate-500">
          Live single-column ATS document preview, health score analysis, and instant PDF/text export.
        </p>
      </div>

      <ResumePreviewContainer documentData={documentData} />
    </div>
  );
}
