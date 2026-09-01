let previewPrepare: Promise<void> = Promise.resolve();
let settlePreviewPrepare: (() => void) | null = null;

/** Hold heavy AI work until the loading preview has painted a small thumbnail. */
export function beginPreviewPrepare(): () => void {
  let settled = false;
  const settle = () => {
    if (settled) return;
    settled = true;
    settlePreviewPrepare?.();
  };

  previewPrepare = new Promise<void>((resolve) => {
    settlePreviewPrepare = resolve;
  });

  const timeout = window.setTimeout(settle, 2000);
  return () => {
    window.clearTimeout(timeout);
    settle();
  };
}

export function waitForPreviewPrepare(): Promise<void> {
  return previewPrepare;
}
