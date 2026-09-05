import type { NicheIconKind } from "@/data/category-niches";

type NicheIconProps = {
  kind: NicheIconKind;
  className?: string;
};

export default function NicheIcon({
  kind,
  className = "image-niche__svg",
}: NicheIconProps) {
  const common = {
    className,
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": true as const,
  };

  switch (kind) {
    case "edit":
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
    case "format":
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
    case "adjust":
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
    case "protect":
      return (
        <svg {...common}>
          <rect
            x="5.2"
            y="10.2"
            width="13.6"
            height="9.1"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M8.2 10.2V8.1a3.8 3.8 0 0 1 7.6 0v2.1"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M12 13.6v2.6"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      );
    case "audio":
      return (
        <svg {...common}>
          <path
            d="M8.2 9.2v5.6M11.1 6.8v10.4M14 8.4v7.2M16.8 10.2v3.6"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      );
    case "download":
      return (
        <svg {...common}>
          <rect
            x="3.6"
            y="6"
            width="11.4"
            height="10.4"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M14.8 10.1 19.2 7.6v8.6l-4.4-2.5v-3.6Z"
            stroke="currentColor"
            strokeWidth="1.55"
            strokeLinejoin="round"
          />
          <path
            d="M7.2 12.4v3.1M5.8 14.2h2.8"
            stroke="currentColor"
            strokeWidth="1.55"
            strokeLinecap="round"
          />
        </svg>
      );
    case "write":
      return (
        <svg {...common}>
          <path
            d="M5.2 18.4h13.6"
            stroke="currentColor"
            strokeWidth="1.55"
            strokeLinecap="round"
          />
          <path
            d="M14.8 5.6 18.2 9 10.1 17.1H6.7v-3.4L14.8 5.6Z"
            stroke="currentColor"
            strokeWidth="1.55"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "speech":
      return (
        <svg {...common}>
          <rect
            x="8.1"
            y="4.8"
            width="7.8"
            height="11"
            rx="3.9"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M6.4 11.4a5.6 5.6 0 0 0 11.2 0M12 16.4v2.6"
            stroke="currentColor"
            strokeWidth="1.55"
            strokeLinecap="round"
          />
        </svg>
      );
    case "generate":
      return (
        <svg {...common}>
          <path
            d="M12 3.6 13.3 8.2 18 9.5 13.3 10.8 12 15.4 10.7 10.8 6 9.5l4.7-1.3L12 3.6Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M18.4 14.4 19 16.4 21 17l-2 .6-.6 2-.6-2-2-.6 2-.6.6-2Z"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "code":
      return (
        <svg {...common}>
          <path
            d="M8.4 8.2 4.8 12l3.6 3.8M15.6 8.2 19.2 12l-3.6 3.8M13.1 6.8 10.9 17.2"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
}
