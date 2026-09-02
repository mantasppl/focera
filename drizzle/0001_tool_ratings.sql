CREATE TABLE IF NOT EXISTS `tool_ratings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tool_id` text NOT NULL,
	`tool_name` text NOT NULL,
	`stars` integer NOT NULL,
	`comment` text,
	`created_at` integer NOT NULL,
	`session_id` text,
	`ip_hash` text
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `tool_ratings_tool_id_idx` ON `tool_ratings` (`tool_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `tool_ratings_created_at_idx` ON `tool_ratings` (`created_at`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `tool_ratings_tool_time_idx` ON `tool_ratings` (`tool_id`,`created_at`);
