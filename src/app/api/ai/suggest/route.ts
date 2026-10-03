import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { bulletSuggestionRequestSchema } from "@/lib/validations/ai";
import { suggestBulletRefinement } from "@/lib/ai/service";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    // 1. Resolve client IP for rate limiting
    const headersList = headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const clientIp = (forwardedFor ? forwardedFor.split(",")[0]?.trim() : realIp) || "127.0.0.1";

    // 2. Validate input schema
    const rawBody = await request.json().catch(() => null);
    const parsed = bulletSuggestionRequestSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? "Invalid bullet suggestion payload.",
        },
        { status: 400 }
      );
    }

    const { resumeConfigId, currentText, action, jobContext, techContext } = parsed.data;

    // 3. Confirm resumeConfig exists
    const exists = await prisma.resumeConfig.count({
      where: { id: resumeConfigId },
    });

    if (exists === 0) {
      return NextResponse.json(
        { success: false, error: "Resume configuration not found." },
        { status: 404 }
      );
    }

    // 4. Run AI bullet refinement
    const suggestion = await suggestBulletRefinement({
      currentText,
      action,
      jobContext,
      techContext,
      clientIp,
    });

    return NextResponse.json({
      success: true,
      data: suggestion,
    });
  } catch (error: unknown) {
    console.error("[API: /api/ai/suggest] Error:", error);
    const message = error instanceof Error ? error.message : "Internal AI suggestion error.";
    const status = message.includes("Rate limit") ? 429 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
