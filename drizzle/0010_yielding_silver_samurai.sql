ALTER TABLE `generationLogs` ADD `visitorId` varchar(96) DEFAULT 'legacy' NOT NULL;--> statement-breakpoint
ALTER TABLE `generationLogs` ADD `releaseMode` enum('PRIVATE','BETA_PUBLIC','REDEEM_CODE') DEFAULT 'PRIVATE' NOT NULL;--> statement-breakpoint
ALTER TABLE `generationLogs` ADD `source` enum('wechat_moments','direct','admin_test') DEFAULT 'direct' NOT NULL;--> statement-breakpoint
ALTER TABLE `generationLogs` ADD `tryOnMode` enum('my_photo','ai_body_model') DEFAULT 'my_photo' NOT NULL;--> statement-breakpoint
ALTER TABLE `generationLogs` ADD `bodyModelId` int;