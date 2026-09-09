import { GlobalWorkerOptions } from "pdfjs-dist";

let configured = false;

/**
 * Safari/WebKit still lack ReadableStream async iteration through Safari 26.x.
 * pdfjs-dist getTextContent() does `for await (... of readableStream)`, which
 * throws: TypeError: undefined is not a function (near '...t of e...').
 * @see https://github.com/mozilla/pdf.js/issues/21557
 */
function polyfillReadableStreamAsyncIterator() {
  if (typeof ReadableStream === "undefined") return;

  const proto = ReadableStream.prototype as ReadableStream & {
    [Symbol.asyncIterator]?: <T>() => AsyncIterableIterator<T>;
  };

  if (typeof proto[Symbol.asyncIterator] === "function") return;

  proto[Symbol.asyncIterator] = async function* <T>(
    this: ReadableStream<T>,
  ): AsyncGenerator<T> {
    const reader = this.getReader();
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) return;
        yield value as T;
      }
    } finally {
      reader.releaseLock();
    }
  };
}

/** Configure pdf.js worker + Safari stream polyfill. Safe to call repeatedly. */
export function ensurePdfjs() {
  if (configured || typeof window === "undefined") return;
  polyfillReadableStreamAsyncIterator();
  GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  configured = true;
}
