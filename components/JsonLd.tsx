type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

function safeJsonLd(data: JsonLdProps["data"]): string {
  // Prevent </script> breakout inside JSON-LD script tags.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  );
}
