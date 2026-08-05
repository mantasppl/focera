export type DeviceType = "Desktop" | "Mobile" | "Tablet" | "Unknown";

export type AnalyticsEventType =
  | "tool_usage"
  | "api_usage"
  | "ai_token"
  | "revenue"
  | "conversion"
  | "feature";

export type DatePreset =
  | "today"
  | "yesterday"
  | "last_7_days"
  | "last_30_days"
  | "last_90_days"
  | "this_year"
  | "custom";

export type TrackToolUsagePayload = {
  toolId: string;
  success: boolean;
  /** Client UUID — required for deduplication. */
  eventId: string;
  sessionId: string;
  referrer?: string;
  eventType?: AnalyticsEventType;
  metadata?: Record<string, string | number | boolean | null>;
};

export type OverviewStats = {
  totalUses: number;
  usesToday: number;
  usesThisWeek: number;
  usesThisMonth: number;
  uniqueVisitors: number;
  averageDailyUses: number;
  successRate: number;
};

export type ToolStatsRow = {
  toolId: string;
  toolName: string;
  today: number;
  last7Days: number;
  last30Days: number;
  total: number;
};

export type TimeBucket = {
  label: string;
  count: number;
};

export type NamedCount = {
  name: string;
  count: number;
};

export type ToolDetailStats = {
  toolId: string;
  toolName: string;
  total: number;
  successRate: number;
  daily: TimeBucket[];
  weekly: TimeBucket[];
  monthly: TimeBucket[];
  countries: NamedCount[];
  devices: NamedCount[];
  browsers: NamedCount[];
};
