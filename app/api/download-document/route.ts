import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  const bidNumber = searchParams.get("bidNumber");

  if (!id) {
    return NextResponse.json(
      { error: "Document ID is required" },
      { status: 400 }
    );
  }

  try {
    const documentUrl = `https://bidplus.gem.gov.in/showbidDocument/${id}`;

    const response = await fetch(documentUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to download document" },
        { status: response.status }
      );
    }

    // Get the document as buffer
    const buffer = await response.arrayBuffer();

    // Get content type and set appropriate filename
    const contentType =
      response.headers.get("content-type") || "application/pdf";
    const extension = contentType.includes("pdf") ? "pdf" : "doc";
    const filename = `${bidNumber || id}.${extension}`;

    // Return the document with appropriate headers
    return new NextResponse(buffer, {
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": contentType,
      },
    });
  } catch (error: any) {
    console.error("Error downloading document:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
