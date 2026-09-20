export const CHILDHOOD_MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export const CHILDHOOD_PRESETS = [
  {
    id: "90s_family",
    label: "90s family",
    hint: "Album flash",
    prompt:
      "Preserve the exact same person, face, and identity. Transform into a nostalgic 1990s family photo. Use direct flash, warm tones, slight overexposure, film grain, and imperfect composition. Make it look like a real childhood memory from a family album.",
  },
  {
    id: "school",
    label: "School portrait",
    hint: "1995 yearbook",
    prompt:
      "Preserve the same person and face. Turn into a 90s school portrait with studio lighting, simple background, soft smile, vintage tones, and slight grain. Make it feel like a printed school photo from 1995.",
  },
  {
    id: "disposable",
    label: "Disposable cam",
    hint: "Early 2000s",
    prompt:
      "Preserve the same person identity. Make it look like a disposable camera photo from early 2000s. Add strong flash, motion blur, grain, noise, and imperfect framing.",
  },
] as const;

export type ChildhoodPresetId = (typeof CHILDHOOD_PRESETS)[number]["id"];

export function isChildhoodPresetId(
  value: unknown,
): value is ChildhoodPresetId {
  return (
    typeof value === "string" &&
    CHILDHOOD_PRESETS.some((preset) => preset.id === value)
  );
}

export function getChildhoodPreset(id: ChildhoodPresetId) {
  return CHILDHOOD_PRESETS.find((preset) => preset.id === id)!;
}

export type ChildhoodGenerateResult = {
  imageUrl: string;
  blob: Blob;
  preset: ChildhoodPresetId;
};

export async function generateChildhoodPhoto(
  file: File,
  preset: ChildhoodPresetId,
  signal?: AbortSignal,
): Promise<ChildhoodGenerateResult> {
  const form = new FormData();
  form.append("image", file);
  form.append("preset", preset);

  const response = await fetch("/api/childhood", {
    method: "POST",
    body: form,
    signal,
  });

  const contentType = response.headers.get("content-type") ?? "";

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(
      data?.error ?? "Could not generate a childhood photo. Try again.",
    );
  }

  if (!contentType.startsWith("image/")) {
    const data = (await response.json().catch(() => null)) as {
      error?: string;
      imageUrl?: string;
    } | null;

    // Backward compatible with older JSON { imageUrl } responses.
    if (data?.imageUrl) {
      const imageResponse = await fetch(data.imageUrl, { signal });
      if (!imageResponse.ok) {
        throw new Error("Could not download the generated photo. Try again.");
      }
      const blob = await imageResponse.blob();
      if (blob.size < 1_000) {
        throw new Error("The generated photo looked empty. Try again.");
      }
      return {
        imageUrl: data.imageUrl,
        blob,
        preset,
      };
    }

    throw new Error(
      data?.error ?? "Could not generate a childhood photo. Try again.",
    );
  }

  const blob = await response.blob();
  if (blob.size < 1_000) {
    throw new Error("The generated photo looked empty. Try again.");
  }

  return {
    imageUrl: "",
    blob,
    preset,
  };
}
