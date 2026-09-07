CREATE TABLE IF NOT EXISTS `tool_comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tool_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`content` text NOT NULL,
	`rating` integer,
	`likes_count` integer DEFAULT 0 NOT NULL,
	`parent_id` integer,
	`created_at` integer NOT NULL,
	`ip_hash` text,
	`is_seed` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `tool_comments_tool_id_idx` ON `tool_comments` (`tool_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `tool_comments_created_at_idx` ON `tool_comments` (`created_at`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `tool_comments_tool_time_idx` ON `tool_comments` (`tool_id`,`created_at`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `tool_comments_parent_id_idx` ON `tool_comments` (`parent_id`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `tool_comment_likes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`comment_id` integer NOT NULL,
	`identifier` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `tool_comment_likes_comment_id_idx` ON `tool_comment_likes` (`comment_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `tool_comment_likes_identifier_idx` ON `tool_comment_likes` (`identifier`);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `tool_comment_likes_unique_idx` ON `tool_comment_likes` (`comment_id`,`identifier`);
