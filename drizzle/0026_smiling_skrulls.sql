ALTER TABLE `aiUsageEvents` MODIFY COLUMN `featureType` enum('AI_BODY_MODEL','AI_FITTING','LIYING_AI','QUICK_FIT','REGENERATION','AI_STYLIST') NOT NULL;--> statement-breakpoint
ALTER TABLE `releaseSettings` ADD `quickAiAdminOnly` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `releaseSettings` ADD `liyingAiVipEnabled` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `releaseSettings` ADD `normalStyleMatchEnabled` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `releaseSettings` ADD `normalStyleMatchLimit` int DEFAULT 3 NOT NULL;