import QRCode from "qrcode";
import { hexToRgb, normalizeHex, rgbToHex, type Rgb } from "@/lib/color-palette";
import {
  effectiveEcc,
  type QrDesignSettings,
  type QrEyeStyle,
  type QrLogoShape,
  type QrModuleStyle,
} from "@/lib/qr-generator";

export type QrRenderInput = {
  payload: string;
  design: QrDesignSettings;
  logoDataUrl?: string | null;
};

export type QrRenderResult = {
  pngDataUrl: string;
  svgText: string;
  width: number;
  height: number;
};

type Matrix = {
  size: number;
  get(row: number, col: number): number;
};

function isFinderCell(row: number, col: number, size: number): boolean {
  const inTopLeft = row < 7 && col < 7;
  const inTopRight = row < 7 && col >= size - 7;
  const inBottomLeft = row >= size - 7 && col < 7;
  return inTopLeft || inTopRight || inBottomLeft;
}

function finderOrigins(size: number): Array<[number, number]> {
  return [
    [0, 0],
    [0, size - 7],
    [size - 7, 0],
  ];
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load logo image."));
    img.src = src;
  });
}

function mixHex(a: string, b: string, t: number): string {
  const from = hexToRgb(a);
  const to = hexToRgb(b);
  if (!from || !to) return a;
  const lerp = (x: number, y: number) => Math.round(x + (y - x) * t);
  const mixed: Rgb = {
    r: lerp(from.r, to.r),
    g: lerp(from.g, to.g),
    b: lerp(from.b, to.b),
  };
  return rgbToHex(mixed);
}

function moduleColor(
  design: QrDesignSettings,
  row: number,
  col: number,
  size: number,
): string {
  const dark = normalizeHex(design.darkColor) ?? "#0B1F1C";
  if (!design.gradientEnabled) return dark;
  const end = normalizeHex(design.gradientColor) ?? dark;
  const t = size <= 1 ? 0 : (row + col) / (2 * (size - 1));
  return mixHex(dark, end, t);
}

function drawModule(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cell: number,
  style: QrModuleStyle,
  color: string,
) {
  ctx.fillStyle = color;
  if (style === "dots") {
    ctx.beginPath();
    ctx.arc(x + cell / 2, y + cell / 2, cell * 0.38, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  if (style === "rounded") {
    const r = cell * 0.28;
    roundRect(ctx, x + cell * 0.08, y + cell * 0.08, cell * 0.84, cell * 0.84, r);
    ctx.fill();
    return;
  }
  ctx.fillRect(x, y, cell, cell);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawEye(
  ctx: CanvasRenderingContext2D,
  originRow: number,
  originCol: number,
  cell: number,
  margin: number,
  style: QrEyeStyle,
  color: string,
  light: string | null,
) {
  const x = (originCol + margin) * cell;
  const y = (originRow + margin) * cell;
  const outer = cell * 7;
  const inner = cell * 3;
  const inset = cell * 2;

  ctx.fillStyle = color;
  if (style === "square") {
    ctx.fillRect(x, y, outer, outer);
    if (light) {
      ctx.fillStyle = light;
      ctx.fillRect(x + cell, y + cell, cell * 5, cell * 5);
    } else {
      ctx.clearRect(x + cell, y + cell, cell * 5, cell * 5);
    }
    ctx.fillStyle = color;
    ctx.fillRect(x + inset, y + inset, inner, inner);
    return;
  }

  if (style === "rounded") {
    roundRect(ctx, x, y, outer, outer, cell * 1.2);
    ctx.fill();
    if (light) {
      ctx.fillStyle = light;
      roundRect(ctx, x + cell, y + cell, cell * 5, cell * 5, cell);
      ctx.fill();
    } else {
      ctx.save();
      roundRect(ctx, x + cell, y + cell, cell * 5, cell * 5, cell);
      ctx.clip();
      ctx.clearRect(x + cell, y + cell, cell * 5, cell * 5);
      ctx.restore();
    }
    ctx.fillStyle = color;
    roundRect(ctx, x + inset, y + inset, inner, inner, cell * 0.7);
    ctx.fill();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(x + outer * 0.15, y);
  ctx.lineTo(x + outer, y);
  ctx.lineTo(x + outer, y + outer * 0.85);
  ctx.quadraticCurveTo(x + outer, y + outer, x + outer * 0.85, y + outer);
  ctx.lineTo(x, y + outer);
  ctx.lineTo(x, y + outer * 0.15);
  ctx.quadraticCurveTo(x, y, x + outer * 0.15, y);
  ctx.closePath();
  ctx.fill();

  if (light) {
    ctx.fillStyle = light;
    roundRect(ctx, x + cell, y + cell, cell * 5, cell * 5, cell * 0.9);
    ctx.fill();
  } else {
    ctx.save();
    roundRect(ctx, x + cell, y + cell, cell * 5, cell * 5, cell * 0.9);
    ctx.clip();
    ctx.clearRect(x + cell, y + cell, cell * 5, cell * 5);
    ctx.restore();
  }

  ctx.fillStyle = color;
  roundRect(ctx, x + inset, y + inset, inner, inner, cell * 0.65);
  ctx.fill();
}

function logoRadius(shape: QrLogoShape, box: number): number {
  if (shape === "circle") return box / 2;
  if (shape === "rounded") return box * 0.22;
  return 0;
}

async function drawLogo(
  ctx: CanvasRenderingContext2D,
  qrPx: number,
  design: QrDesignSettings,
  logoDataUrl: string,
  light: string | null,
) {
  const logo = await loadImage(logoDataUrl);
  const logoSize = qrPx * (design.logoSizePercent / 100);
  const pad = design.logoPad ? logoSize * 0.14 : 0;
  const box = logoSize + pad * 2;
  const lx = (qrPx - box) / 2;
  const ly = (qrPx - box) / 2;
  const radius = logoRadius(design.logoShape, box);

  if (design.logoPad) {
    ctx.fillStyle = light ?? "#ffffff";
    if (radius > 0) {
      roundRect(ctx, lx, ly, box, box, radius);
      ctx.fill();
    } else {
      ctx.fillRect(lx, ly, box, box);
    }
  }

  ctx.save();
  if (design.logoShape === "circle") {
    ctx.beginPath();
    ctx.arc(lx + box / 2, ly + box / 2, logoSize / 2, 0, Math.PI * 2);
    ctx.clip();
  } else if (design.logoShape === "rounded") {
    roundRect(ctx, lx + pad, ly + pad, logoSize, logoSize, logoSize * 0.18);
    ctx.clip();
  }
  ctx.drawImage(logo, lx + pad, ly + pad, logoSize, logoSize);
  ctx.restore();
}

function frameMetrics(design: QrDesignSettings, qrPx: number) {
  if (design.frameStyle === "none") {
    return { width: qrPx, height: qrPx, offsetX: 0, offsetY: 0, labelH: 0 };
  }
  const pad = Math.round(qrPx * 0.08);
  const labelH = Math.round(qrPx * 0.16);
  return {
    width: qrPx + pad * 2,
    height: qrPx + pad * 2 + labelH,
    offsetX: pad,
    offsetY: pad,
    labelH,
  };
}

async function paintQr(
  ctx: CanvasRenderingContext2D,
  matrix: Matrix,
  design: QrDesignSettings,
  cell: number,
  originX: number,
  originY: number,
  logoDataUrl?: string | null,
) {
  const light = design.transparentBackground
    ? null
    : (normalizeHex(design.lightColor) ?? "#F4FBF8");
  const eye = normalizeHex(design.eyeColor) ?? normalizeHex(design.darkColor) ?? "#0B1F1C";
  const modules = matrix.size + design.margin * 2;
  const qrPx = modules * cell;

  if (light) {
    ctx.fillStyle = light;
    ctx.fillRect(originX, originY, qrPx, qrPx);
  }

  ctx.save();
  ctx.translate(originX, originY);

  for (let row = 0; row < matrix.size; row += 1) {
    for (let col = 0; col < matrix.size; col += 1) {
      if (!matrix.get(row, col)) continue;
      if (isFinderCell(row, col, matrix.size)) continue;
      const x = (col + design.margin) * cell;
      const y = (row + design.margin) * cell;
      drawModule(
        ctx,
        x,
        y,
        cell,
        design.moduleStyle,
        moduleColor(design, row, col, matrix.size),
      );
    }
  }

  for (const [row, col] of finderOrigins(matrix.size)) {
    drawEye(
      ctx,
      row,
      col,
      cell,
      design.margin,
      design.eyeStyle,
      eye,
      light,
    );
  }

  if (logoDataUrl) {
    await drawLogo(ctx, qrPx, design, logoDataUrl, light);
  }

  ctx.restore();
}

export async function renderQr(input: QrRenderInput): Promise<QrRenderResult> {
  const { payload, design, logoDataUrl } = input;
  const ecc = effectiveEcc(design, Boolean(logoDataUrl));
  const created = QRCode.create(payload, { errorCorrectionLevel: ecc });
  const matrix = created.modules;
  const modules = matrix.size + design.margin * 2;
  const cell = Math.max(1, Math.floor(design.size / modules));
  const qrPx = modules * cell;
  const frame = frameMetrics(design, qrPx);

  const canvas = document.createElement("canvas");
  canvas.width = frame.width;
  canvas.height = frame.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available.");

  if (design.frameStyle !== "none") {
    const dark = normalizeHex(design.darkColor) ?? "#0B1F1C";
    const light = design.transparentBackground
      ? "#ffffff"
      : (normalizeHex(design.lightColor) ?? "#F4FBF8");
    ctx.fillStyle = light;
    if (design.frameStyle === "badge") {
      roundRect(ctx, 0, 0, frame.width, frame.height, Math.round(qrPx * 0.08));
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, frame.width, frame.height);
    }
    ctx.strokeStyle = dark;
    ctx.lineWidth = Math.max(2, Math.round(qrPx * 0.012));
    if (design.frameStyle === "badge") {
      roundRect(
        ctx,
        ctx.lineWidth / 2,
        ctx.lineWidth / 2,
        frame.width - ctx.lineWidth,
        frame.height - ctx.lineWidth,
        Math.round(qrPx * 0.08),
      );
      ctx.stroke();
    } else {
      ctx.strokeRect(
        ctx.lineWidth / 2,
        ctx.lineWidth / 2,
        frame.width - ctx.lineWidth,
        frame.height - ctx.lineWidth,
      );
    }
    ctx.fillStyle = dark;
    ctx.font = `600 ${Math.round(qrPx * 0.07)}px ui-sans-serif, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const label = design.frameLabel.trim() || "Scan me";
    ctx.fillText(
      label,
      frame.width / 2,
      frame.offsetY + qrPx + frame.labelH / 2,
      frame.width - frame.offsetX * 2,
    );
  }

  await paintQr(
    ctx,
    matrix,
    design,
    cell,
    frame.offsetX,
    frame.offsetY,
    logoDataUrl,
  );

  const pngDataUrl = canvas.toDataURL("image/png");
  const svgText = renderQrSvg(input, matrix, cell, qrPx, frame);

  return {
    pngDataUrl,
    svgText,
    width: frame.width,
    height: frame.height,
  };
}

function svgEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function moduleSvg(
  x: number,
  y: number,
  cell: number,
  style: QrModuleStyle,
  color: string,
): string {
  if (style === "dots") {
    return `<circle cx="${x + cell / 2}" cy="${y + cell / 2}" r="${cell * 0.38}" fill="${color}"/>`;
  }
  if (style === "rounded") {
    const r = cell * 0.28;
    return `<rect x="${x + cell * 0.08}" y="${y + cell * 0.08}" width="${cell * 0.84}" height="${cell * 0.84}" rx="${r}" ry="${r}" fill="${color}"/>`;
  }
  return `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" fill="${color}"/>`;
}

function eyeSvg(
  originRow: number,
  originCol: number,
  cell: number,
  margin: number,
  style: QrEyeStyle,
  color: string,
  light: string | null,
): string {
  const x = (originCol + margin) * cell;
  const y = (originRow + margin) * cell;
  const outer = cell * 7;
  const hole = cell * 5;
  const core = cell * 3;
  const parts: string[] = [];

  if (style === "square") {
    if (light) {
      parts.push(
        `<rect x="${x}" y="${y}" width="${outer}" height="${outer}" fill="${color}"/>`,
        `<rect x="${x + cell}" y="${y + cell}" width="${hole}" height="${hole}" fill="${light}"/>`,
        `<rect x="${x + cell * 2}" y="${y + cell * 2}" width="${core}" height="${core}" fill="${color}"/>`,
      );
    } else {
      parts.push(
        `<path fill-rule="evenodd" fill="${color}" d="M${x} ${y}h${outer}v${outer}h${-outer}z M${x + cell} ${y + cell}h${hole}v${hole}h${-hole}z"/>`,
        `<rect x="${x + cell * 2}" y="${y + cell * 2}" width="${core}" height="${core}" fill="${color}"/>`,
      );
    }
    return parts.join("");
  }

  const outerR = style === "leaf" ? cell * 1.4 : cell * 1.2;
  const holeR = cell;
  if (light) {
    parts.push(
      `<rect x="${x}" y="${y}" width="${outer}" height="${outer}" rx="${outerR}" ry="${outerR}" fill="${color}"/>`,
      `<rect x="${x + cell}" y="${y + cell}" width="${hole}" height="${hole}" rx="${holeR}" ry="${holeR}" fill="${light}"/>`,
      `<rect x="${x + cell * 2}" y="${y + cell * 2}" width="${core}" height="${core}" rx="${cell * 0.7}" ry="${cell * 0.7}" fill="${color}"/>`,
    );
  } else {
    parts.push(
      `<path fill-rule="evenodd" fill="${color}" d="M${x} ${y}h${outer}v${outer}h${-outer}z M${x + cell} ${y + cell}h${hole}v${hole}h${-hole}z"/>`,
      `<rect x="${x + cell * 2}" y="${y + cell * 2}" width="${core}" height="${core}" rx="${cell * 0.7}" ry="${cell * 0.7}" fill="${color}"/>`,
    );
  }
  return parts.join("");
}

function renderQrSvg(
  input: QrRenderInput,
  matrix: Matrix,
  cell: number,
  qrPx: number,
  frame: ReturnType<typeof frameMetrics>,
): string {
  const { design, logoDataUrl } = input;
  const dark = normalizeHex(design.darkColor) ?? "#0B1F1C";
  const eye = normalizeHex(design.eyeColor) ?? dark;
  const light = design.transparentBackground
    ? null
    : (normalizeHex(design.lightColor) ?? "#F4FBF8");

  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${frame.width}" height="${frame.height}" viewBox="0 0 ${frame.width} ${frame.height}" shape-rendering="geometricPrecision">`,
  );

  if (design.frameStyle !== "none") {
    const bg = light ?? "#ffffff";
    if (design.frameStyle === "badge") {
      const r = Math.round(qrPx * 0.08);
      parts.push(
        `<rect x="0" y="0" width="${frame.width}" height="${frame.height}" rx="${r}" ry="${r}" fill="${bg}" stroke="${dark}" stroke-width="${Math.max(2, Math.round(qrPx * 0.012))}"/>`,
      );
    } else {
      parts.push(
        `<rect x="0" y="0" width="${frame.width}" height="${frame.height}" fill="${bg}" stroke="${dark}" stroke-width="${Math.max(2, Math.round(qrPx * 0.012))}"/>`,
      );
    }
    const label = svgEscape(design.frameLabel.trim() || "Scan me");
    parts.push(
      `<text x="${frame.width / 2}" y="${frame.offsetY + qrPx + frame.labelH / 2}" fill="${dark}" font-size="${Math.round(qrPx * 0.07)}" font-family="ui-sans-serif, system-ui, sans-serif" font-weight="600" text-anchor="middle" dominant-baseline="middle">${label}</text>`,
    );
  }

  parts.push(`<g transform="translate(${frame.offsetX} ${frame.offsetY})">`);
  if (light) {
    parts.push(
      `<rect x="0" y="0" width="${qrPx}" height="${qrPx}" fill="${light}"/>`,
    );
  }

  for (let row = 0; row < matrix.size; row += 1) {
    for (let col = 0; col < matrix.size; col += 1) {
      if (!matrix.get(row, col)) continue;
      if (isFinderCell(row, col, matrix.size)) continue;
      const x = (col + design.margin) * cell;
      const y = (row + design.margin) * cell;
      parts.push(
        moduleSvg(
          x,
          y,
          cell,
          design.moduleStyle,
          moduleColor(design, row, col, matrix.size),
        ),
      );
    }
  }

  for (const [row, col] of finderOrigins(matrix.size)) {
    parts.push(
      eyeSvg(row, col, cell, design.margin, design.eyeStyle, eye, light),
    );
  }

  if (logoDataUrl) {
    const logoSize = qrPx * (design.logoSizePercent / 100);
    const pad = design.logoPad ? logoSize * 0.14 : 0;
    const box = logoSize + pad * 2;
    const lx = (qrPx - box) / 2;
    const ly = (qrPx - box) / 2;
    const clipId = "qr-logo-clip";
    if (design.logoPad) {
      const radius =
        design.logoShape === "circle"
          ? box / 2
          : design.logoShape === "rounded"
            ? box * 0.22
            : 0;
      parts.push(
        `<rect x="${lx}" y="${ly}" width="${box}" height="${box}" rx="${radius}" ry="${radius}" fill="${light ?? "#ffffff"}"/>`,
      );
    }
    parts.push(`<defs><clipPath id="${clipId}">`);
    if (design.logoShape === "circle") {
      parts.push(
        `<circle cx="${lx + box / 2}" cy="${ly + box / 2}" r="${logoSize / 2}"/>`,
      );
    } else if (design.logoShape === "rounded") {
      parts.push(
        `<rect x="${lx + pad}" y="${ly + pad}" width="${logoSize}" height="${logoSize}" rx="${logoSize * 0.18}" ry="${logoSize * 0.18}"/>`,
      );
    } else {
      parts.push(
        `<rect x="${lx + pad}" y="${ly + pad}" width="${logoSize}" height="${logoSize}"/>`,
      );
    }
    parts.push(`</clipPath></defs>`);
    parts.push(
      `<image href="${logoDataUrl}" xlink:href="${logoDataUrl}" x="${lx + pad}" y="${ly + pad}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet" clip-path="url(#${clipId})"/>`,
    );
  }

  parts.push("</g></svg>");
  return parts.join("");
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(",");
  const isBase64 = header.includes("base64");
  const mime = /data:([^;]+)/.exec(header)?.[1] ?? "image/png";
  if (!isBase64) {
    return new Blob([decodeURIComponent(data)], { type: mime });
  }
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}
