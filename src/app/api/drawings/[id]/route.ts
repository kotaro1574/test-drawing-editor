import { NextResponse } from "next/server";
import { deleteDrawing, getDrawing } from "@/lib/r2";

export const runtime = "edge";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;

  if (!/^[\w-]+$/.test(id)) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  const data = await getDrawing(id);

  if (!data) {
    return new NextResponse("Not Found", { status: 404 });
  }

  return new NextResponse(data as any, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;

  if (!/^[\w-]+$/.test(id)) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  const success = await deleteDrawing(id);

  if (!success) {
    return new NextResponse("Not Found", { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
