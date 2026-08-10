import { assessContrast, normalizeHex, type ContrastResult } from "@/lib/color-palette";

export type QrContentType =
  | "url"
  | "text"
  | "wifi"
  | "vcard"
  | "email"
  | "phone"
  | "sms"
  | "calendar"
  | "geo"
  | "app";

export type QrEccLevel = "L" | "M" | "Q" | "H";
export type QrModuleStyle = "square" | "rounded" | "dots";
export type QrEyeStyle = "square" | "rounded" | "leaf";
export type QrFrameStyle = "none" | "simple" | "badge";
export type QrLogoShape = "square" | "rounded" | "circle";
export type QrAppPlatform = "ios" | "android" | "custom";
export type QrPreviewBackground = "stage" | "white" | "dark" | "warm" | "photo";

export type WifiForm = {
  ssid: string;
  password: string;
  encryption: "WPA" | "WEP" | "nopass";
  hidden: boolean;
};

export type VCardForm = {
  firstName: string;
  lastName: string;
  organization: string;
  phone: string;
  email: string;
  url: string;
};

export type EmailForm = {
  address: string;
  subject: string;
  body: string;
};

export type SmsForm = {
  phone: string;
  message: string;
};

export type CalendarForm = {
  title: string;
  location: string;
  description: string;
  start: string;
  end: string;
};

export type GeoForm = {
  latitude: string;
  longitude: string;
  label: string;
};

export type AppForm = {
  platform: QrAppPlatform;
  iosUrl: string;
  androidUrl: string;
  customUrl: string;
};

export type QrContentState = {
  type: QrContentType;
  url: string;
  text: string;
  wifi: WifiForm;
  vcard: VCardForm;
  email: EmailForm;
  phone: string;
  sms: SmsForm;
  calendar: CalendarForm;
  geo: GeoForm;
  app: AppForm;
};

export type QrDesignSettings = {
  darkColor: string;
  lightColor: string;
  eyeColor: string;
  gradientEnabled: boolean;
  gradientColor: string;
  transparentBackground: boolean;
  size: number;
  margin: number;
  ecc: QrEccLevel;
  moduleStyle: QrModuleStyle;
  eyeStyle: QrEyeStyle;
  frameStyle: QrFrameStyle;
  frameLabel: string;
  logoShape: QrLogoShape;
  logoSizePercent: number;
  logoPad: boolean;
};

export type QrHistoryItem = {
  id: string;
  createdAt: number;
  type: QrContentType;
  payload: string;
  label: string;
  design: QrDesignSettings;
  content: QrContentState;
};

export type QrDesignTemplate = {
  id: string;
  label: string;
  description: string;
  contentType: QrContentType;
  design: Partial<QrDesignSettings>;
  contentPatch?: Partial<QrContentState>;
};

export const QR_CONTENT_TYPES: Array<{
  id: QrContentType;
  label: string;
}> = [
  { id: "url", label: "URL" },
  { id: "text", label: "Text" },
  { id: "wifi", label: "Wi‑Fi" },
  { id: "vcard", label: "vCard" },
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
  { id: "sms", label: "SMS" },
  { id: "calendar", label: "Event" },
  { id: "geo", label: "Geo" },
  { id: "app", label: "App" },
];

export const QR_SIZE_PRESETS = [256, 512, 1024] as const;
export const QR_ECC_LEVELS: QrEccLevel[] = ["L", "M", "Q", "H"];
export const QR_MODULE_STYLES: Array<{ id: QrModuleStyle; label: string }> = [
  { id: "square", label: "Square" },
  { id: "rounded", label: "Rounded" },
  { id: "dots", label: "Dots" },
];
export const QR_EYE_STYLES: Array<{ id: QrEyeStyle; label: string }> = [
  { id: "square", label: "Square" },
  { id: "rounded", label: "Rounded" },
  { id: "leaf", label: "Leaf" },
];
export const QR_FRAME_STYLES: Array<{ id: QrFrameStyle; label: string }> = [
  { id: "none", label: "None" },
  { id: "simple", label: "Simple" },
  { id: "badge", label: "Badge" },
];
export const QR_LOGO_SHAPES: Array<{ id: QrLogoShape; label: string }> = [
  { id: "square", label: "Square" },
  { id: "rounded", label: "Rounded" },
  { id: "circle", label: "Circle" },
];
export const QR_PREVIEW_BACKGROUNDS: Array<{
  id: QrPreviewBackground;
  label: string;
}> = [
  { id: "stage", label: "Default" },
  { id: "white", label: "White" },
  { id: "dark", label: "Dark" },
  { id: "warm", label: "Warm" },
  { id: "photo", label: "Photo" },
];

export const DEFAULT_QR_DESIGN: QrDesignSettings = {
  darkColor: "#0B3B36",
  lightColor: "#F4FBF8",
  eyeColor: "#0F7A66",
  gradientEnabled: true,
  gradientColor: "#0F7A66",
  transparentBackground: false,
  size: 512,
  margin: 2,
  ecc: "M",
  moduleStyle: "rounded",
  eyeStyle: "rounded",
  frameStyle: "none",
  frameLabel: "Scan me",
  logoShape: "rounded",
  logoSizePercent: 22,
  logoPad: true,
};

export const DEFAULT_QR_CONTENT: QrContentState = {
  type: "url",
  url: "https://",
  text: "",
  wifi: {
    ssid: "",
    password: "",
    encryption: "WPA",
    hidden: false,
  },
  vcard: {
    firstName: "",
    lastName: "",
    organization: "",
    phone: "",
    email: "",
    url: "",
  },
  email: {
    address: "",
    subject: "",
    body: "",
  },
  phone: "",
  sms: {
    phone: "",
    message: "",
  },
  calendar: {
    title: "",
    location: "",
    description: "",
    start: "",
    end: "",
  },
  geo: {
    latitude: "",
    longitude: "",
    label: "",
  },
  app: {
    platform: "ios",
    iosUrl: "https://apps.apple.com/app/id",
    androidUrl: "https://play.google.com/store/apps/details?id=",
    customUrl: "https://",
  },
};

export const QR_DESIGN_TEMPLATES: QrDesignTemplate[] = [
  {
    id: "wifi-card",
    label: "Wi‑Fi card",
    description: "Guest network poster style",
    contentType: "wifi",
    design: {
      darkColor: "#0B3B4A",
      lightColor: "#F3FAFC",
      eyeColor: "#0F7A66",
      moduleStyle: "rounded",
      eyeStyle: "rounded",
      frameStyle: "badge",
      frameLabel: "Wi‑Fi",
      size: 512,
      ecc: "M",
    },
    contentPatch: {
      wifi: {
        ssid: "Guest Wi‑Fi",
        password: "",
        encryption: "WPA",
        hidden: false,
      },
    },
  },
  {
    id: "menu",
    label: "Menu",
    description: "Restaurant / cafe link",
    contentType: "url",
    design: {
      darkColor: "#1C1917",
      lightColor: "#FFFBEB",
      eyeColor: "#B45309",
      moduleStyle: "dots",
      eyeStyle: "rounded",
      frameStyle: "simple",
      frameLabel: "Menu",
      size: 512,
    },
    contentPatch: {
      url: "https://",
    },
  },
  {
    id: "business-card",
    label: "Business card",
    description: "Compact vCard contact",
    contentType: "vcard",
    design: {
      darkColor: "#111827",
      lightColor: "#F8FAFC",
      eyeColor: "#111827",
      moduleStyle: "square",
      eyeStyle: "square",
      frameStyle: "none",
      size: 384,
      margin: 2,
      ecc: "Q",
    },
  },
  {
    id: "event",
    label: "Event poster",
    description: "Calendar invite style",
    contentType: "calendar",
    design: {
      darkColor: "#312E81",
      lightColor: "#EEF2FF",
      eyeColor: "#4F46E5",
      gradientEnabled: true,
      gradientColor: "#7C3AED",
      moduleStyle: "rounded",
      eyeStyle: "leaf",
      frameStyle: "badge",
      frameLabel: "Add event",
      size: 640,
    },
  },
];

const PRESET_KEY = "focera.qr.design-preset";
const HISTORY_KEY = "focera.qr.history";
const MAX_HISTORY = 8;

function escapeWifiValue(value: string): string {
  return value.replace(/([\\;,:"])/g, "\\$1");
}

function escapeIcalText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function toIcalDate(value: string): string | null {
  if (!value.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

export function buildQrPayload(content: QrContentState): string {
  switch (content.type) {
    case "url":
      return content.url.trim();
    case "text":
      return content.text.trim();
    case "wifi": {
      const ssid = escapeWifiValue(content.wifi.ssid.trim());
      if (!ssid) return "";
      const encryption =
        content.wifi.encryption === "nopass" ? "nopass" : content.wifi.encryption;
      const password =
        encryption === "nopass" ? "" : escapeWifiValue(content.wifi.password);
      const hidden = content.wifi.hidden ? "H:true;" : "";
      return `WIFI:T:${encryption};S:${ssid};P:${password};${hidden};`;
    }
    case "vcard": {
      const { firstName, lastName, organization, phone, email, url } =
        content.vcard;
      const fn = `${firstName} ${lastName}`.trim();
      if (!fn && !organization.trim() && !phone.trim() && !email.trim()) {
        return "";
      }
      const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${lastName.trim()};${firstName.trim()};;;`,
        `FN:${fn || organization.trim() || email.trim() || phone.trim()}`,
      ];
      if (organization.trim()) lines.push(`ORG:${organization.trim()}`);
      if (phone.trim()) lines.push(`TEL;TYPE=CELL:${phone.trim()}`);
      if (email.trim()) lines.push(`EMAIL:${email.trim()}`);
      if (url.trim()) lines.push(`URL:${url.trim()}`);
      lines.push("END:VCARD");
      return lines.join("\n");
    }
    case "email": {
      const address = content.email.address.trim();
      if (!address) return "";
      const params = new URLSearchParams();
      if (content.email.subject.trim()) {
        params.set("subject", content.email.subject.trim());
      }
      if (content.email.body.trim()) {
        params.set("body", content.email.body.trim());
      }
      const query = params.toString();
      return query ? `mailto:${address}?${query}` : `mailto:${address}`;
    }
    case "phone": {
      const phone = content.phone.trim();
      return phone ? `tel:${phone}` : "";
    }
    case "sms": {
      const phone = content.sms.phone.trim();
      if (!phone) return "";
      const message = content.sms.message.trim();
      return message ? `SMSTO:${phone}:${message}` : `SMSTO:${phone}`;
    }
    case "calendar": {
      const title = content.calendar.title.trim();
      const start = toIcalDate(content.calendar.start);
      const end = toIcalDate(content.calendar.end) || start;
      if (!title || !start) return "";
      const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "BEGIN:VEVENT",
        `SUMMARY:${escapeIcalText(title)}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
      ];
      if (content.calendar.location.trim()) {
        lines.push(
          `LOCATION:${escapeIcalText(content.calendar.location.trim())}`,
        );
      }
      if (content.calendar.description.trim()) {
        lines.push(
          `DESCRIPTION:${escapeIcalText(content.calendar.description.trim())}`,
        );
      }
      lines.push("END:VEVENT", "END:VCALENDAR");
      return lines.join("\n");
    }
    case "geo": {
      const lat = Number.parseFloat(content.geo.latitude.trim());
      const lng = Number.parseFloat(content.geo.longitude.trim());
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return "";
      const label = content.geo.label.trim();
      return label
        ? `geo:${lat},${lng}?q=${encodeURIComponent(label)}`
        : `geo:${lat},${lng}`;
    }
    case "app": {
      if (content.app.platform === "ios") return content.app.iosUrl.trim();
      if (content.app.platform === "android") {
        return content.app.androidUrl.trim();
      }
      return content.app.customUrl.trim();
    }
    default:
      return "";
  }
}

export function isValidQrPayload(
  content: QrContentState,
  payload: string,
): boolean {
  if (!payload) return false;
  if (content.type === "url" || content.type === "app") {
    if (payload === "https://" || payload === "http://") return false;
    if (payload.endsWith("/app/id") || payload.endsWith("details?id=")) {
      return false;
    }
  }
  return true;
}

export function payloadLabel(content: QrContentState, payload: string): string {
  switch (content.type) {
    case "url":
    case "app":
      try {
        return new URL(payload).hostname || content.type;
      } catch {
        return content.type;
      }
    case "text":
      return payload.slice(0, 24) || "text";
    case "wifi":
      return content.wifi.ssid.trim() || "wifi";
    case "vcard": {
      const name =
        `${content.vcard.firstName} ${content.vcard.lastName}`.trim() ||
        content.vcard.organization.trim();
      return name || "vcard";
    }
    case "email":
      return content.email.address.trim() || "email";
    case "phone":
      return content.phone.trim() || "phone";
    case "sms":
      return content.sms.phone.trim() || "sms";
    case "calendar":
      return content.calendar.title.trim() || "event";
    case "geo":
      return content.geo.label.trim() || "geo";
    default:
      return "qr";
  }
}

export function qrDownloadBasename(
  content: QrContentState,
  payload: string,
): string {
  const raw = payloadLabel(content, payload)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${raw || content.type}-qr`;
}

export function effectiveEcc(
  design: QrDesignSettings,
  hasLogo: boolean,
): QrEccLevel {
  if (hasLogo && design.ecc !== "H") return "H";
  return design.ecc;
}

export function assessQrContrast(
  darkColor: string,
  lightColor: string,
  transparentBackground: boolean,
): ContrastResult | null {
  if (transparentBackground) return null;
  const dark = normalizeHex(darkColor);
  const light = normalizeHex(lightColor);
  if (!dark || !light) return null;
  return assessContrast(dark, light);
}

export function printSizeHint(sizePx: number): string {
  const inches = sizePx / 300;
  const cm = inches * 2.54;
  const useCase =
    cm < 3
      ? "business cards / small stickers"
      : cm < 6
        ? "flyers / packaging"
        : "posters / signage";
  return `${cm.toFixed(1)} cm (${inches.toFixed(2)} in) at 300 DPI · good for ${useCase}`;
}

export function printSizeMm(sizePx: number, dpi = 300): number {
  return (sizePx / dpi) * 25.4;
}

export function createHistoryId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `qr-${Date.now().toString(36)}`;
}

export function applyDesignTemplate(
  template: QrDesignTemplate,
  current: QrContentState,
): { design: QrDesignSettings; content: QrContentState } {
  return {
    design: {
      ...DEFAULT_QR_DESIGN,
      ...template.design,
      eyeColor:
        template.design.eyeColor ??
        template.design.darkColor ??
        DEFAULT_QR_DESIGN.eyeColor,
    },
    content: {
      ...current,
      ...template.contentPatch,
      type: template.contentType,
      wifi: {
        ...current.wifi,
        ...(template.contentPatch?.wifi ?? {}),
      },
      vcard: {
        ...current.vcard,
        ...(template.contentPatch?.vcard ?? {}),
      },
      calendar: {
        ...current.calendar,
        ...(template.contentPatch?.calendar ?? {}),
      },
      url: template.contentPatch?.url ?? current.url,
    },
  };
}

export function contentFromDecodedPayload(payload: string): QrContentState {
  const trimmed = payload.trim();
  const base = { ...DEFAULT_QR_CONTENT };

  if (
    /^WIFI:/i.test(trimmed) ||
    /^BEGIN:VCARD/i.test(trimmed) ||
    /^BEGIN:VCALENDAR/i.test(trimmed)
  ) {
    return { ...base, type: "text", text: trimmed };
  }
  if (/^mailto:/i.test(trimmed)) {
    return {
      ...base,
      type: "email",
      email: {
        address: trimmed.replace(/^mailto:/i, "").split("?")[0] ?? "",
        subject: "",
        body: "",
      },
    };
  }
  if (/^tel:/i.test(trimmed)) {
    return { ...base, type: "phone", phone: trimmed.replace(/^tel:/i, "") };
  }
  if (/^SMSTO:/i.test(trimmed) || /^sms:/i.test(trimmed)) {
    return { ...base, type: "text", text: trimmed };
  }
  if (/^geo:/i.test(trimmed)) {
    const match = /^geo:(-?\d+(\.\d+)?),(-?\d+(\.\d+)?)/i.exec(trimmed);
    if (match) {
      return {
        ...base,
        type: "geo",
        geo: {
          latitude: match[1],
          longitude: match[3],
          label: "",
        },
      };
    }
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return { ...base, type: "url", url: trimmed };
  }
  return { ...base, type: "text", text: trimmed };
}

function normalizeDesign(parsed: Partial<QrDesignSettings>): QrDesignSettings {
  const dark =
    normalizeHex(parsed.darkColor ?? "") ?? DEFAULT_QR_DESIGN.darkColor;
  return {
    ...DEFAULT_QR_DESIGN,
    ...parsed,
    darkColor: dark,
    lightColor:
      normalizeHex(parsed.lightColor ?? "") ?? DEFAULT_QR_DESIGN.lightColor,
    eyeColor: normalizeHex(parsed.eyeColor ?? "") ?? dark,
    gradientColor:
      normalizeHex(parsed.gradientColor ?? "") ?? DEFAULT_QR_DESIGN.gradientColor,
    gradientEnabled: Boolean(parsed.gradientEnabled),
    transparentBackground: Boolean(parsed.transparentBackground),
    size: clampSize(parsed.size ?? DEFAULT_QR_DESIGN.size),
    margin: clampMargin(parsed.margin ?? DEFAULT_QR_DESIGN.margin),
    ecc: isEcc(parsed.ecc) ? parsed.ecc : DEFAULT_QR_DESIGN.ecc,
    moduleStyle: isModuleStyle(parsed.moduleStyle)
      ? parsed.moduleStyle
      : DEFAULT_QR_DESIGN.moduleStyle,
    eyeStyle: isEyeStyle(parsed.eyeStyle)
      ? parsed.eyeStyle
      : DEFAULT_QR_DESIGN.eyeStyle,
    frameStyle: isFrameStyle(parsed.frameStyle)
      ? parsed.frameStyle
      : DEFAULT_QR_DESIGN.frameStyle,
    frameLabel:
      typeof parsed.frameLabel === "string" && parsed.frameLabel.trim()
        ? parsed.frameLabel.slice(0, 32)
        : DEFAULT_QR_DESIGN.frameLabel,
    logoShape: isLogoShape(parsed.logoShape)
      ? parsed.logoShape
      : DEFAULT_QR_DESIGN.logoShape,
    logoSizePercent: clampLogoSize(
      parsed.logoSizePercent ?? DEFAULT_QR_DESIGN.logoSizePercent,
    ),
    logoPad: parsed.logoPad !== false,
  };
}

export function loadDesignPreset(): QrDesignSettings | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PRESET_KEY);
    if (!raw) return null;
    return normalizeDesign(JSON.parse(raw) as Partial<QrDesignSettings>);
  } catch {
    return null;
  }
}

export function saveDesignPreset(design: QrDesignSettings): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PRESET_KEY, JSON.stringify(design));
}

export function loadQrHistory(): QrHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as QrHistoryItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, MAX_HISTORY);
  } catch {
    return [];
  }
}

export function pushQrHistory(item: QrHistoryItem): QrHistoryItem[] {
  const next = [
    item,
    ...loadQrHistory().filter((entry) => entry.payload !== item.payload),
  ].slice(0, MAX_HISTORY);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  }
  return next;
}

export function clearQrHistory(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(HISTORY_KEY);
}

export function parseBatchLines(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(
      (line) => line.length > 0 && line !== "https://" && line !== "http://",
    );
}

function clampSize(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_QR_DESIGN.size;
  return Math.min(2048, Math.max(128, Math.round(value)));
}

function clampMargin(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_QR_DESIGN.margin;
  return Math.min(8, Math.max(0, Math.round(value)));
}

function clampLogoSize(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_QR_DESIGN.logoSizePercent;
  return Math.min(30, Math.max(12, Math.round(value)));
}

function isEcc(value: unknown): value is QrEccLevel {
  return value === "L" || value === "M" || value === "Q" || value === "H";
}

function isModuleStyle(value: unknown): value is QrModuleStyle {
  return value === "square" || value === "rounded" || value === "dots";
}

function isEyeStyle(value: unknown): value is QrEyeStyle {
  return value === "square" || value === "rounded" || value === "leaf";
}

function isFrameStyle(value: unknown): value is QrFrameStyle {
  return value === "none" || value === "simple" || value === "badge";
}

function isLogoShape(value: unknown): value is QrLogoShape {
  return value === "square" || value === "rounded" || value === "circle";
}
