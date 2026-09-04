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

export type FeatureKind = "upload" | "download" | "dwell";

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
  /** Sessions that downloaded after uploading. Null when no uploads yet. */
  conversionRate: number | null;
  uploads: number;
  downloads: number;
  /** Average visible seconds on a tool. Null when no dwell events yet. */
  avgTimeOnToolSeconds: number | null;
  /** Visitors in this range who also visited before it. */
  repeatUsers: number;
  repeatRate: number;
};

/** Visitors with a heartbeat newer than this are counted as online. */
export const ONLINE_WINDOW_MS = 5 * 60 * 1000;

export type TrafficPeriodStats = {
  views: number;
  unique: number;
};

export type SiteTrafficStats = {
  onlineNow: number;
  onlineWindowSeconds: number;
  today: TrafficPeriodStats;
  week: TrafficPeriodStats;
  month: TrafficPeriodStats;
  allTime: TrafficPeriodStats;
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
  conversionRate: number | null;
  uploads: number;
  downloads: number;
  avgTimeOnToolSeconds: number | null;
  repeatUsers: number;
  repeatRate: number;
  daily: TimeBucket[];
  weekly: TimeBucket[];
  monthly: TimeBucket[];
  countries: NamedCount[];
  devices: NamedCount[];
  browsers: NamedCount[];
  sources: NamedCount[];
  keywords: NamedCount[];
};
