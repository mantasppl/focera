import type { ReactElement } from "react";

type BrandMarkImageOptions = {
  /** Apple home-screen icons should be full-bleed; iOS applies its own mask. */
  rounded?: boolean;
};

/** Raster Focera mark for generated apple-touch icons. Coordinates match `app/icon.svg`. */
export function brandMarkImage(
  size: number,
  { rounded = true }: BrandMarkImageOptions = {},
): ReactElement {
  const s = (n: number) => Math.round((n / 32) * size);
  const barRadius = Math.max(2, s(1.8));

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: "linear-gradient(145deg, #2dd4bf 0%, #0f766e 100%)",
        borderRadius: rounded ? s(8) : 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: s(7.5),
          top: s(7),
          width: s(6.5),
          height: s(18),
          borderRadius: barRadius,
          background: "#ffffff",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: s(7.5),
          top: s(7),
          width: s(17),
          height: s(6.5),
          borderRadius: barRadius,
          background: "#ffffff",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: s(7.5),
          top: s(14.25),
          width: s(11.5),
          height: s(6.5),
          borderRadius: barRadius,
          background: "#ffffff",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: s(19.8),
          top: s(14.15),
          width: s(6.7),
          height: s(6.7),
          borderRadius: s(6.7),
          background: "#ccfbf1",
        }}
      />
    </div>
  );
}
