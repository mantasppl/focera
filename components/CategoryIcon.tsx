import type { ToolCategory } from "@/data/tools";

type CategoryIconProps = {
  category: ToolCategory;
  className?: string;
};

export default function CategoryIcon({
  category,
  className = "category-card__svg",
}: CategoryIconProps) {
  const common = {
    className,
    width: 28,
    height: 28,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": true as const,
  };

  switch (category) {
    case "pdf":
      return (
        <svg {...common}>
          <path
            d="M7 3.75h6.2L17.5 8v12.25H7V3.75Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M13.1 3.75V8H17.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M9.2 13.2h5.6M9.2 16.2h3.8"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case "image":
      return (
        <svg {...common}>
          <rect
            x="3.75"
            y="5.25"
            width="16.5"
            height="13.5"
            rx="2.2"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <circle
            cx="9"
            cy="10.2"
            r="1.55"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M5.8 16.4 9.6 12.9l2.7 2.4 2.4-2.9 3.5 4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "video":
      return (
        <svg {...common}>
          <rect
            x="3.5"
            y="6"
            width="12.2"
            height="12"
            rx="2.2"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M15.7 10.2 20.2 7.6v8.8l-4.5-2.6v-3.6Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle cx="8.3" cy="12" r="1.2" fill="currentColor" />
        </svg>
      );
    case "ai":
      return (
        <svg {...common}>
          <path
            d="M12 3.4 13.35 8.1 18 9.45 13.35 10.8 12 15.5 10.65 10.8 6 9.45l4.65-1.35L12 3.4Z"
            stroke="currentColor"
            strokeWidth="1.55"
            strokeLinejoin="round"
          />
          <path
            d="M18.6 14.2 19.25 16.35 21.4 17 19.25 17.65 18.6 19.8 17.95 17.65 15.8 17l2.15-.65.65-2.15Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path
            d="M5.4 14.6 5.9 16.25 7.55 16.75 5.9 17.25 5.4 18.9 4.9 17.25 3.25 16.75 4.9 16.25 5.4 14.6Z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "file":
      return (
        <svg {...common}>
          <path
            d="M4.5 8.2 12 4.6l7.5 3.6v7.6L12 19.4 4.5 15.8V8.2Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M4.5 8.2 12 11.8l7.5-3.6M12 11.8V19.4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
}
