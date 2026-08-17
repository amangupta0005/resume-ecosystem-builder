import Link from "next/link";
import { FileText, ExternalLink, Briefcase, FileCode2 } from "lucide-react";
import prisma from "@/lib/prisma";
import { domainToSlug } from "@/lib/constants/domains";

export const dynamic = "force-dynamic";

export default async function MobileLinksPage() {
  const domains = await prisma.domain.findMany({
    include: {
      resumeConfigs: {
        orderBy: [
          { isDefault: "desc" },
          { updatedAt: "desc" },
        ],
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 py-12 px-6 flex flex-col items-center">
      <div className="w-full max-w-md mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20 mb-6">
            <Briefcase className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            My Resumes
          </h1>
          <p className="text-slate-400 text-sm">
            Tap a link below to view or export the ATS PDF.
          </p>
        </div>

        {/* Links List */}
        <div className="space-y-8 mt-8">
          {domains.map((domain) => (
            <div key={domain.id} className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2">
                {domain.name}
              </h2>
              
              <div className="space-y-3">
                {domain.resumeConfigs.map((config) => {
                  const slug = domainToSlug(domain.name as any);
                  const previewUrl = `/resumes/${slug}/${config.id}/preview`;
                  
                  return (
                    <Link
                      key={config.id}
                      href={previewUrl}
                      className="group flex items-center justify-between p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 transition shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0">
                          <FileCode2 className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-200 group-hover:text-white transition">
                            {config.variantName}
                          </span>
                          <span className="text-xs text-slate-400 truncate max-w-[200px]">
                            {config.isDefault ? "Default Configuration" : "Custom Variant"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="w-8 h-8 rounded-full bg-slate-900/50 flex items-center justify-center group-hover:bg-blue-600/20 transition">
                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-12 text-center">
          <Link 
            href="/"
            className="text-xs text-slate-500 hover:text-slate-400 transition underline underline-offset-4"
          >
            Go back to desktop configurator
          </Link>
        </div>
      </div>
    </div>
  );
}
