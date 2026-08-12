import { redirect } from "next/navigation";
import { DOMAIN_NAMES, domainToSlug } from "@/lib/constants/domains";

export const dynamic = "force-dynamic";

export default function ResumesRootPage() {
  const defaultSlug = domainToSlug(DOMAIN_NAMES[0]);
  redirect(`/resumes/${defaultSlug}`);
}
