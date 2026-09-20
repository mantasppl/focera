export const CHILDHOOD_MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export const CHILDHOOD_NEGATIVE_PROMPT =
  "blurry face, distorted face, different person, deformed eyes, unrealistic skin, AI generated look, cartoon, painting, illustration, extra fingers, bad anatomy";

/** Scene hints sent to Groq before prompt generation. */
export const CHILDHOOD_SCENE_HINTS = {
  "90s_family": "casual home environment, family album, indoor, warm tones",
  school: "studio portrait, simple background, school photo",
  disposable: "random candid shot, early 2000s, messy framing",
} as const;

export const CHILDHOOD_PRESETS = [
  {
    id: "90s_family",
    label: "90s family",
    hint: "Album flash",
    sceneHint: CHILDHOOD_SCENE_HINTS["90s_family"],
  },
  {
    id: "school",
    label: "School portrait",
    hint: "1995 yearbook",
    sceneHint: CHILDHOOD_SCENE_HINTS.school,
  },
  {
    id: "disposable",
    label: "Disposable cam",
    hint: "Early 2000s",
    sceneHint: CHILDHOOD_SCENE_HINTS.disposable,
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

  const data = (await response.json().catch(() => null)) as {
    imageUrl?: string;
    error?: string;
  } | null;

  if (!response.ok) {
    throw new Error(
      data?.error ?? "Could not generate a childhood photo. Try again.",
    );
  }

  if (!data?.imageUrl) {
    throw new Error("Could not generate a childhood photo. Try again.");
  }

  // data: URIs and most Replicate delivery URLs can be fetched in-browser.
  const imageResponse = await fetch(data.imageUrl, { signal });
  if (!imageResponse.ok) {
    return {
      imageUrl: data.imageUrl,
      blob: new Blob(),
      preset,
    };
  }

  const blob = await imageResponse.blob();
  return {
    imageUrl: data.imageUrl,
    blob: blob.size >= 1_000 ? blob : new Blob(),
    preset,
  };
}
