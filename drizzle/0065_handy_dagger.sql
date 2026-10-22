ALTER TABLE `displayLookbookImages` ADD `lookbookTitle` varchar(200);--> statement-breakpoint
ALTER TABLE `displayLookbookImages` ADD `recommendationName` varchar(200);--> statement-breakpoint
ALTER TABLE `products` ADD `lookbookPrompt` text;