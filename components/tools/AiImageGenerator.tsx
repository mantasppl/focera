"use client";

import { useEffect, useId, useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import ImageEditorShell from "@/components/tools/ImageEditorShell";
import ImageFormatDownloadDialog from "@/components/tools/ImageFormatDownloadDialog";
import { useImageFormatDownload } from "@/components/tools/useImageFormatDownload";
import {
  AI_IMAGE_SIZES,
  AI_IMAGE_STYLES,
  MAX_AI_IMAGE_PROMPT_LENGTH,
  type AiImageSizeId,
  type AiImageStyleId,
  getAiImageSize,
  randomAiImageSeed,
  validateAiImagePrompt,
} from "@/lib/ai-image";
import { useToolAnalytics } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

const EXAMPLE_PROMPTS = [
  "A misty mountain cabin at dawn, warm window light, pine forest",
  "Minimal product shot of a teal ceramic mug on marble, soft shadows",
  "Futuristic city skyline reflected in rain-soaked streets at night",
];

export default function AiImageGenerator() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const promptId = useId();
  const sizeId = useId();
  const styleId = useId();

  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState<AiImageSizeId>("square");
  const [style, setStyle] = useState<AiImageStyleId>("auto");
  const [seed, setSeed] = useState(() => randomAiImageSeed());
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedSize = getAiImageSize(size);
  const canGenerate = prompt.trim().length > 0 && !loading;
  const hasResult = Boolean(imageUrl && imageBlob);

  const {
    formatOpen,
    setFormatOpen,
    downloading,
    downloadError,
    openDownload,
    handleFormat,
  } = useImageFormatDownload({
    getBlob: () => imageBlob,
    getFilename: () => (imageBlob ? `ai-image-${seed}` : null),
  });

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  async function generateImage(nextSeed = seed) {
    const promptError = validateAiImagePrompt(prompt);
    if (promptError) {
      setError(promptError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/ai-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          size,
          style,
          seed: nextSeed,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(
          data?.error ?? "Could not generate an image. Try again.",
        );
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      setImageUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return url;
      });
      setImageBlob(blob);
      setGeneratedPrompt(prompt.trim());
      setSeed(nextSeed);
      trackSuccess();
    } catch (err) {
      trackFailure();
      setError(
        err instanceof Error
          ? err.message
          : "Could not generate an image. Try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleRegenerate() {
    const nextSeed = randomAiImageSeed();
    setSeed(nextSeed);
    void generateImage(nextSeed);
  }

  function applyExample(example: string) {
    setPrompt(example);
    if (error) setError("");
  }

  return (
    <>
      <ImageEditorShell
        className="ai-image"
        hasSource
        stageReady={hasResult}
        loading={loading}
        loadingText="Generating your image…"
        loadingSubtext="Usually takes a few seconds. Free models can be slower when busy."
        previewTitle="Preview"
        previewMeta={
          hasResult
            ? `${selectedSize.width}×${selectedSize.height} · seed ${seed}`
            : "Enter a prompt to start"
        }
        privacyHint={
          hasResult
            ? "Generated via Focera AI"
            : "Text to image · free · no account required"
        }
        sidebar={
          <>
            <Input
              id={promptId}
              as="textarea"
              label="Prompt"
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                if (error) setError("");
              }}
              rows={5}
              maxLength={MAX_AI_IMAGE_PROMPT_LENGTH}
              placeholder="Describe the image you want — subject, setting, lighting, mood…"
              hint={`${prompt.trim().length}/${MAX_AI_IMAGE_PROMPT_LENGTH} · Be specific for better results`}
            />

            <div className="ai-image__examples" aria-label="Example prompts">
              {EXAMPLE_PROMPTS.map((example) => (
                <button
                  key={example}
                  type="button"
                  className="ai-image__example"
                  disabled={loading}
                  onClick={() => applyExample(example)}
                >
                  {example}
                </button>
              ))}
            </div>

            <div className="ai-image__options">
              <div className="ui-field">
                <span className="ui-label" id={sizeId}>
                  Size
                </span>
                <div
                  className="ai-image__chips ai-image__chips--size"
                  role="radiogroup"
                  aria-labelledby={sizeId}
                >
                  {AI_IMAGE_SIZES.map((option) => {
                    const selected = size === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className={cn(
                          "ai-image__chip",
                          selected && "is-active",
                        )}
                        disabled={loading}
                        onClick={() => setSize(option.id)}
                      >
                        <span className="ai-image__chip-label">
                          {option.label}
                        </span>
                        <span className="ai-image__chip-hint">
                          {option.hint}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="ui-field">
                <span className="ui-label" id={styleId}>
                  Style
                </span>
                <div
                  className="ai-image__chips ai-image__chips--style"
                  role="radiogroup"
                  aria-labelledby={styleId}
                >
                  {AI_IMAGE_STYLES.map((option) => {
                    const selected = style === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className={cn(
                          "ai-image__chip",
                          selected && "is-active",
                        )}
                        disabled={loading}
                        onClick={() => setStyle(option.id)}
                      >
                        <span className="ai-image__chip-label">
                          {option.label}
                        </span>
                        <span className="ai-image__chip-hint">
                          {option.hint}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        }
        sidebarFooter={
          <>
            <div className="tool-actions">
              <Button
                onClick={() => {
                  const nextSeed = randomAiImageSeed();
                  setSeed(nextSeed);
                  void generateImage(nextSeed);
                }}
                disabled={!canGenerate}
              >
                {loading ? "Generating…" : "Generate image"}
              </Button>
              <Button
                onClick={handleRegenerate}
                disabled={!prompt.trim() || loading}
                variant="ghost"
              >
                New variation
              </Button>
              {hasResult ? (
                <Button onClick={openDownload} disabled={loading}>
                  Download
                </Button>
              ) : null}
            </div>
            {error ? (
              <p className="tool-error" role="alert">
                {error}
              </p>
            ) : null}
          </>
        }
      >
        {hasResult && imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={generatedPrompt || "Generated AI image"}
            className="ai-image__preview"
            width={selectedSize.width}
            height={selectedSize.height}
          />
        ) : (
          <p className="tool-placeholder">
            Your generated image will appear here
          </p>
        )}
      </ImageEditorShell>

      <ImageFormatDownloadDialog
        open={formatOpen}
        onOpenChange={setFormatOpen}
        onSelect={handleFormat}
        downloading={downloading}
        error={downloadError}
      />
    </>
  );
}
