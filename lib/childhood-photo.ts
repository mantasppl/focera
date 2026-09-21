export const CHILDHOOD_MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export const CHILDHOOD_NEGATIVE_PROMPT =
  "different person, changed face, new identity, distorted face, deformed eyes, deformed nose, deformed lips, wrong face shape, blurry face, unrealistic skin, AI generated look, cinematic, perfect studio lighting, cartoon, painting, illustration, extra fingers, bad anatomy";

/** Scene blocks embedded in the childhood generation script. */
export const CHILDHOOD_SCENE_HINTS = {
  "90s_family":
    "A highly realistic 1998 indoor family living room in Eastern Europe. Old CRT TV in the background, wooden furniture, patterned carpet, warm tungsten lighting. Slightly messy environment, authentic 90s household.",
  school:
    "A highly realistic mid-1990s school portrait studio. Plain mottled blue-grey backdrop, even overhead lights, yearbook head-and-shoulders framing, slightly stiff pose, authentic school-photo look.",
  disposable:
    "A highly realistic early-2000s candid outdoor or hallway snapshot. Messy framing, accidental crop, harsh on-camera flash, ordinary everyday background, authentic disposable-camera energy.",
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

/** Only allow proxying Replicate-hosted delivery URLs. */
export function isAllowedResultUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    return (
      host === "replicate.delivery" ||
      host.endsWith(".replicate.delivery") ||
      host === "pbxt.replicate.delivery"
    );
  } catch {
    return false;
  }
}

export type ChildhoodGenerateResult = {
  imageUrl: string;
  blob: Blob;
  preset: ChildhoodPresetId;
};

async function readErrorMessage(response: Response): Promise<string | null> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const data = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    return data?.error?.trim() || null;
  }
  return null;
}

async function fetchResultBlob(
  imageUrl: string,
  signal?: AbortSignal,
): Promise<Blob> {
  if (/^https?:\/\//i.test(imageUrl)) {
    const proxy = await fetch("/api/childhood/proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: imageUrl }),
      signal,
    });
    if (proxy.ok) {
      const blob = await proxy.blob();
      if (blob.size >= 1_000) return blob;
    }
  }

  const direct = await fetch(imageUrl, { signal });
  if (!direct.ok) {
    throw new Error("Could not download the generated photo. Try again.");
  }
  const blob = await direct.blob();
  if (blob.size < 1_000) {
    throw new Error("The generated photo looked empty. Try again.");
  }
  return blob;
}

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

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new Error(
      message ??
        `Could not generate a childhood photo. Try again. (${response.status})`,
    );
  }

  const data = (await response.json().catch(() => null)) as {
    imageUrl?: string;
    error?: string;
  } | null;

  if (!data?.imageUrl) {
    throw new Error(
      data?.error ??
        "Could not generate a childhood photo. The server returned an empty result.",
    );
  }

  const blob = await fetchResultBlob(data.imageUrl, signal);

  return {
    imageUrl: data.imageUrl,
    blob,
    preset,
  };
}
