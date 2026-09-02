export const PRODUCT_DOWNLOAD_EVENT = "focera:product-download";

/** Fire after a finished product file is saved to the user's device. */
export function notifyProductDownload(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PRODUCT_DOWNLOAD_EVENT));
}
