import { NextResponse } from "next/server";
import crypto from "crypto";
import { uploadDrawing } from "@/lib/r2";

export async function POST(request: Request) {
  const { image } = (await request.json()) as { image: string };

  const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  const id = crypto.randomUUID();

  await uploadDrawing(id, buffer);

  return NextResponse.json({ id });
}
