import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";

const authPayloadSchema = z.object({
  passcode: z.string().trim().min(1, "Passcode is required").max(100, "Passcode too long"),
});

export async function POST(request: Request) {
  try {
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
      { success: false, error: "Invalid passcode" },
      { status: 401 },
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Bad request payload" },
      { status: 400 },
    );
  }
}
