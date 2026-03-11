import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

let _r2Client: S3Client | null = null;

function r2Client(): S3Client {
  if (!_r2Client) {
    _r2Client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
      },
    });
  }
  return _r2Client;
}

export async function uploadDrawing(
  id: string,
  buffer: Buffer
): Promise<void> {
  await r2Client().send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME ?? "",
      Key: `drawings/${id}.png`,
      Body: buffer,
      ContentType: "image/png",
    })
  );
}

export async function getDrawing(id: string): Promise<Buffer | null> {
  try {
    const result = await r2Client().send(
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME ?? "",
        Key: `drawings/${id}.png`,
      })
    );
    return result.Body
      ? Buffer.from(await result.Body.transformToByteArray())
      : null;
  } catch {
    return null;
  }
}

export async function drawingExists(id: string): Promise<boolean> {
  try {
    await r2Client().send(
      new HeadObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME ?? "",
        Key: `drawings/${id}.png`,
      })
    );
    return true;
  } catch {
    return false;
  }
}
