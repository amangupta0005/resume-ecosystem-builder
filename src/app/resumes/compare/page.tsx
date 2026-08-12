import { getAllDomainsMatrixData } from "@/features/preview/server/queries";
import { DomainMatrixView } from "@/features/preview/components/DomainMatrixView";

export const dynamic = "force-dynamic";

export default async function CompareMatrixPage() {
  const matrixData = await getAllDomainsMatrixData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Cross-Domain Resume Matrix
        </h1>
        <p className="text-sm text-slate-500">
          Compare project inclusions and tailored bullet variations across all 4 domains in one unified view.
        </p>
      </div>

      <DomainMatrixView matrixData={matrixData} />
    </div>
  );
}
