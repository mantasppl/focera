export const AI_IMAGE_SIZES = [
  {
    id: "square",
    label: "Square",
    hint: "1:1",
    width: 1024,
    height: 1024,
  },
  {
    id: "landscape",
    label: "Landscape",
    hint: "16:9",
    width: 1280,
    height: 720,
  },
  {
    id: "portrait",
    label: "Portrait",
    hint: "9:16",
    width: 720,
    height: 1280,
  },
  {
    id: "photo",
    label: "Photo",
    hint: "4:3",
    width: 1024,
    height: 768,
  },
] as const;

export type AiImageSizeId = (typeof AI_IMAGE_SIZES)[number]["id"];

export const AI_IMAGE_STYLES = [
  { id: "auto", label: "Auto", hint: "Model default", suffix: "" },
  {
    id: "photo",
    label: "Photo",
    hint: "Realistic",
    suffix: "photorealistic photograph, natural lighting, highly detailed",
  },
  {
    id: "illustration",
    label: "Illustration",
    hint: "Drawn",
    suffix: "detailed illustration, clean lines, vibrant colors",
  },
  {
    id: "digital-art",
    label: "Digital art",
    hint: "Concept",
    suffix: "digital art, cinematic lighting, sharp focus, artstation quality",
  },
  {
    id: "anime",
    label: "Anime",
    hint: "Anime style",
    suffix: "anime style, expressive eyes, clean cel shading",
  },
  {
    id: "3d",
    label: "3D render",
    hint: "CGI",
    suffix: "3D render, octane style, soft global illumination",
  },
] as const;

export type AiImageStyleId = (typeof AI_IMAGE_STYLES)[number]["id"];

export const MAX_AI_IMAGE_PROMPT_LENGTH = 800;
export const MIN_AI_IMAGE_PROMPT_LENGTH = 3;

export type AiImageGenerateInput = {
  prompt: string;
  size: AiImageSizeId;
  style: AiImageStyleId;
  seed: number;
};

export function getAiImageSize(id: AiImageSizeId) {
  return AI_IMAGE_SIZES.find((size) => size.id === id) ?? AI_IMAGE_SIZES[0];
}

export function getAiImageStyle(id: AiImageStyleId) {
  return AI_IMAGE_STYLES.find((style) => style.id === id) ?? AI_IMAGE_STYLES[0];
}

export function normalizeAiImagePrompt(prompt: string): string {
  return prompt.trim().replace(/\s+/g, " ");
}

export function validateAiImagePrompt(prompt: string): string | null {
  const value = normalizeAiImagePrompt(prompt);

  if (value.length < MIN_AI_IMAGE_PROMPT_LENGTH) {
    return "Enter a short description of the image you want.";
  }

  if (value.length > MAX_AI_IMAGE_PROMPT_LENGTH) {
    return `Keep prompts under ${MAX_AI_IMAGE_PROMPT_LENGTH} characters.`;
  }

  return null;
}

export function buildAiImagePrompt(
  prompt: string,
  styleId: AiImageStyleId,
): string {
  const normalized = normalizeAiImagePrompt(prompt);
  const style = getAiImageStyle(styleId);

  if (!style.suffix) return normalized;
  return `${normalized}, ${style.suffix}`;
}

export function randomAiImageSeed(): number {
  return Math.floor(Math.random() * 1_000_000_000);
}

export function isAiImageSizeId(value: unknown): value is AiImageSizeId {
  return (
    typeof value === "string" &&
    AI_IMAGE_SIZES.some((size) => size.id === value)
  );
}

export function isAiImageStyleId(value: unknown): value is AiImageStyleId {
  return (
    typeof value === "string" &&
    AI_IMAGE_STYLES.some((style) => style.id === value)
  );
}
