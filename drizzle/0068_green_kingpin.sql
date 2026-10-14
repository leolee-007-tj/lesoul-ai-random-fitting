ALTER TABLE `displayLookbookImages` ADD `lookbookTitleKo` varchar(200);--> statement-breakpoint
ALTER TABLE `displayLookbookImages` ADD `lookbookTitleZh` varchar(200);--> statement-breakpoint
ALTER TABLE `displayLookbookImages` ADD `lookbookTitleEn` varchar(200);--> statement-breakpoint
ALTER TABLE `displayLookbookImages` ADD `recommendationReasonKo` varchar(500);--> statement-breakpoint
ALTER TABLE `displayLookbookImages` ADD `recommendationReasonZh` varchar(500);--> statement-breakpoint
ALTER TABLE `displayLookbookImages` ADD `recommendationReasonEn` varchar(500);--> statement-breakpoint
ALTER TABLE `releaseSettings` ADD `lookbookGridColumns` int DEFAULT 2 NOT NULL;