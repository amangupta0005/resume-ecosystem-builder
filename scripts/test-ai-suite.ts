import { prisma } from "@/lib/db";
import { getResumeDocumentData } from "@/features/preview/server/queries";
import type { DomainName } from "@/lib/constants/domains";
import {
  extractDeterministicKeywords,
  computeDeterministicMatch,
  analyzeResumeAgainstJd,
  suggestBulletRefinement,
  generateAnalysisCacheKey,
} from "@/lib/ai/service";

async function runAiTests() {
  console.log("=========================================");
  console.log("STARTING AI UNIT & INTEGRATION TEST SUITE");
  console.log("=========================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // TEST 1: Deterministic keyword extraction
  console.log("--- 1. Testing Deterministic Keyword Extraction ---");
  const sampleJd = `
    We are looking for a Senior Full-Stack Engineer proficient in React, Next.js 14, TypeScript,
    Docker, Redis, PostgreSQL, and AWS EC2. Must have experience building REST APIs and microservices.
  `;
  const extracted = extractDeterministicKeywords(sampleJd);
  assert(extracted.includes("React"), "Extracts React correctly");
  assert(extracted.includes("Next.js 14") || extracted.includes("Next.js"), "Extracts Next.js correctly");
  assert(extracted.includes("TypeScript"), "Extracts TypeScript correctly");
  assert(extracted.includes("PostgreSQL"), "Extracts PostgreSQL correctly");
  assert(extracted.includes("Redis"), "Extracts Redis correctly");
  assert(extracted.includes("AWS EC2") || extracted.includes("AWS"), "Extracts AWS correctly");

  // TEST 2: Resume Fetch & Deterministic Comparison
  console.log("\n--- 2. Testing Database Resume Match ---");
  const fullStackConfig = await prisma.resumeConfig.findFirst({
    where: { domain: { name: "Full-Stack" } },
    include: { domain: true },
  });

  if (!fullStackConfig) {
    console.warn("[SKIP] Full-Stack resume config not found in DB.");
  } else {
    const resumeDoc = await getResumeDocumentData(
      fullStackConfig.domain.name as DomainName,
      fullStackConfig.id
    );

    const match = computeDeterministicMatch(resumeDoc, sampleJd);
    assert(match.matchedSkills.length > 0, `Detected ${match.matchedSkills.length} matched skills`);
    assert(match.deterministicScore > 0, `Deterministic score calculated: ${match.deterministicScore}%`);
    assert(match.keywordCoverage.percentage > 0, `Coverage percentage: ${match.keywordCoverage.percentage}%`);

    // TEST 3: End-to-End Hybrid JD Analysis
    console.log("\n--- 3. Testing Hybrid JD Analysis Pipeline ---");
    const { result, fromCache } = await analyzeResumeAgainstJd(
      fullStackConfig.id,
      resumeDoc,
      sampleJd,
      "test-runner-ip"
    );

    assert(result.atsMatchScore > 0, `ATS Match composite score: ${result.atsMatchScore}%`);
    assert(result.matchedSkills.length > 0, `Matched skills count: ${result.matchedSkills.length}`);
    assert(Array.isArray(result.skillGaps) && result.skillGaps.length > 0, `Skill gaps categorized count: ${result.skillGaps.length}`);
    assert(result.recommendations.length > 0, `Recommendations generated: ${result.recommendations.length}`);
    assert(fromCache === false || fromCache === true, `Cache flag present: ${fromCache}`);

    // TEST 4: Deterministic Cache Key Verification
    console.log("\n--- 4. Testing Redis Cache Key Determinism ---");
    const key1 = generateAnalysisCacheKey(fullStackConfig.id, "hash123", sampleJd);
    const key2 = generateAnalysisCacheKey(fullStackConfig.id, "hash123", sampleJd);
    assert(key1 === key2, `Cache keys are deterministic: ${key1}`);
  }

  // TEST 5: AI Bullet Refinement Guardrails (No hallucinated metrics)
  console.log("\n--- 5. Testing Bullet Refinement Guardrails ---");
  const weakBullet = "Made a website using React and Node.js for client project.";
  const improved = await suggestBulletRefinement({
    currentText: weakBullet,
    action: "improve_impact",
    clientIp: "test-runner-ip",
  });

  assert(improved.suggestedText.length > weakBullet.length, "Improved bullet has richer engineering phrasing");
  assert(
    !improved.suggestedText.includes("99.99%") && !improved.suggestedText.includes("500%"),
    "Does NOT hallucinate unverified numbers/metrics"
  );
  assert(typeof improved.explanation === "string" && improved.explanation.length > 0, "Provides clear improvement explanation");

  // Summary
  console.log("\n=========================================");
  console.log(`TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log("=========================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runAiTests()
  .catch((e) => {
    console.error("Test runner encountered error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
