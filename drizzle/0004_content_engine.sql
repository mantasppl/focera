CREATE TABLE IF NOT EXISTS `tools` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`icon` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `tools_slug_unique` ON `tools` (`slug`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`excerpt` text DEFAULT '' NOT NULL,
	`cover_image` text,
	`content_json` text DEFAULT '[]' NOT NULL,
	`seo_title` text DEFAULT '' NOT NULL,
	`meta_description` text DEFAULT '' NOT NULL,
	`og_title` text DEFAULT '' NOT NULL,
	`og_description` text DEFAULT '' NOT NULL,
	`og_image` text DEFAULT '' NOT NULL,
	`canonical_url` text DEFAULT '' NOT NULL,
	`robots` text DEFAULT 'index,follow' NOT NULL,
	`schema_type` text DEFAULT 'article' NOT NULL,
	`schema_json` text,
	`primary_tool_id` text,
	`related_tools_json` text DEFAULT '[]' NOT NULL,
	`cta_config_json` text DEFAULT '{"positions":["top","bottom"],"labels":{}}' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`published_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`primary_tool_id`) REFERENCES `tools`(`id`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `posts_slug_unique` ON `posts` (`slug`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `posts_status_idx` ON `posts` (`status`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `posts_published_at_idx` ON `posts` (`published_at`);
