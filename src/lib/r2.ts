import { S3mini } from "s3mini";

const s3 = new S3mini({
  accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET_NAME}`,
  region: "auto",
});

export type DrawingItem = {
  id: string;
  lastModified: Date;
};

export async function uploadDrawing(id: string, buffer: Buffer): Promise<void> {
  await s3.putObject(`drawings/${id}.png`, buffer, "image/png");
}

export async function getDrawing(id: string): Promise<Uint8Array | null> {
  try {
    const result = await s3.getObjectArrayBuffer(`drawings/${id}.png`);
    if (result === null) return null;
    return new Uint8Array(result);
  } catch {
    return null;
  }
}

export async function drawingExists(id: string): Promise<boolean> {
  try {
    await s3.getObject(`drawings/${id}.png`);
    return true;
  } catch {
    return false;
  }
}

export async function listDrawings(): Promise<DrawingItem[]> {
  const result = await s3.listObjects("/", "drawings/", 100);

  if (!result) return [];

  return result
    .filter((obj) => (obj as any).Key.endsWith(".png"))
    .map((obj) => ({
      id: (obj as any).Key.replace("drawings/", "").replace(".png", ""),
      lastModified: new Date((obj as any).LastModified),
    }))
    .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
}
