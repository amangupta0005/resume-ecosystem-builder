import { NextRequest, NextResponse } from "next/server";
import { generateAtsResumeDocx } from "@/features/preview/server/docxGenerator";
import type { ResumeDocumentData } from "@/features/preview/server/queries";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const documentData: ResumeDocumentData = await request.json();

    if (!documentData || !documentData.domainName || !documentData.profile) {
      return new NextResponse("Invalid resume data payload", { status: 400 });
    }

    const docxBuffer = await generateAtsResumeDocx(documentData);
    const filename = `${documentData.domainSlug || "custom"}_resume.docx`;

    return new NextResponse(new Uint8Array(docxBuffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": docxBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating customized .docx export:", error);
    return new NextResponse("Internal Server Error while generating DOCX", {
      status: 500,
    });
  }
}
