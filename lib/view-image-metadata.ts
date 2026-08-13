import exifr from "exifr";
import { downloadBlob, fileBaseName, formatFileSize } from "@/lib/image";

export type MetadataField = {
  key: string;
  label: string;
  value: string;
};

export type MetadataSection = {
  id: string;
  title: string;
  fields: MetadataField[];
};

export type GpsCoords = {
  latitude: number;
  longitude: number;
};

export type ImageMetadataResult = {
  fileName: string;
  fileSize: number;
  mimeType: string;
  width: number;
  height: number;
  megapixels: number;
  tagCount: number;
  gps: GpsCoords | null;
  sections: MetadataSection[];
  raw: Record<string, unknown>;
};

export type ImageMetadataOptions = {
  onProgress?: (message: string) => void;
  signal?: AbortSignal;
};

const SKIP_KEYS = new Set([
  "about",
  "makernote",
  "thumbnail",
  "thumbnailimage",
  "thumbnailoffset",
  "thumbnaillength",
  "parts",
]);

const LABEL_OVERRIDES: Record<string, string> = {
  Make: "Camera make",
  Model: "Camera model",
  LensMake: "Lens make",
  LensModel: "Lens model",
  Software: "Software",
  Artist: "Artist",
  Copyright: "Copyright",
  DateTimeOriginal: "Date taken",
  CreateDate: "Date created",
  DateTime: "File date",
  DateTimeDigitized: "Date digitized",
  OffsetTimeOriginal: "Time zone",
  ExposureTime: "Shutter speed",
  FNumber: "Aperture",
  ISO: "ISO",
  ISOSpeedRatings: "ISO",
  FocalLength: "Focal length",
  FocalLengthIn35mmFormat: "Focal length (35mm)",
  ExposureCompensation: "Exposure compensation",
  ExposureProgram: "Exposure program",
  ExposureMode: "Exposure mode",
  MeteringMode: "Metering",
  WhiteBalance: "White balance",
  Flash: "Flash",
  SceneCaptureType: "Scene type",
  LightSource: "Light source",
  Orientation: "Orientation",
  ColorSpace: "Color space",
  XResolution: "X resolution",
  YResolution: "Y resolution",
  ResolutionUnit: "Resolution unit",
  PixelXDimension: "Pixel width",
  PixelYDimension: "Pixel height",
  ExifImageWidth: "EXIF width",
  ExifImageHeight: "EXIF height",
  ImageWidth: "Image width",
  ImageHeight: "Image height",
  BitsPerSample: "Bits per sample",
  BitDepth: "Bit depth",
  ColorType: "Color type",
  Compression: "Compression",
  GPSAltitude: "Altitude",
  GPSSpeed: "Speed",
  GPSImgDirection: "Direction",
  GPSDateStamp: "GPS date",
  GPSProcessingMethod: "GPS method",
  latitude: "Latitude",
  longitude: "Longitude",
};

const IMAGE_KEYS = new Set([
  "imagewidth",
  "imageheight",
  "pixelxdimension",
  "pixelydimension",
  "exifimagewidth",
  "exifimageheight",
  "orientation",
  "colorspace",
  "bitspersample",
  "bitdepth",
  "colortype",
  "compression",
  "xresolution",
  "yresolution",
  "resolutionunit",
  "photometricinterpretation",
  "interlace",
  "filter",
  "jfifversion",
  "jfifunits",
  "jfifxdensity",
  "jfifydensity",
]);

const CAMERA_KEYS = new Set([
  "make",
  "model",
  "lensmake",
  "lensmodel",
  "lensinfo",
  "software",
  "artist",
  "copyright",
  "uniquecameramodel",
  "bodyserialnumber",
  "lensserialnumber",
  "ownername",
]);

const CAPTURE_KEYS = new Set([
  "datetimeoriginal",
  "createdate",
  "datetime",
  "datetimedigitized",
  "offsettimeoriginal",
  "exposuretime",
  "fnumber",
  "iso",
  "isospeedratings",
  "photographicsensitivity",
  "focallength",
  "focallengthin35mmformat",
  "flash",
  "whitebalance",
  "exposureprogram",
  "exposuremode",
  "meteringmode",
  "scenecapturetype",
  "exposurecompensation",
  "exposurebiasvalue",
  "shutterspeedvalue",
  "aperturevalue",
  "brightnessvalue",
  "lightsource",
  "contrast",
  "saturation",
  "sharpness",
  "digitalzoomratio",
  "subjectdistance",
  "maxaperturevalue",
]);

const GPS_KEYS = new Set([
  "latitude",
  "longitude",
  "gpslatitude",
  "gpslongitude",
  "gpslatituderef",
  "gpslongituderef",
  "gpsaltitude",
  "gpsaltituderef",
  "gpsimgdirection",
  "gpsimgdirectionref",
  "gpsdatestamp",
  "gpstimestamp",
  "gpsspeed",
  "gpsspeedref",
  "gpsdestbearing",
  "gpsprocessingmethod",
  "gpsmapdatum",
  "gpshpositioningerror",
]);

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Metadata read cancelled.", "AbortError");
  }
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read this image. Try another file."));
    };
    image.src = url;
  });
}

function isSkippedKey(key: string): boolean {
  return SKIP_KEYS.has(key.toLowerCase());
}

function isBinaryLike(value: unknown): boolean {
  return (
    value instanceof ArrayBuffer ||
    value instanceof Uint8Array ||
    (typeof Blob !== "undefined" && value instanceof Blob)
  );
}

function labelFromKey(key: string): string {
  if (LABEL_OVERRIDES[key]) return LABEL_OVERRIDES[key];
  const spaced = key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();
  if (!spaced) return key;
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function formatNumber(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return String(value);
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(digits).replace(/\.?0+$/, "");
}

function formatShutter(value: number): string {
  if (value <= 0) return String(value);
  if (value >= 1) return `${formatNumber(value)} s`;
  const denom = Math.round(1 / value);
  return `1/${denom} s`;
}

function formatValue(key: string, value: unknown): string | null {
  if (value == null) return null;
  if (isBinaryLike(value)) return null;

  const lower = key.toLowerCase();

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toLocaleString();
  }

  if (typeof value === "boolean") return value ? "Yes" : "No";

  if (typeof value === "number") {
    if (lower === "exposuretime") return formatShutter(value);
    if (lower === "fnumber" || lower === "aperturevalue") {
      return `f/${formatNumber(value)}`;
    }
    if (lower === "focallength" || lower === "focallengthin35mmformat") {
      return `${formatNumber(value)} mm`;
    }
    if (lower === "iso" || lower === "isospeedratings") {
      return String(Math.round(value));
    }
    if (lower.includes("latitude") || lower.includes("longitude")) {
      return formatNumber(value, 6);
    }
    if (lower === "gpsaltitude") return `${formatNumber(value)} m`;
    return formatNumber(value);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || null;
  }

  if (Array.isArray(value)) {
    if (value.every((item) => typeof item === "number")) {
      return value.map((item) => formatNumber(item)).join(", ");
    }
    if (value.every((item) => typeof item === "string")) {
      const joined = value.map((item) => item.trim()).filter(Boolean).join(", ");
      return joined || null;
    }
    return null;
  }

  if (typeof value === "object") {
    try {
      const json = JSON.stringify(value);
      if (!json || json === "{}" || json.length > 400) return null;
      return json;
    } catch {
      return null;
    }
  }

  return String(value);
}

function toRawRecord(parsed: unknown): Record<string, unknown> {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {};
  }
  return parsed as Record<string, unknown>;
}

function fieldsFromRecord(
  record: Record<string, unknown>,
  allow: Set<string> | null,
): MetadataField[] {
  const fields: MetadataField[] = [];
  const seen = new Set<string>();

  for (const [key, value] of Object.entries(record)) {
    if (isSkippedKey(key)) continue;
    const bucket = key.toLowerCase();
    if (allow && !allow.has(bucket)) continue;
    if (seen.has(bucket)) continue;
    const formatted = formatValue(key, value);
    if (!formatted) continue;
    seen.add(bucket);
    fields.push({ key, label: labelFromKey(key), value: formatted });
  }

  return fields;
}

function usedKeys(sections: MetadataSection[]): Set<string> {
  const keys = new Set<string>();
  for (const section of sections) {
    for (const field of section.fields) {
      keys.add(field.key.toLowerCase());
    }
  }
  return keys;
}

export function describeMetadata(result: ImageMetadataResult): string {
  const size = `${result.width}×${result.height}`;
  const tags =
    result.tagCount === 1 ? "1 field" : `${result.tagCount} fields`;
  return result.gps ? `${tags} · ${size} · GPS` : `${tags} · ${size}`;
}

function toJsonSafe(value: unknown): unknown {
  if (value == null) return value;
  if (value instanceof Date) return value.toISOString();
  if (isBinaryLike(value)) return undefined;
  if (Array.isArray(value)) {
    return value.map((item) => toJsonSafe(item)).filter((item) => item !== undefined);
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (isSkippedKey(key)) continue;
      const next = toJsonSafe(nested);
      if (next !== undefined) out[key] = next;
    }
    return out;
  }
  return value;
}

export function metadataToJson(result: ImageMetadataResult): string {
  return JSON.stringify(
    {
      file: {
        name: result.fileName,
        size: result.fileSize,
        type: result.mimeType,
        width: result.width,
        height: result.height,
        megapixels: result.megapixels,
      },
      gps: result.gps,
      tags: toJsonSafe(result.raw),
    },
    null,
    2,
  );
}

export function downloadMetadataJson(
  result: ImageMetadataResult,
  sourceFile: File,
) {
  const blob = new Blob([metadataToJson(result)], {
    type: "application/json;charset=utf-8",
  });
  downloadBlob(blob, `${fileBaseName(sourceFile)}-metadata.json`);
}

export function gpsMapUrl(gps: GpsCoords): string {
  const lat = gps.latitude.toFixed(6);
  const lon = gps.longitude.toFixed(6);
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`;
}

export async function readImageMetadata(
  file: File,
  options: ImageMetadataOptions = {},
): Promise<ImageMetadataResult> {
  const { onProgress, signal } = options;

  throwIfAborted(signal);
  onProgress?.("Loading image…");
  const image = await loadImage(file);
  throwIfAborted(signal);

  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  if (!width || !height) {
    throw new Error("Could not determine image dimensions.");
  }

  onProgress?.("Reading EXIF and tags…");
  let parsed: unknown;
  let gps: GpsCoords | null = null;

  try {
    parsed = await exifr.parse(file, {
      tiff: true,
      ifd1: false,
      exif: true,
      gps: true,
      interop: false,
      makerNote: false,
      userComment: true,
      xmp: true,
      icc: false,
      iptc: true,
      jfif: true,
      ihdr: true,
      sanitize: true,
      mergeOutput: true,
      translateKeys: true,
      translateValues: true,
      reviveValues: true,
    });
  } catch {
    parsed = undefined;
  }

  throwIfAborted(signal);

  try {
    const coords = await exifr.gps(file);
    if (
      coords &&
      Number.isFinite(coords.latitude) &&
      Number.isFinite(coords.longitude)
    ) {
      gps = { latitude: coords.latitude, longitude: coords.longitude };
    }
  } catch {
    gps = null;
  }

  throwIfAborted(signal);

  const raw = toRawRecord(parsed);
  if (gps) {
    raw.latitude = gps.latitude;
    raw.longitude = gps.longitude;
  }

  const lastModified = file.lastModified
    ? new Date(file.lastModified).toLocaleString()
    : "";

  const fileFields: MetadataField[] = [
    { key: "fileName", label: "File name", value: file.name },
    { key: "fileSize", label: "File size", value: formatFileSize(file.size) },
    { key: "mimeType", label: "Type", value: file.type || "Unknown" },
  ];
  if (lastModified) {
    fileFields.push({
      key: "lastModified",
      label: "Last modified",
      value: lastModified,
    });
  }

  const imageFields: MetadataField[] = [
    { key: "width", label: "Width", value: `${width} px` },
    { key: "height", label: "Height", value: `${height} px` },
    {
      key: "megapixels",
      label: "Megapixels",
      value: `${((width * height) / 1_000_000).toFixed(2)} MP`,
    },
    ...fieldsFromRecord(raw, IMAGE_KEYS),
  ];

  const cameraFields = fieldsFromRecord(raw, CAMERA_KEYS);
  const captureFields = fieldsFromRecord(raw, CAPTURE_KEYS);
  const gpsFields = fieldsFromRecord(raw, GPS_KEYS);

  const sections: MetadataSection[] = [
    { id: "file", title: "File", fields: fileFields },
    { id: "image", title: "Image", fields: imageFields },
  ];
  if (cameraFields.length) {
    sections.push({ id: "camera", title: "Camera", fields: cameraFields });
  }
  if (captureFields.length) {
    sections.push({ id: "capture", title: "Capture", fields: captureFields });
  }
  if (gpsFields.length) {
    sections.push({ id: "gps", title: "Location", fields: gpsFields });
  }

  const claimed = usedKeys(sections);
  const moreFields = fieldsFromRecord(raw, null).filter(
    (field) => !claimed.has(field.key.toLowerCase()),
  );
  if (moreFields.length) {
    sections.push({ id: "more", title: "More tags", fields: moreFields });
  }

  const tagCount = sections.reduce(
    (sum, section) => sum + section.fields.length,
    0,
  );

  return {
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    width,
    height,
    megapixels: Number(((width * height) / 1_000_000).toFixed(2)),
    tagCount,
    gps,
    sections,
    raw,
  };
}
