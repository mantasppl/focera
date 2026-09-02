import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "font-src 'self' data:",
  // Next.js / GA / Clarity / inline styles used across tool UIs.
  // blob: — @imgly/background-removal loads onnxruntime WASM via blob: module URLs.
  // wasm-unsafe-eval — required to compile/instantiate WebAssembly under CSP.
  // unsafe-eval — required by onnxruntime-web / @imgly image decode (new Function).
  //   Also needed in production for background-remover, change-background, colorize-photo.
  // Clarity — www/scripts/*.clarity.ms plus c.bing.com (Microsoft identity endpoint).
  "script-src 'self' 'unsafe-inline' blob: 'wasm-unsafe-eval' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://www.clarity.ms https://scripts.clarity.ms https://*.clarity.ms https://c.bing.com",
  "style-src 'self' 'unsafe-inline'",
  // blob: — onnxruntime fetches WASM/JS glue via blob: URLs created by @imgly/background-removal.
  "connect-src 'self' blob: https://www.google-analytics.com https://region1.google-analytics.com https://image.pollinations.ai https://text.pollinations.ai https://api.groq.com https:",
  "worker-src 'self' blob:",
  "child-src 'self' blob:",
  "frame-src 'self' blob:",
  ...(isProd ? ["upgrade-insecure-requests"] : []),
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  serverExternalPackages: ["puppeteer", "@libsql/client"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      {
        source: "/image-converter",
        destination: "/png-to-jpg",
        permanent: true,
      },
      {
        source: "/password-checker",
        destination: "/password-generator",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          ...(isProd
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
              ]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
