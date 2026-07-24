export type Rgb = { r: number; g: number; b: number };
export type Hsl = { h: number; s: number; l: number };

export type PaletteColor = {
  id: string;
  hex: string;
  locked: boolean;
};

export type ExportFormat = "css" | "tailwind" | "hex" | "rgb";

export type ContrastLevel = "fail" | "aa-large" | "aa" | "aaa";

export type ContrastResult = {
  ratio: number;
  level: ContrastLevel;
  label: string;
  passesAaNormal: boolean;
  passesAaLarge: boolean;
  passesAaaNormal: boolean;
  passesAaaLarge: boolean;
};

export const PALETTE_SIZE = 5;

const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function randomFloat(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomFloat(min, max + 1));
}

export function createColorId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `c-${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizeHex(input: string): string | null {
  const trimmed = input.trim();
  const match = HEX_RE.exec(trimmed);
  if (!match) return null;

  let raw = match[1].toLowerCase();
  if (raw.length === 3) {
    raw = raw
      .split("")
      .map((ch) => ch + ch)
      .join("");
  }
  return `#${raw}`;
}

export function hexToRgb(hex: string): Rgb | null {
  const normalized = normalizeHex(hex);
  if (!normalized) return null;
  const value = normalized.slice(1);
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const toByte = (n: number) =>
    clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
  return `#${toByte(r)}${toByte(g)}${toByte(b)}`;
}

export function formatRgb(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "rgb(0, 0, 0)";
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return { h, s: s * 100, l: l * 100 };
}

export function hslToRgb({ h, s, l }: Hsl): Rgb {
  const sat = clamp(s, 0, 100) / 100;
  const light = clamp(l, 0, 100) / 100;
  const hue = ((h % 360) + 360) % 360;

  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = light - c / 2;

  let rn = 0;
  let gn = 0;
  let bn = 0;

  if (hue < 60) {
    rn = c;
    gn = x;
  } else if (hue < 120) {
    rn = x;
    gn = c;
  } else if (hue < 180) {
    gn = c;
    bn = x;
  } else if (hue < 240) {
    gn = x;
    bn = c;
  } else if (hue < 300) {
    rn = x;
    bn = c;
  } else {
    rn = c;
    bn = x;
  }

  return {
    r: Math.round((rn + m) * 255),
    g: Math.round((gn + m) * 255),
    b: Math.round((bn + m) * 255),
  };
}

export function hslToHex(hsl: Hsl): string {
  return rgbToHex(hslToRgb(hsl));
}

export function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };

  return (
    0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b)
  );
}

export function contrastRatio(foreground: string, background: string): number {
  const l1 = relativeLuminance(foreground);
  const l2 = relativeLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function assessContrast(
  foreground: string,
  background: string,
): ContrastResult {
  const ratio = contrastRatio(foreground, background);
  const passesAaLarge = ratio >= 3;
  const passesAaNormal = ratio >= 4.5;
  const passesAaaLarge = ratio >= 4.5;
  const passesAaaNormal = ratio >= 7;

  let level: ContrastLevel = "fail";
  let label = "Fail";

  if (passesAaaNormal) {
    level = "aaa";
    label = "AAA";
  } else if (passesAaNormal) {
    level = "aa";
    label = "AA";
  } else if (passesAaLarge) {
    level = "aa-large";
    label = "AA Large";
  }

  return {
    ratio,
    level,
    label,
    passesAaNormal,
    passesAaLarge,
    passesAaaNormal,
    passesAaaLarge,
  };
}

export function formatContrastRatio(ratio: number): string {
  return `${ratio.toFixed(2)}:1`;
}

export function textColorForBackground(hex: string): string {
  return relativeLuminance(hex) > 0.45 ? "#0b1f1c" : "#f7faf8";
}

function randomVibrantHex(): string {
  return hslToHex({
    h: randomFloat(0, 360),
    s: randomFloat(42, 78),
    l: randomFloat(32, 68),
  });
}

function buildHarmonyPalette(baseHue: number): string[] {
  const style = randomInt(0, 4);

  if (style === 0) {
    // Analogous
    return [-40, -20, 0, 20, 40].map((offset, index) =>
      hslToHex({
        h: baseHue + offset,
        s: randomFloat(48, 72),
        l: 28 + index * 11 + randomFloat(-3, 3),
      }),
    );
  }

  if (style === 1) {
    // Complementary split
    return [
      hslToHex({ h: baseHue, s: 62, l: 42 }),
      hslToHex({ h: baseHue + 18, s: 55, l: 58 }),
      hslToHex({ h: baseHue + 180, s: 58, l: 46 }),
      hslToHex({ h: baseHue + 195, s: 50, l: 62 }),
      hslToHex({ h: baseHue + 8, s: 22, l: 92 }),
    ];
  }

  if (style === 2) {
    // Triadic
    return [0, 120, 240, 30, 150].map((offset, index) =>
      hslToHex({
        h: baseHue + offset,
        s: 45 + (index % 3) * 8,
        l: 34 + index * 10,
      }),
    );
  }

  if (style === 3) {
    // Monochrome steps
    return [18, 32, 48, 64, 82].map((lightness, index) =>
      hslToHex({
        h: baseHue + (index - 2) * 4,
        s: 55 - Math.abs(index - 2) * 6,
        l: lightness,
      }),
    );
  }

  // Soft pastel set with one accent
  return [
    hslToHex({ h: baseHue, s: 58, l: 48 }),
    hslToHex({ h: baseHue + 28, s: 42, l: 72 }),
    hslToHex({ h: baseHue + 190, s: 36, l: 68 }),
    hslToHex({ h: baseHue + 210, s: 28, l: 88 }),
    hslToHex({ h: baseHue + 8, s: 18, l: 24 }),
  ];
}

export function createRandomPalette(): PaletteColor[] {
  const hexes = buildHarmonyPalette(randomFloat(0, 360));
  return hexes.map((hex) => ({
    id: createColorId(),
    hex,
    locked: false,
  }));
}

export function regeneratePalette(colors: PaletteColor[]): PaletteColor[] {
  const locked = colors.filter((color) => color.locked);
  const unlockedCount = colors.length - locked.length;

  if (unlockedCount === 0) return colors;

  let candidates: string[];

  if (locked.length > 0) {
    const base = hexToRgb(locked[0].hex);
    const hue = base ? rgbToHsl(base).h : randomFloat(0, 360);
    candidates = buildHarmonyPalette(hue);
  } else {
    candidates = buildHarmonyPalette(randomFloat(0, 360));
  }

  let candidateIndex = 0;
  return colors.map((color) => {
    if (color.locked) return color;
    const nextHex =
      candidates[candidateIndex % candidates.length] ?? randomVibrantHex();
    candidateIndex += 1;
    return { ...color, hex: nextHex };
  });
}

export function updatePaletteColor(
  colors: PaletteColor[],
  id: string,
  hex: string,
): PaletteColor[] {
  const normalized = normalizeHex(hex);
  if (!normalized) return colors;
  return colors.map((color) =>
    color.id === id ? { ...color, hex: normalized } : color,
  );
}

export function togglePaletteLock(
  colors: PaletteColor[],
  id: string,
): PaletteColor[] {
  return colors.map((color) =>
    color.id === id ? { ...color, locked: !color.locked } : color,
  );
}

export function exportPalette(
  colors: PaletteColor[],
  format: ExportFormat,
): string {
  const hexes = colors.map((color) => color.hex);

  switch (format) {
    case "hex":
      return hexes.join("\n");
    case "rgb":
      return hexes.map((hex) => formatRgb(hex)).join("\n");
    case "css":
      return [
        ":root {",
        ...hexes.map(
          (hex, index) => `  --color-${index + 1}: ${hex};`,
        ),
        "}",
      ].join("\n");
    case "tailwind":
      return [
        "// tailwind.config.js / theme.extend.colors",
        "colors: {",
        ...hexes.map(
          (hex, index) => `  palette${index + 1}: "${hex}",`,
        ),
        "}",
      ].join("\n");
    default:
      return hexes.join("\n");
  }
}

export const EXPORT_FORMATS: Array<{
  id: ExportFormat;
  label: string;
  hint: string;
}> = [
  { id: "css", label: "CSS", hint: "Custom properties" },
  { id: "tailwind", label: "Tailwind", hint: "Theme colors" },
  { id: "hex", label: "HEX", hint: "One per line" },
  { id: "rgb", label: "RGB", hint: "One per line" },
];
