import { NextRequest, NextResponse } from "next/server";
import { slugToDomain } from "@/lib/constants/domains";
import { getResumeDocumentData } from "@/features/preview/server/queries";
import { generateAtsResumeDocx } from "@/features/preview/server/docxGenerator";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    domain: string;
  };
};

export async function GET(
  _request: NextRequest,
  { params }: RouteContext,
): Promise<NextResponse> {
  try {
    const domainName = slugToDomain(params.domain);
    if (!domainName) {
      return new NextResponse("Invalid domain specified", { status: 400 });
    }

    const documentData = await getResumeDocumentData(domainName);
    const docxBuffer = await generateAtsResumeDocx(documentData);

    const filename = `${params.domain}_resume.docx`;

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
    console.error("Error generating .docx export:", error);
    return new NextResponse("Internal Server Error while generating DOCX", {
      status: 500,
    });
  }
}
