import Link from "next/link";
import { Sparkles, Layers, Eye, Cpu } from "lucide-react";
import type { DomainName } from "@/lib/constants/domains";
import type { DomainResumeOverviewItem } from "@/features/resumes/server/queries";

type DomainTabsProps = {
  currentDomain: DomainName;
  overviewItems: DomainResumeOverviewItem[];
};

function renderDomainIcon(name: DomainName) {
  switch (name) {
    case "AI/ML":
      return <Sparkles size={16} className="text-purple-500" />;
    case "Full-Stack":
      return <Layers size={16} className="text-blue-500" />;
    case "Computer Vision":
      return <Eye size={16} className="text-emerald-500" />;
    case "IoT+ML":
      return <Cpu size={16} className="text-amber-500" />;
    default:
      return null;
  }
}

export function DomainTabs({ currentDomain, overviewItems }: DomainTabsProps) {
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="flex overflow-x-auto">
        {overviewItems.map((item) => {
          const isActive = item.domainName === currentDomain;

          return (
            <Link
              key={item.domainSlug}
              href={`/resumes/${item.domainSlug}`}
              className={`flex shrink-0 items-center gap-2.5 border-b-2 px-5 py-3.5 text-sm font-medium transition ${
                isActive
                  ? "border-slate-950 bg-slate-50/50 text-slate-950 font-semibold"
                  : "border-transparent text-slate-600 hover:border-slate-300 hover:bg-slate-50/50 hover:text-slate-900"
              }`}
            >
              {renderDomainIcon(item.domainName)}
              <span>{item.domainName}</span>
              <div className="flex items-center gap-1">
                <span
                  title={`${item.includedProjectCount} included projects`}
                  className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                    isActive
                      ? "bg-slate-950 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {item.includedProjectCount}
                </span>
                {item.overrideCount > 0 ? (
                  <span
                    title={`${item.overrideCount} custom bullet overrides`}
                    className="inline-flex items-center justify-center rounded-full bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-purple-700"
                  >
                    ★{item.overrideCount}
                  </span>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
