export const DOMAIN_NAMES = [
  "AI/ML",
  "Full-Stack",
  "Computer Vision",
  "IoT+ML",
  "AI Content Evaluation",
] as const;

export type DomainName = (typeof DOMAIN_NAMES)[number];

export const DOMAIN_SLUG_MAP: Record<DomainName, string> = {
  "AI/ML": "ai-ml",
  "Full-Stack": "full-stack",
  "Computer Vision": "computer-vision",
  "IoT+ML": "iot-ml",
  "AI Content Evaluation": "ai-content-evaluation",
};

export const SLUG_TO_DOMAIN_MAP: Record<string, DomainName> = {
  "ai-ml": "AI/ML",
  "full-stack": "Full-Stack",
  "computer-vision": "Computer Vision",
  "iot-ml": "IoT+ML",
  "ai-content-evaluation": "AI Content Evaluation",
};

export function domainToSlug(domain: DomainName): string {
  return DOMAIN_SLUG_MAP[domain] ?? domain.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export function slugToDomain(slug: string): DomainName | null {
  return SLUG_TO_DOMAIN_MAP[slug.toLowerCase()] ?? null;
}
