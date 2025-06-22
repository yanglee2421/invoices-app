CREATE TABLE `invoice` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text,
	`amount` text,
	`date` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invoice_code_unique` ON `invoice` (`code`);--> statement-breakpoint
CREATE TABLE `staff` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`alias` text,
	`enableAlias` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `staff_alias_unique` ON `staff` (`alias`);