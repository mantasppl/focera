/**
 * Minimal KF8 / AZW3 writer (PalmDB + MOBI v8).
 * Structure follows the approach used by leotaku/mobi (MIT).
 */

const RECORD_SIZE = 4096;
const NULL = 0xffffffff;
const PALMDOC_HEADER_LENGTH = 16;
const KF8_HEADER_LENGTH = 264; // 0xE8 + 32
const INDX_HEADER_LENGTH = 192;
const TAGX_HEADER_LENGTH = 12;
const IDXT_HEADER_LENGTH = 4;
const NULL_PADDING_LENGTH = 0x2000;

// KF8 NCX: position, length, label offset, depth, pos_fid (fid + off), end
const TAGX_TABLE_NCX: number[] = [
  0x01010100, 0x02010200, 0x03010400, 0x04010800, 0x06028000, 0x00000001,
];
const TAGX_TABLE_SKELETON: number[] = [0x01010300, 0x06020c00, 0x00000001];
const TAGX_TABLE_CHUNK: number[] = [
  0x02010100, 0x03010200, 0x04010400, 0x06020800, 0x00000001,
];

const FLIS = Uint8Array.from([
  0x46, 0x4c, 0x49, 0x53, 0x00, 0x00, 0x00, 0x08, 0x00, 0x41, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff, 0x00, 0x01, 0x00, 0x03,
  0x00, 0x00, 0x00, 0x03, 0x00, 0x00, 0x00, 0x01, 0xff, 0xff, 0xff, 0xff,
]);

const EOF_RECORD = Uint8Array.from([0xe9, 0x8e, 0x0d, 0x0a]);

export type Azw3Image = { data: Uint8Array };

export type Azw3Chapter = {
  title: string;
  bodyHtml: string;
};

export type BuildAzw3Options = {
  title: string;
  author?: string;
  chapters: Azw3Chapter[];
  images?: Azw3Image[];
};

type ChunkInfo = {
  preStart: number;
  preLength: number;
  /** Absolute rawflow offset where fragment HTML is inserted into the skeleton. */
  insertOffset: number;
  contentStart: number;
  contentLength: number;
};

type ChapterInfo = {
  title: string;
  start: number;
  length: number;
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

function alignPad(length: number, multiple = 4): number {
  const rem = length % multiple;
  return rem === 0 ? 0 : multiple - rem;
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

/** Kindle content id: uppercase base-32, zero-padded to 4 chars. */
export function formatAzw3EmbedId(index: number): string {
  return index.toString(32).toUpperCase().padStart(4, "0");
}

function encodeVwi(x: number): Uint8Array {
  const buf: number[] = [];
  let value = x >>> 0;
  for (;;) {
    buf.push(value & 0x7f);
    value >>>= 7;
    if (value === 0) {
      buf[0] = buf[0]! | 0x80;
      break;
    }
  }
  buf.reverse();
  return Uint8Array.from(buf);
}

function encodeIndxString(label: string): Uint8Array {
  const bytes = encodeUtf8(label);
  return concatBytes([Uint8Array.of(bytes.length), bytes]);
}

function encodeCncxString(label: string): Uint8Array {
  const bytes = encodeUtf8(label);
  return concatBytes([encodeVwi(bytes.length), bytes]);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildSkeletonHtml(title: string, chunkId: number): string {
  const aid = formatAzw3EmbedId(chunkId);
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<html xmlns="http://www.w3.org/1999/xhtml">',
    "  <head>",
    `    <title>${escapeHtml(title)}</title>`,
    '    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>',
    "  </head>",
    `  <body aid="${aid}">`,
    "  </body>",
    "</html>",
  ].join("\n");
}

function findBodyInsertOffset(skeleton: Uint8Array): number {
  // Insert fragment content immediately after the opening <body ...> tag.
  const text = new TextDecoder().decode(skeleton);
  const match = text.match(/<body\b[^>]*>/i);
  if (!match || match.index === undefined) {
    return skeleton.length;
  }
  const insertAt = match.index + match[0].length;
  return encodeUtf8(text.slice(0, insertAt)).length;
}

function chaptersToRawflow(
  bookTitle: string,
  chapters: Azw3Chapter[],
): { textBytes: Uint8Array; chunks: ChunkInfo[]; chaps: ChapterInfo[] } {
  const parts: Uint8Array[] = [];
  const chunks: ChunkInfo[] = [];
  const chaps: ChapterInfo[] = [];
  let offset = 0;

  for (let chapId = 0; chapId < chapters.length; chapId += 1) {
    const chapter = chapters[chapId]!;
    const chapStart = offset;
    const headBytes = encodeUtf8(buildSkeletonHtml(bookTitle, chapId));
    const bodyBytes = encodeUtf8(chapter.bodyHtml);
    const insertInSkeleton = findBodyInsertOffset(headBytes);

    chunks.push({
      preStart: offset,
      preLength: headBytes.length,
      insertOffset: offset + insertInSkeleton,
      contentStart: offset + headBytes.length,
      contentLength: bodyBytes.length,
    });

    parts.push(headBytes, bodyBytes);
    offset += headBytes.length + bodyBytes.length;

    chaps.push({
      title: chapter.title,
      start: chapStart,
      length: offset - chapStart,
    });
  }

  return { textBytes: concatBytes(parts), chunks, chaps };
}

type TrailStrands = {
  index: number;
  flagTbsType: number;
  flagNumSiblings: number;
  flagDoesSpan: boolean;
};

function getTrailing(
  chapters: ChapterInfo[],
  from: number,
  to: number,
): Uint8Array {
  let strands: TrailStrands | null = null;

  for (let i = 0; i < chapters.length; i += 1) {
    const chap = chapters[i]!;
    const end = chap.start + chap.length;

    if (chap.start <= from && end >= to) {
      const atExactBoundary = chap.start === from || end === to;
      strands = {
        index: i,
        flagTbsType: 8,
        flagNumSiblings: 1,
        flagDoesSpan: !atExactBoundary,
      };
      break;
    }

    if (
      (from <= chap.start && chap.start <= to) ||
      (from <= end && end <= to)
    ) {
      if (!strands) {
        strands = {
          index: i,
          flagTbsType: 8,
          flagNumSiblings: 1,
          flagDoesSpan: false,
        };
      } else {
        strands.flagNumSiblings += 1;
      }
    }
  }

  const parts: Uint8Array[] = [Uint8Array.of(0)]; // multibyte overlap
  if (strands) {
    let value = strands.index << 3;
    if (strands.flagDoesSpan) value |= 0b0001;
    if (strands.flagTbsType !== 0) value |= 0b0010;
    if (strands.flagNumSiblings > 1) value |= 0b0100;

    const strandParts: Uint8Array[] = [encodeVwi(value)];
    if (strands.flagTbsType !== 0) {
      strandParts.push(encodeVwi(strands.flagTbsType));
    }
    if (strands.flagNumSiblings > 1) {
      strandParts.push(Uint8Array.of(strands.flagNumSiblings));
    }
    if (strands.flagDoesSpan) {
      strandParts.push(encodeVwi(0));
    }
    parts.push(concatBytes(strandParts));
  }

  const payload = concatBytes(parts);
  return concatBytes([payload, encodeVwi(payload.length)]);
}

function splitTextRecords(
  htmlBytes: Uint8Array,
  chapters: ChapterInfo[],
): Uint8Array[] {
  if (!htmlBytes.length) {
    return [getTrailing(chapters, 0, 0)];
  }

  const records: Uint8Array[] = [];
  let offset = 0;

  while (offset < htmlBytes.length) {
    let end = Math.min(offset + RECORD_SIZE, htmlBytes.length);
    if (end < htmlBytes.length) {
      // Avoid splitting a multi-byte UTF-8 sequence across records.
      while (end > offset && (htmlBytes[end]! & 0xc0) === 0x80) {
        end -= 1;
      }
      if (end === offset) {
        end = Math.min(offset + RECORD_SIZE, htmlBytes.length);
      }
    }
    const slice = htmlBytes.subarray(offset, end);
    const trail = getTrailing(chapters, offset, end);
    records.push(concatBytes([slice, trail]));
    offset = end;
  }

  return records;
}

function buildExth(title: string, author: string, imageCount: number): Uint8Array {
  type ExthEntry = { type: number; data: Uint8Array };
  const asin = (Date.now() & 0xfffffff).toString(16).padStart(15, "0");

  const entries: ExthEntry[] = [
    { type: 100, data: encodeUtf8(author) },
    { type: 101, data: encodeUtf8("Focera") },
    { type: 103, data: encodeUtf8(title) },
    { type: 108, data: encodeUtf8("Focera PDF to AZW3") },
    { type: 112, data: encodeUtf8("pdf-to-azw3") },
    { type: 113, data: encodeUtf8(asin) },
    { type: 503, data: encodeUtf8(title) },
    { type: 501, data: encodeUtf8("EBOK") },
    { type: 524, data: encodeUtf8("en") },
    { type: 204, data: packUint32(201) },
    { type: 205, data: packUint32(1) },
    { type: 206, data: packUint32(2) },
    { type: 207, data: packUint32(33307) },
  ];

  if (imageCount > 0) {
    entries.push({ type: 125, data: packUint32(imageCount) });
  }

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

  const raw = concatBytes([header, body]);
  const pad = alignPad(raw.length);
  return pad ? concatBytes([raw, new Uint8Array(pad)]) : raw;
}

function buildFcis(textLength: number): Uint8Array {
  const out = new Uint8Array(52);
  const view = new DataView(out.buffer);
  out.set(encodeUtf8("FCIS"), 0);
  writeUint32(view, 4, 20);
  writeUint32(view, 8, 16);
  writeUint32(view, 12, 2);
  writeUint32(view, 16, 0);
  writeUint32(view, 20, textLength);
  writeUint32(view, 24, 0);
  writeUint32(view, 28, 40);
  writeUint32(view, 32, 0);
  writeUint32(view, 36, 40);
  writeUint32(view, 40, 8);
  writeUint16(view, 44, 1);
  writeUint16(view, 46, 1);
  writeUint32(view, 48, 0);
  return out;
}

function buildFdst(flowLength: number): Uint8Array {
  const out = new Uint8Array(20);
  const view = new DataView(out.buffer);
  out.set(encodeUtf8("FDST"), 0);
  writeUint32(view, 4, 12);
  writeUint32(view, 8, 1);
  writeUint32(view, 12, 0);
  writeUint32(view, 16, flowLength);
  return out;
}

function controlByteForTable(table: number[]): number {
  const bitmaskToShift: Record<number, number> = {
    1: 0,
    2: 1,
    3: 0,
    4: 2,
    8: 3,
    12: 2,
    16: 4,
    32: 5,
    48: 4,
    64: 6,
    128: 7,
    192: 6,
  };

  let ans = 0;
  for (const tag of table) {
    const bytes = packUint32(tag);
    const tagNum = bytes[1]!;
    const bm = bytes[2]!;
    const cb = bytes[3]!;
    if (cb === 1) return ans;

    let nvals = 1;
    if (tag === 0x06020c00) nvals = 4;
    else if (tag === 0x06020800 || tag === 0x01010300) nvals = 2;
    else if (tag === 0x06028000) nvals = 2; // pos_fid: one entry, two values

    // For pos_fid, TAGX numValues is 2 but we still encode one "entry".
    const nentries =
      tag === 0x06028000 ? 1 : Math.floor(nvals / Math.max(tagNum, 1));
    const shifts = bitmaskToShift[bm] ?? 0;
    ans |= bm & (nentries << shifts);
  }
  return ans;
}

function buildIndexRecord(options: {
  type: number;
  headerType: number;
  tagxTable: number[];
  idxtEntries: Uint8Array[];
  subEntryCount: number;
  cncxCount: number;
}): Uint8Array {
  const { type, headerType, tagxTable, idxtEntries, subEntryCount, cncxCount } =
    options;

  let offset = INDX_HEADER_LENGTH;
  const hasTagx = tagxTable.length > 0;
  let tagxLength = 0;
  if (hasTagx) {
    tagxLength = TAGX_HEADER_LENGTH + tagxTable.length * 4;
    offset += tagxLength;
  }

  let entriesLength = 0;
  const idxtOffsets: number[] = [];
  for (const entry of idxtEntries) {
    idxtOffsets.push(offset);
    offset += entry.length;
    entriesLength += entry.length;
  }

  const idxtPad = entriesLength % 4;
  const idxtStart = offset + idxtPad;

  const indx = new Uint8Array(INDX_HEADER_LENGTH);
  const indxView = new DataView(indx.buffer);
  indx.set(encodeUtf8("INDX"), 0);
  writeUint32(indxView, 4, INDX_HEADER_LENGTH);
  writeUint32(indxView, 12, headerType);
  writeUint32(indxView, 16, type);
  writeUint32(indxView, 20, idxtStart);
  writeUint32(indxView, 24, idxtEntries.length);
  writeUint32(indxView, 28, 65001);
  writeUint32(indxView, 32, NULL);
  writeUint32(indxView, 36, subEntryCount);
  writeUint32(indxView, 48, cncxCount);
  writeUint32(indxView, 180, hasTagx ? INDX_HEADER_LENGTH : 0);

  const parts: Uint8Array[] = [indx];

  if (hasTagx) {
    const tagx = new Uint8Array(tagxLength);
    const tagxView = new DataView(tagx.buffer);
    tagx.set(encodeUtf8("TAGX"), 0);
    writeUint32(tagxView, 4, tagxLength);
    writeUint32(tagxView, 8, 1);
    for (let i = 0; i < tagxTable.length; i += 1) {
      writeUint32(tagxView, 12 + i * 4, tagxTable[i]!);
    }
    parts.push(tagx);
  }

  for (const entry of idxtEntries) {
    parts.push(entry);
  }

  if (idxtPad) {
    parts.push(new Uint8Array(idxtPad));
  }

  parts.push(encodeUtf8("IDXT"));
  for (const entryOffset of idxtOffsets) {
    parts.push(packUint16(entryOffset));
  }

  const raw = concatBytes(parts);
  const postPad = alignPad(raw.length);
  return postPad ? concatBytes([raw, new Uint8Array(postPad)]) : raw;
}

function buildCncxRecord(entries: Uint8Array[]): Uint8Array {
  const body = concatBytes(entries);
  const pad = body.length % 4;
  return pad ? concatBytes([body, new Uint8Array(pad)]) : body;
}

function buildChunkIndexes(chunks: ChunkInfo[]): {
  header: Uint8Array;
  index: Uint8Array;
  cncx: Uint8Array;
} {
  const lastPos =
    chunks.length > 0
      ? chunks[chunks.length - 1]!.insertOffset
      : 0;

  const headerLabel = encodeIndxString(String(lastPos).padStart(10, "0"));
  const headerPad = new Uint8Array(5);
  writeUint16(new DataView(headerPad.buffer), 0, chunks.length);
  const headerEntry = concatBytes([headerLabel, headerPad]);

  const header = buildIndexRecord({
    type: 2,
    headerType: 0,
    tagxTable: TAGX_TABLE_CHUNK,
    idxtEntries: [headerEntry],
    subEntryCount: chunks.length,
    cncxCount: 1,
  });

  const idxtEntries: Uint8Array[] = [];
  const cncxEntries: Uint8Array[] = [];
  let cncxOffset = 0;
  const cb = controlByteForTable(TAGX_TABLE_CHUNK);

  for (let i = 0; i < chunks.length; i += 1) {
    const chunk = chunks[i]!;
    const cncx = encodeCncxString(
      `P-//*[@aid='${formatAzw3EmbedId(i)}']`,
    );
    cncxEntries.push(cncx);

    const label = encodeIndxString(
      String(chunk.insertOffset).padStart(10, "0"),
    );
    idxtEntries.push(
      concatBytes([
        label,
        Uint8Array.of(cb),
        encodeVwi(cncxOffset),
        encodeVwi(i),
        encodeVwi(i),
        encodeVwi(0),
        encodeVwi(chunk.contentLength),
      ]),
    );
    cncxOffset += cncx.length;
  }

  return {
    header,
    index: buildIndexRecord({
      type: 0,
      headerType: 1,
      tagxTable: [],
      idxtEntries,
      subEntryCount: 0,
      cncxCount: 0,
    }),
    cncx: buildCncxRecord(cncxEntries),
  };
}

function buildSkeletonIndexes(chunks: ChunkInfo[]): {
  header: Uint8Array;
  index: Uint8Array;
} {
  const headerLabel = encodeIndxString(
    `SKEL${String(Math.max(chunks.length - 1, 0)).padStart(10, "0")}`,
  );
  const headerPad = new Uint8Array(5);
  writeUint16(new DataView(headerPad.buffer), 0, chunks.length);
  const headerEntry = concatBytes([headerLabel, headerPad]);

  const header = buildIndexRecord({
    type: 2,
    headerType: 0,
    tagxTable: TAGX_TABLE_SKELETON,
    idxtEntries: [headerEntry],
    subEntryCount: chunks.length,
    cncxCount: 0,
  });

  const idxtEntries: Uint8Array[] = [];
  const cb = controlByteForTable(TAGX_TABLE_SKELETON);

  for (let i = 0; i < chunks.length; i += 1) {
    const chunk = chunks[i]!;
    const label = encodeIndxString(`SKEL${String(i).padStart(10, "0")}`);
    idxtEntries.push(
      concatBytes([
        label,
        Uint8Array.of(cb),
        encodeVwi(1),
        encodeVwi(1),
        encodeVwi(chunk.preStart),
        encodeVwi(chunk.preLength),
      ]),
    );
  }

  return {
    header,
    index: buildIndexRecord({
      type: 0,
      headerType: 1,
      tagxTable: [],
      idxtEntries,
      subEntryCount: 0,
      cncxCount: 0,
    }),
  };
}

function buildNcxIndexes(chaps: ChapterInfo[]): {
  header: Uint8Array;
  index: Uint8Array;
  cncx: Uint8Array;
} {
  const headerLabel = encodeIndxString(
    String(Math.max(chaps.length - 1, 0)).padStart(3, "0"),
  );
  const headerPad = new Uint8Array(5);
  writeUint16(new DataView(headerPad.buffer), 0, chaps.length);
  const headerEntry = concatBytes([headerLabel, headerPad]);

  const header = buildIndexRecord({
    type: 2,
    headerType: 0,
    tagxTable: TAGX_TABLE_NCX,
    idxtEntries: [headerEntry],
    subEntryCount: chaps.length,
    cncxCount: 1,
  });

  const idxtEntries: Uint8Array[] = [];
  const cncxEntries: Uint8Array[] = [];
  let cncxOffset = 0;
  const cb = controlByteForTable(TAGX_TABLE_NCX);

  for (let i = 0; i < chaps.length; i += 1) {
    const chap = chaps[i]!;
    const cncx = encodeCncxString(chap.title);
    cncxEntries.push(cncx);

    // Label is often a zero-padded hex index; KF8 readers key off pos_fid.
    const label = encodeIndxString(i.toString(16).padStart(3, "0"));
    idxtEntries.push(
      concatBytes([
        label,
        Uint8Array.of(cb),
        encodeVwi(chap.start), // tag 1 position in rawflow
        encodeVwi(chap.length), // tag 2 length
        encodeVwi(cncxOffset), // tag 3 label CNCX offset
        encodeVwi(0), // tag 4 depth
        encodeVwi(i), // tag 6 fid (fragment / file id)
        encodeVwi(0), // tag 6 offset within fragment
      ]),
    );
    cncxOffset += cncx.length;
  }

  return {
    header,
    index: buildIndexRecord({
      type: 0,
      headerType: 1,
      tagxTable: [],
      idxtEntries,
      subEntryCount: 0,
      cncxCount: 0,
    }),
    cncx: buildCncxRecord(cncxEntries),
  };
}

function buildRecord0(options: {
  titleBytes: Uint8Array;
  textLength: number;
  lastTextRecordIdx: number;
  firstNonTextRecordIdx: number;
  firstImageRecord: number;
  chunkIndex: number;
  skeletonIndex: number;
  ncxIndex: number;
  fdstNumber: number;
  fdstEntryCount: number;
  flisNumber: number;
  fcisNumber: number;
  exth: Uint8Array;
  uniqueId: number;
}): Uint8Array {
  const palm = new Uint8Array(PALMDOC_HEADER_LENGTH);
  const palmView = new DataView(palm.buffer);
  writeUint16(palmView, 0, 1); // no compression
  writeUint16(palmView, 2, 0);
  writeUint32(palmView, 4, options.textLength);
  writeUint16(palmView, 8, options.lastTextRecordIdx);
  writeUint16(palmView, 10, RECORD_SIZE);
  writeUint16(palmView, 12, 0);
  writeUint16(palmView, 14, 0);

  const mobi = new Uint8Array(KF8_HEADER_LENGTH);
  const mobiView = new DataView(mobi.buffer);
  mobi.set(encodeUtf8("MOBI"), 0);
  writeUint32(mobiView, 4, KF8_HEADER_LENGTH);
  writeUint32(mobiView, 8, 2); // book
  writeUint32(mobiView, 12, 65001); // UTF-8
  writeUint32(mobiView, 16, options.uniqueId);
  writeUint32(mobiView, 20, 8); // KF8

  for (let offset = 24; offset < 64; offset += 4) {
    writeUint32(mobiView, offset, NULL);
  }

  writeUint32(mobiView, 64, options.firstNonTextRecordIdx);

  const fullNameOffset = PALMDOC_HEADER_LENGTH + KF8_HEADER_LENGTH + options.exth.length;
  writeUint32(mobiView, 68, fullNameOffset);
  writeUint32(mobiView, 72, options.titleBytes.length);
  writeUint32(mobiView, 76, 0x0409); // en-US
  writeUint32(mobiView, 80, 0);
  writeUint32(mobiView, 84, 0);
  writeUint32(mobiView, 88, 8); // min version KF8
  writeUint32(mobiView, 92, options.firstImageRecord);
  writeUint32(mobiView, 96, 0);
  writeUint32(mobiView, 100, 0);
  writeUint32(mobiView, 104, 0);
  writeUint32(mobiView, 108, 0);
  writeUint32(mobiView, 112, 0x50); // EXTH present (Calibre KF8 flag set)

  writeUint32(mobiView, 148, NULL); // DRM offset
  writeUint32(mobiView, 152, NULL); // DRM count
  writeUint32(mobiView, 156, 0);
  writeUint32(mobiView, 160, 0);

  // FDST record number split across these two fields for KF8
  writeUint16(mobiView, 176, 0);
  writeUint16(mobiView, 178, options.fdstNumber);
  writeUint32(mobiView, 180, options.fdstEntryCount);
  writeUint32(mobiView, 184, options.fcisNumber);
  writeUint32(mobiView, 188, 1);
  writeUint32(mobiView, 192, options.flisNumber);
  writeUint32(mobiView, 196, 1);

  writeUint32(mobiView, 208, NULL);
  writeUint32(mobiView, 212, 0);
  writeUint32(mobiView, 216, NULL);
  writeUint32(mobiView, 220, NULL);
  writeUint32(mobiView, 224, 0b11); // trailing multibyte + TBS
  writeUint32(mobiView, 228, options.ncxIndex);

  // KF8 extra header fields
  writeUint32(mobiView, 232, options.chunkIndex);
  writeUint32(mobiView, 236, options.skeletonIndex);
  writeUint32(mobiView, 240, NULL); // DATP
  writeUint32(mobiView, 244, NULL); // GUIDE

  return concatBytes([
    palm,
    mobi,
    options.exth,
    options.titleBytes,
    new Uint8Array(NULL_PADDING_LENGTH),
  ]);
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
  writeUint16(view, 32, 0);
  writeUint16(view, 34, 0);
  writeUint32(view, 36, now);
  writeUint32(view, 40, now);
  writeUint32(view, 44, 0);
  writeUint32(view, 48, 0);
  writeUint32(view, 52, 0);
  writeUint32(view, 56, 0);
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
    type: "application/x-mobi8-ebook",
  });
}

/**
 * Build a KF8 (AZW3) ebook from chapters and optional JPEG image records.
 * Compatible with Calibre, Kindle apps, and modern Kindle devices via sideload.
 */
export function buildAzw3Blob(options: BuildAzw3Options): Blob {
  const title = options.title.trim() || "Converted PDF";
  const author = options.author?.trim() || "Focera";
  const images = options.images ?? [];
  const chapters =
    options.chapters.length > 0
      ? options.chapters
      : [{ title: "Chapter 1", bodyHtml: "<p></p>" }];

  const { textBytes, chunks, chaps } = chaptersToRawflow(title, chapters);
  const textRecords = splitTextRecords(textBytes, chaps);
  const titleBytes = encodeUtf8(title);
  const exth = buildExth(title, author, images.length);
  const uniqueId = (Date.now() ^ 0x9e3779b9) >>> 0;

  const records: Uint8Array[] = [new Uint8Array(0)];
  records.push(...textRecords);

  const lastTextRecordIdx = textRecords.length;
  let firstNonTextRecordIdx = lastTextRecordIdx + 1;

  const lastLength = textRecords[textRecords.length - 1]?.length ?? 0;
  if (lastLength % 4 !== 0) {
    records.push(new Uint8Array(lastLength % 4));
    firstNonTextRecordIdx += 1;
  }

  const chunkIndexes = buildChunkIndexes(chunks);
  const chunkIndex = records.length;
  records.push(chunkIndexes.header, chunkIndexes.index, chunkIndexes.cncx);

  const skeletonIndexes = buildSkeletonIndexes(chunks);
  const skeletonIndex = records.length;
  records.push(skeletonIndexes.header, skeletonIndexes.index);

  const ncxIndexes = buildNcxIndexes(chaps);
  const ncxIndex = records.length;
  records.push(ncxIndexes.header, ncxIndexes.index, ncxIndexes.cncx);

  const firstImageRecord =
    images.length > 0 ? records.length : NULL;
  for (const image of images) {
    records.push(image.data);
  }

  const fdstNumber = records.length;
  records.push(buildFdst(textBytes.length));

  const flisNumber = records.length;
  records.push(FLIS);
  const fcisNumber = records.length;
  records.push(buildFcis(textBytes.length));
  records.push(EOF_RECORD);

  records[0] = buildRecord0({
    titleBytes,
    textLength: textBytes.length,
    lastTextRecordIdx,
    firstNonTextRecordIdx,
    firstImageRecord: firstImageRecord === NULL ? records.length : firstImageRecord,
    chunkIndex,
    skeletonIndex,
    ncxIndex,
    fdstNumber,
    fdstEntryCount: 1,
    flisNumber,
    fcisNumber,
    exth,
    uniqueId,
  });

  // Fix first image index when there are no images
  if (images.length === 0) {
    const record0 = records[0]!;
    const view = new DataView(
      record0.buffer,
      record0.byteOffset,
      record0.byteLength,
    );
    writeUint32(view, PALMDOC_HEADER_LENGTH + 92, NULL);
  }

  return buildPalmDb(records, title);
}
