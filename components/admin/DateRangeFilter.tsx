"use client";

import type { DatePreset } from "@/lib/analytics/types";

const PRESETS: Array<{ value: DatePreset; label: string }> = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "last_30_days", label: "Last 30 Days" },
  { value: "last_90_days", label: "Last 90 Days" },
  { value: "this_year", label: "This Year" },
  { value: "custom", label: "Custom" },
];

type DateRangeFilterProps = {
  preset: DatePreset;
  start: string;
  end: string;
  onPresetChange: (preset: DatePreset) => void;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
};

export default function DateRangeFilter({
  preset,
  start,
  end,
  onPresetChange,
  onStartChange,
  onEndChange,
}: DateRangeFilterProps) {
  return (
    <div className="admin-filters">
      <label className="admin-field">
        <span>Date range</span>
        <select
          className="ui-field"
          value={preset}
          onChange={(event) => onPresetChange(event.target.value as DatePreset)}
        >
          {PRESETS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      {preset === "custom" ? (
        <>
          <label className="admin-field">
            <span>Start</span>
            <input
              type="date"
              className="ui-field"
              value={start}
              onChange={(event) => onStartChange(event.target.value)}
            />
          </label>
          <label className="admin-field">
            <span>End</span>
            <input
              type="date"
              className="ui-field"
              value={end}
              onChange={(event) => onEndChange(event.target.value)}
            />
          </label>
        </>
      ) : null}
    </div>
  );
}
