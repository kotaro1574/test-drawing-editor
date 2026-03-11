import { NextResponse } from "next/server";
import { uploadDrawing } from "@/lib/r2";

export const runtime = "edge";

export async function POST(request: Request) {
  const { image } = (await request.json()) as { image: string };

  const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  const id = globalThis.crypto.randomUUID();

  await uploadDrawing(id, buffer);

  return NextResponse.json({ id });
}
