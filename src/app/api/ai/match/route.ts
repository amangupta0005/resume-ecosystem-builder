import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { analyzeJdRequestSchema } from "@/lib/validations/ai";
import { getResumeDocumentData } from "@/features/preview/server/queries";
import { analyzeResumeAgainstJd } from "@/lib/ai/service";
import { prisma } from "@/lib/db";
import type { DomainName } from "@/lib/constants/domains";

export async function POST(request: Request) {
  try {
    // 1. Resolve client IP for rate limiting
    const headersList = headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const clientIp = (forwardedFor ? forwardedFor.split(",")[0]?.trim() : realIp) || "127.0.0.1";

    // 2. Validate input schema
    const rawBody = await request.json().catch(() => null);
    const parsed = analyzeJdRequestSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? "Invalid JD analysis payload.",
        },
        { status: 400 }
      );
    }

    const { resumeConfigId, jobDescription } = parsed.data;

    // 3. Verify resumeConfig exists and fetch full resume document
    const resumeConfig = await prisma.resumeConfig.findUnique({
      where: { id: resumeConfigId },
      include: { domain: true },
    });

    if (!resumeConfig) {
      return NextResponse.json(
        { success: false, error: "Resume configuration not found." },
        { status: 404 }
      );
    }

    const resumeDoc = await getResumeDocumentData(
      resumeConfig.domain.name as DomainName,
      resumeConfig.id
    );

    // 4. Run hybrid deterministic + semantic JD match
    const { result, fromCache } = await analyzeResumeAgainstJd(
      resumeConfig.id,
      resumeDoc,
      jobDescription,
      clientIp
    );

    return NextResponse.json({
      success: true,
      data: result,
      fromCache,
    });
  } catch (error: unknown) {
    console.error("[API: /api/ai/match] Error:", error);
    const message = error instanceof Error ? error.message : "Internal AI analysis error.";
    const status = message.includes("Rate limit") ? 429 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
