import type { ImageNicheId } from "@/data/image-niches";

type ImageNicheIconProps = {
  niche: ImageNicheId;
  className?: string;
};

export default function ImageNicheIcon({
  niche,
  className = "image-niche__svg",
}: ImageNicheIconProps) {
  const common = {
    className,
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": true as const,
  };

  switch (niche) {
    case "edit-image":
      return (
        <svg {...common}>
          <rect
            x="3.6"
            y="5.2"
            width="16.8"
            height="13.6"
            rx="2.2"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M8 15.4 10.2 12l2.1 2.1 1.8-2.3L16.8 15.4"
            stroke="currentColor"
            strokeWidth="1.55"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14.4 8.15 17.7 5.7l1.55 1.7-3.25 2.4-.8-.85Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "change-image-format":
      return (
        <svg {...common}>
          <rect
            x="3.4"
            y="4.6"
            width="7.6"
            height="9.2"
            rx="1.6"
            stroke="currentColor"
            strokeWidth="1.55"
          />
          <rect
            x="13"
            y="10.2"
            width="7.6"
            height="9.2"
            rx="1.6"
            stroke="currentColor"
            strokeWidth="1.55"
          />
          <path
            d="M12.2 8.2h2.4M14.6 8.2 13.2 6.7M14.6 8.2 13.2 9.7M11.8 15.8H9.4M9.4 15.8 10.8 14.3M9.4 15.8 10.8 17.3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "size-color-text":
      return (
        <svg {...common}>
          <circle
            cx="8.2"
            cy="9.1"
            r="3.15"
            stroke="currentColor"
            strokeWidth="1.55"
          />
          <circle
            cx="13.4"
            cy="8.4"
            r="2.35"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M7.1 16.1h9.8M9.2 16.1 12 11.4 14.8 16.1"
            stroke="currentColor"
            strokeWidth="1.55"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
}
