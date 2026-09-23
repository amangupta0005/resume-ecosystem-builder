import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { z } from "zod";
import { checkRateLimit, invalidateCache } from "@/lib/redis";

const authPayloadSchema = z.object({
  passcode: z.string().trim().min(1, "Passcode is required").max(100, "Passcode too long"),
});

export async function POST(request: Request) {
  try {
    // Determine client IP for brute force rate limiting
    const headersList = headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const clientIp = (forwardedFor ? forwardedFor.split(",")[0]?.trim() : realIp) || "127.0.0.1";

    // Rate limit: 5 attempts per 10 minutes per IP
    const rateLimitKey = `ratelimit:auth:${clientIp}`;
    const rateLimit = await checkRateLimit(rateLimitKey, 5, 600);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many login attempts. Please wait ${Math.ceil(rateLimit.resetSeconds / 60)} minutes before trying again.`,
        },
        { status: 429 },
      );
    }

    const rawBody = await request.json();
    const parsed = authPayloadSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid passcode format" },
        { status: 400 },
      );
    }

    if (!process.env.APP_PASSCODE) {
      return NextResponse.json({ success: true });
    }

    if (parsed.data.passcode === process.env.APP_PASSCODE) {
      // Clear rate limit on successful authentication
      await invalidateCache(rateLimitKey);

      cookies().set("auth_session", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      {
        success: false,
        error: `Invalid passcode. (${rateLimit.remaining} attempts remaining)`,
      },
      { status: 401 },
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Bad request payload" },
      { status: 400 },
    );
  }
}
