import { getAnalyticsClient } from "@/lib/analytics/db";
import { ensureContentSchema } from "@/lib/content/db";

export const CONTENT_IMAGE_MAX_BYTES = 4 * 1024 * 1024;
export const CONTENT_IMAGE_ID_RE = /^[a-z0-9-]{8,80}$/i;

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export type StoredContentImage = {
  id: string;
  filename: string;
  mime: string;
  bytes: Uint8Array;
};

function sniffMime(bytes: Uint8Array): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 6 &&
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38
  ) {
    return "image/gif";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

function sanitizeFilename(name: string, mime: string): string {
  const base = name.replace(/\\/g, "/").split("/").pop() || "image";
  const cleaned = base.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  const ext =
    Object.entries(MIME_BY_EXT).find(([, value]) => value === mime)?.[0] || "img";
  const stem = cleaned.replace(/\.[^.]+$/, "").slice(0, 60) || "image";
  return `${stem}.${ext}`;
}

export function contentImagePath(id: string): string {
  return `/content-images/${id}`;
}

export function contentImagePublicUrl(id: string, request?: Request): string {
  const path = contentImagePath(id);
  if (!request) return path;
  try {
    return new URL(path, request.url).toString();
  } catch {
    return path;
  }
}

export async function saveContentImage(input: {
  filename: string;
  bytes: Uint8Array;
}): Promise<{ id: string; url: string; filename: string; mime: string }> {
  await ensureContentSchema();
  const mime = sniffMime(input.bytes);
  if (!mime) {
    throw new Error("UNSUPPORTED_IMAGE");
  }
  if (input.bytes.byteLength > CONTENT_IMAGE_MAX_BYTES) {
    throw new Error("IMAGE_TOO_LARGE");
  }

  const id = crypto.randomUUID();
  const filename = sanitizeFilename(input.filename, mime);
  const client = getAnalyticsClient();
  await client.execute({
    sql: `INSERT INTO content_images (id, filename, mime, bytes, created_at)
VALUES (?, ?, ?, ?, ?)`,
    args: [id, filename, mime, input.bytes, Date.now()],
  });

  return { id, url: contentImagePath(id), filename, mime };
}

function bytesFromDriver(value: unknown): Uint8Array | null {
  if (!value) return null;
  if (value instanceof Uint8Array) return value;
  if (Buffer.isBuffer(value)) return new Uint8Array(value);
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (Array.isArray(value)) return Uint8Array.from(value);
  return null;
}

export async function getContentImage(id: string): Promise<StoredContentImage | null> {
  if (!CONTENT_IMAGE_ID_RE.test(id)) return null;
  await ensureContentSchema();
  const result = await getAnalyticsClient().execute({
    sql: `SELECT id, filename, mime, bytes FROM content_images WHERE id = ? LIMIT 1`,
    args: [id],
  });
  const row = result.rows[0];
  if (!row) return null;
  const bytes = bytesFromDriver(row.bytes);
  if (!bytes) return null;
  return {
    id: String(row.id),
    filename: String(row.filename || "image"),
    mime: String(row.mime || "application/octet-stream"),
    bytes,
  };
}
