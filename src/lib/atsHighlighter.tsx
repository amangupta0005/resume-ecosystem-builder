import React from "react";

export const ATS_ACTION_VERBS = [
  "Architected",
  "Engineered",
  "Deployed",
  "Developed",
  "Implemented",
  "Constructed",
  "Authored",
  "Designed",
  "Optimized",
  "Trained",
  "Automated",
  "Built",
  "Scaled",
  "Orchestrated",
  "Integrated",
  "Streamlined",
  "Spearheaded",
  "Secured",
  "Standardized",
  "Synthesized",
  "Configured",
  "Enhanced",
  "Eliminated",
  "Published",
  "Provisioned",
] as const;

export const ATS_TECH_KEYWORDS = [
  "React 19",
  "React 18",
  "React",
  "Next.js 14",
  "Next.js",
  "Node.js",
  "Express.js",
  "Express",
  "FastAPI",
  "Python 3",
  "Python",
  "TypeScript",
  "JavaScript",
  "Docker Compose",
  "Docker",
  "AWS EC2",
  "AWS",
  "Nginx",
  "Redis 7",
  "Redis",
  "MongoDB Atlas",
  "MongoDB",
  "PostgreSQL",
  "Prisma ORM",
  "Prisma",
  "Socket.io",
  "WebSockets",
  "Gemini 2.5 Flash",
  "Gemini",
  "RoBERTa",
  "XGBoost",
  "Scikit-Learn",
  "PyTorch",
  "OpenCV",
  "YOLOv8",
  "TF-IDF",
  "DBSCAN",
  "JWT",
  "OAuth 2.0",
  "OAuth",
  "CI/CD",
  "GitHub Actions",
  "Stripe",
  "ImageKit SDK",
  "ImageKit",
  "Tailwind CSS",
  "TailwindCSS",
  "Tailwind",
  "Vite",
  "Systemd",
  "Let's Encrypt",
  "SSL/TLS",
  "SSL/HTTPS",
  "SSL",
  "HTTPS",
  "REST APIs",
  "RESTful APIs",
  "REST",
  "CoinGecko",
  "CoinMarketCap",
  "ESP32",
  "Ethereum",
  "Ganache",
  "Blockchain",
] as const;

// Build regex patterns
const escapedVerbs = ATS_ACTION_VERBS.map((v) =>
  v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
).join("|");

const escapedTech = ATS_TECH_KEYWORDS.map((t) =>
  t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
).join("|");

// Match verbs, tech keywords, and quantified metrics like 75%+, 82 MiB, $0/hr
const ATS_REGEX = new RegExp(
  `\\b(${escapedVerbs})\\b|\\b(${escapedTech})\\b|(\\b\\d+(?:\\.\\d+)?(?:%|\\+|\\s*MiB|\\s*MB|\\s*GB|\\s*GiB|\\/hr)?\\b)`,
  "gi"
);

/**
 * Parses bullet text and highlights ATS action verbs, technical terms, and metrics.
 */
export function renderAtsHighlightedText(
  text: string,
  enabled: boolean = true
): React.ReactNode {
  if (!enabled) {
    return text;
  }

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  // Clone regex for stateful exec loop
  const regex = new RegExp(ATS_REGEX.source, "gi");
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const matchedText = match[0];
    const startIndex = match.index;

    // Push preceding normal text
    if (startIndex > lastIndex) {
      parts.push(text.slice(lastIndex, startIndex));
    }

    // Determine category
    const isVerb = ATS_ACTION_VERBS.some(
      (v) => v.toLowerCase() === matchedText.toLowerCase()
    );
    const isTech = ATS_TECH_KEYWORDS.some(
      (t) => t.toLowerCase() === matchedText.toLowerCase()
    );

    if (isVerb) {
      parts.push(
        <span
          key={`verb-${startIndex}`}
          className="font-bold text-emerald-600 bg-emerald-50/90 rounded px-1 -mx-0.5 border border-emerald-200/60 shadow-2xs"
          title="ATS High-Impact Action Verb"
        >
          {matchedText}
        </span>
      );
    } else if (isTech) {
      parts.push(
        <span
          key={`tech-${startIndex}`}
          className="font-bold text-blue-700 bg-blue-50/90 rounded px-1 -mx-0.5 border border-blue-200/60 shadow-2xs"
          title="ATS Technical Keyword"
        >
          {matchedText}
        </span>
      );
    } else {
      // Metric / number
      parts.push(
        <span
          key={`metric-${startIndex}`}
          className="font-bold text-purple-700 bg-purple-50/90 rounded px-1 -mx-0.5 border border-purple-200/60 shadow-2xs"
          title="ATS Quantified Metric / Result"
        >
          {matchedText}
        </span>
      );
    }

    lastIndex = regex.lastIndex;
  }

  // Push remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}
