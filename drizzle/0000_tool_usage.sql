CREATE TABLE IF NOT EXISTS `tool_usage` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` text NOT NULL,
	`event_type` text DEFAULT 'tool_usage' NOT NULL,
	`tool_id` text NOT NULL,
	`tool_name` text NOT NULL,
	`timestamp` integer NOT NULL,
	`session_id` text NOT NULL,
	`user_id` text,
	`ip_hash` text,
	`country` text,
	`browser` text,
	`os` text,
	`device` text,
	`referrer` text,
	`success` integer DEFAULT true NOT NULL,
	`metadata` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `tool_usage_event_id_unique` ON `tool_usage` (`event_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `tool_usage_tool_id_idx` ON `tool_usage` (`tool_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `tool_usage_timestamp_idx` ON `tool_usage` (`timestamp`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `tool_usage_session_id_idx` ON `tool_usage` (`session_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `tool_usage_event_type_idx` ON `tool_usage` (`event_type`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `tool_usage_tool_time_idx` ON `tool_usage` (`tool_id`,`timestamp`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `tool_usage_success_time_idx` ON `tool_usage` (`success`,`timestamp`);
