import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  serializeAllPortfolioProjects,
  serializeResumeProjectsToMarkdown,
} from "@/lib/markdownSerializer";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const download = searchParams.get("download") === "true";

    // Fetch all portfolio projects
    const projects = await prisma.project.findMany({
      include: {
        bullets: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const markdown = serializeAllPortfolioProjects(projects);
    const filename = `portfolio_export_for_claude.md`;

    const headers: Record<string, string> = {
      "Content-Type": "text/markdown; charset=utf-8",
    };

    if (download) {
      headers["Content-Disposition"] = `attachment; filename="${filename}"`;
    }

    return new NextResponse(markdown, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error generating markdown export:", error);
    return new NextResponse("Internal Server Error while generating Markdown", {
      status: 500,
    });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return new NextResponse("Invalid JSON body", { status: 400 });
    }

    const { domainName, projects, download = false } = body;

    if (!projects || !Array.isArray(projects) || projects.length > 50) {
      return new NextResponse("Invalid projects array in request body (must be array <= 50)", {
        status: 400,
      });
    }

    const markdown = serializeResumeProjectsToMarkdown(
      domainName || "Resume",
      projects
    );
    const filename = `${(domainName || "resume")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}_claude_export.md`;

    const headers: Record<string, string> = {
      "Content-Type": "text/markdown; charset=utf-8",
    };

    if (download) {
      headers["Content-Disposition"] = `attachment; filename="${filename}"`;
    }

    return new NextResponse(markdown, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error in POST markdown export:", error);
    return new NextResponse("Internal Server Error while generating Markdown", {
      status: 500,
    });
  }
}
