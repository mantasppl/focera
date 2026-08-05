/** Map internal/upstream errors to safe client-facing messages. */
export function publicErrorMessage(
  err: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (!(err instanceof Error)) return fallback;
  const message = err.message.trim();
  if (!message) return fallback;

  // Never leak secrets, env names, or stack-like internals.
  if (
    /api[_-]?key|secret|token|password|authorization|groq|pollinations|resend|stack|ECONN|ENOENT|sqlite|libsql|puppeteer|chromium|chrome-headless/i.test(
      message,
    )
  ) {
    return fallback;
  }

  // Allow short, intentional user-facing errors from our own throw sites.
  if (message.length <= 180 && !/[\\/]/.test(message)) {
    return message;
  }

  return fallback;
}
