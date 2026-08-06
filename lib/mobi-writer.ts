const RECORD_SIZE = 4096;
const MOBI_HEADER_LENGTH = 0xe8;
const NULL = 0xffffffff;

const FLIS = Uint8Array.from([
  0x46, 0x4c, 0x49, 0x53, 0x00, 0x00, 0x00, 0x08, 0x00, 0x41, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff, 0x00, 0x01, 0x00, 0x03,
  0x00, 0x00, 0x00, 0x03, 0x00, 0x00, 0x00, 0x01, 0xff, 0xff, 0xff, 0xff,
]);

const EOF_RECORD = Uint8Array.from([0xe9, 0x8e, 0x0d, 0x0a]);

export type MobiImage = {
  data: Uint8Array;
};

export type BuildMobiOptions = {
  title: string;
  author?: string;
  html: string;
  images?: MobiImage[];
  language?: string;
};

function encodeUtf8(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function concatBytes(chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

function writeUint16(view: DataView, offset: number, value: number) {
  view.setUint16(offset, value >>> 0, false);
}

function writeUint32(view: DataView, offset: number, value: number) {
  view.setUint32(offset, value >>> 0, false);
}

function packUint16(value: number): Uint8Array {
  const out = new Uint8Array(2);
  writeUint16(new DataView(out.buffer), 0, value);
  return out;
}

function packUint32(value: number): Uint8Array {
  const out = new Uint8Array(4);
  writeUint32(new DataView(out.buffer), 0, value);
  return out;
}

function alignBlock(raw: Uint8Array, multiple = 4): Uint8Array {
  const rem = raw.length % multiple;
  if (rem === 0) return raw;
  const out = new Uint8Array(raw.length + (multiple - rem));
  out.set(raw);
  return out;
}

function asciiDbName(title: string): Uint8Array {
  const cleaned = title
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]+/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 31);
  const name = cleaned || "Converted_PDF";
  const out = new Uint8Array(32);
  out.set(encodeUtf8(name));
  return out;
}

function splitTextRecords(text: Uint8Array): Uint8Array[] {
  if (!text.length) {
    return [new Uint8Array(0)];
  }

  const records: Uint8Array[] = [];
  let offset = 0;

  while (offset < text.length) {
    let end = Math.min(offset + RECORD_SIZE, text.length);
    if (end < text.length) {
      while (end > offset && (text[end]! & 0xc0) === 0x80) {
        end -= 1;
      }
      if (end === offset) {
        end = Math.min(offset + RECORD_SIZE, text.length);
      }
    }
    records.push(text.subarray(offset, end));
    offset = end;
  }

  return records;
}

function buildExth(title: string, author: string): Uint8Array {
  type ExthEntry = { type: number; data: Uint8Array };
  const entries: ExthEntry[] = [
    { type: 100, data: encodeUtf8(author) },
    { type: 101, data: encodeUtf8("Focera") },
    { type: 103, data: encodeUtf8(title) },
    { type: 108, data: encodeUtf8("Focera PDF to MOBI") },
    { type: 112, data: encodeUtf8("pdf-to-mobi") },
    { type: 204, data: packUint32(201) },
    { type: 205, data: packUint32(1) },
    { type: 206, data: packUint32(2) },
    { type: 207, data: packUint32(33307) },
  ];

  const parts: Uint8Array[] = [];
  for (const entry of entries) {
    const length = 8 + entry.data.length;
    const header = new Uint8Array(8);
    const view = new DataView(header.buffer);
    writeUint32(view, 0, entry.type);
    writeUint32(view, 4, length);
    parts.push(header, entry.data);
  }

  const body = concatBytes(parts);
  const headerLength = 12 + body.length;
  const header = new Uint8Array(12);
  const view = new DataView(header.buffer);
  header.set(encodeUtf8("EXTH"), 0);
  writeUint32(view, 4, headerLength);
  writeUint32(view, 8, entries.length);

  return alignBlock(concatBytes([header, body]));
}

function buildFcis(textLength: number): Uint8Array {
  const out = new Uint8Array(44);
  const view = new DataView(out.buffer);
  out.set(encodeUtf8("FCIS"), 0);
  writeUint32(view, 4, 20);
  writeUint32(view, 8, 16);
  writeUint32(view, 12, 1);
  writeUint32(view, 16, 0);
  writeUint32(view, 20, textLength);
  writeUint32(view, 24, 0);
  writeUint32(view, 28, 32);
  writeUint32(view, 32, 8);
  writeUint16(view, 36, 1);
  writeUint16(view, 38, 1);
  writeUint32(view, 40, 0);
  return out;
}

function buildRecord0(options: {
  titleBytes: Uint8Array;
  textLength: number;
  lastTextRecordIdx: number;
  firstNonTextRecordIdx: number;
  firstImageRecord: number;
  lastContentRecord: number;
  flisNumber: number;
  fcisNumber: number;
  exth: Uint8Array;
}): Uint8Array {
  const palm = new Uint8Array(16);
  const palmView = new DataView(palm.buffer);
  writeUint16(palmView, 0, 1); // no compression
  writeUint16(palmView, 2, 0);
  writeUint32(palmView, 4, options.textLength);
  writeUint16(palmView, 8, options.lastTextRecordIdx);
  writeUint16(palmView, 10, RECORD_SIZE);
  writeUint16(palmView, 12, 0); // encryption
  writeUint16(palmView, 14, 0);

  const mobi = new Uint8Array(MOBI_HEADER_LENGTH);
  const mobiView = new DataView(mobi.buffer);
  mobi.set(encodeUtf8("MOBI"), 0);
  writeUint32(mobiView, 4, MOBI_HEADER_LENGTH);
  writeUint32(mobiView, 8, 2); // Mobipocket book
  writeUint32(mobiView, 12, 65001); // UTF-8
  writeUint32(mobiView, 16, (Date.now() ^ 0x9e3779b9) >>> 0);
  writeUint32(mobiView, 20, 6); // file version

  for (let offset = 24; offset < 64; offset += 4) {
    writeUint32(mobiView, offset, NULL);
  }

  writeUint32(mobiView, 64, options.firstNonTextRecordIdx);

  const fullNameOffset = 16 + MOBI_HEADER_LENGTH + options.exth.length;
  writeUint32(mobiView, 68, fullNameOffset);
  writeUint32(mobiView, 72, options.titleBytes.length);
  writeUint32(mobiView, 76, 0x0409); // en-US
  writeUint32(mobiView, 80, 0);
  writeUint32(mobiView, 84, 0);
  writeUint32(mobiView, 88, 6); // min version
  writeUint32(mobiView, 92, options.firstImageRecord);
  writeUint32(mobiView, 96, 0);
  writeUint32(mobiView, 100, 0);
  writeUint32(mobiView, 104, 0);
  writeUint32(mobiView, 108, 0);
  writeUint32(mobiView, 112, 0x40); // EXTH present

  writeUint32(mobiView, 148, NULL); // DRM offset
  writeUint32(mobiView, 152, NULL); // DRM count
  writeUint32(mobiView, 156, 0);
  writeUint32(mobiView, 160, 0);

  writeUint16(mobiView, 176, 1); // first content record
  writeUint16(mobiView, 178, options.lastContentRecord);
  writeUint32(mobiView, 180, 1);
  writeUint32(mobiView, 184, options.fcisNumber);
  writeUint32(mobiView, 188, 1);
  writeUint32(mobiView, 192, options.flisNumber);
  writeUint32(mobiView, 196, 1);

  writeUint32(mobiView, 208, NULL);
  writeUint32(mobiView, 212, 0);
  writeUint32(mobiView, 216, NULL);
  writeUint32(mobiView, 220, NULL);
  writeUint32(mobiView, 224, 0); // no trailing extras
  writeUint32(mobiView, 228, NULL); // no INDX

  return alignBlock(
    concatBytes([palm, mobi, options.exth, options.titleBytes, new Uint8Array(16)]),
  );
}

function buildPalmDb(records: Uint8Array[], title: string): Blob {
  const nrecords = records.length;
  const headerSize = 78;
  const recordListSize = 8 * nrecords;
  const gapToData = 2;
  let offset = headerSize + recordListSize + gapToData;

  const recordOffsets: number[] = [];
  for (const record of records) {
    recordOffsets.push(offset);
    offset += record.length;
  }

  const header = new Uint8Array(headerSize + recordListSize + gapToData);
  const view = new DataView(header.buffer);
  header.set(asciiDbName(title), 0);

  const now = Math.floor(Date.now() / 1000);
  writeUint16(view, 32, 0); // attributes
  writeUint16(view, 34, 0); // version
  writeUint32(view, 36, now);
  writeUint32(view, 40, now);
  writeUint32(view, 44, 0); // backup
  writeUint32(view, 48, 0); // modnum
  writeUint32(view, 52, 0); // appInfo
  writeUint32(view, 56, 0); // sortInfo
  header.set(encodeUtf8("BOOK"), 60);
  header.set(encodeUtf8("MOBI"), 64);
  writeUint32(view, 68, (2 * nrecords - 1) >>> 0);
  writeUint32(view, 72, 0);
  writeUint16(view, 76, nrecords);

  for (let i = 0; i < nrecords; i += 1) {
    const entryOffset = 78 + i * 8;
    writeUint32(view, entryOffset, recordOffsets[i]!);
    header[entryOffset + 4] = 0;
    const uniqueId = (2 * i) >>> 0;
    header[entryOffset + 5] = (uniqueId >>> 16) & 0xff;
    header[entryOffset + 6] = (uniqueId >>> 8) & 0xff;
    header[entryOffset + 7] = uniqueId & 0xff;
  }

  return new Blob([header, ...records] as BlobPart[], {
    type: "application/x-mobipocket-ebook",
  });
}

/**
 * Build a classic Mobipocket (MOBI6) ebook from HTML and optional image records.
 * Compatible with Calibre, Kindle apps, and many e-readers that accept .mobi.
 */
export function buildMobiBlob(options: BuildMobiOptions): Blob {
  const title = options.title.trim() || "Converted PDF";
  const author = options.author?.trim() || "Focera";
  const images = options.images ?? [];

  const htmlBytes = encodeUtf8(options.html);
  const textRecords = splitTextRecords(htmlBytes);
  const titleBytes = encodeUtf8(title);
  const exth = buildExth(title, author);

  const records: Uint8Array[] = [new Uint8Array(0)];
  records.push(...textRecords);

  const lastTextRecordIdx = textRecords.length;
  let firstNonTextRecordIdx = lastTextRecordIdx + 1;

  // Pad to 4-byte boundary before non-text records (Calibre convention).
  const textBytesTotal = textRecords.reduce((sum, r) => sum + r.length, 0);
  if (textBytesTotal % 4 !== 0) {
    records.push(new Uint8Array(4 - (textBytesTotal % 4)));
    firstNonTextRecordIdx += 1;
  }

  const firstImageRecord =
    images.length > 0 ? records.length : firstNonTextRecordIdx + 2; // after FLIS/FCIS if none

  for (const image of images) {
    records.push(image.data);
  }

  const lastContentRecord = records.length - 1;
  const flisNumber = records.length;
  records.push(FLIS);
  const fcisNumber = records.length;
  records.push(buildFcis(htmlBytes.length));
  records.push(EOF_RECORD);

  records[0] = buildRecord0({
    titleBytes,
    textLength: htmlBytes.length,
    lastTextRecordIdx,
    firstNonTextRecordIdx,
    firstImageRecord: images.length > 0 ? firstImageRecord : records.length,
    lastContentRecord: images.length > 0 ? lastContentRecord : lastTextRecordIdx,
    flisNumber,
    fcisNumber,
    exth,
  });

  return buildPalmDb(records, title);
}

export function formatMobiRecindex(index: number): string {
  return String(index).padStart(5, "0");
}
