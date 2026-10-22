CREATE TABLE `aiUsageEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`visitorId` varchar(96) NOT NULL,
	`userId` int,
	`entitlementId` int,
	`generationId` varchar(96),
	`featureType` enum('AI_BODY_MODEL','AI_FITTING','QUICK_FIT','REGENERATION','AI_STYLIST') NOT NULL,
	`requestType` enum('IMAGE_GENERATION','RULE_ENGINE') NOT NULL,
	`provider` varchar(80) NOT NULL,
	`model` varchar(120),
	`status` enum('REQUESTED','SUCCESS','FAILED','CANCELLED','BLOCKED_BY_LIMIT','BLOCKED_BY_BUDGET','PAUSED') NOT NULL DEFAULT 'REQUESTED',
	`estimatedCostFen` int NOT NULL DEFAULT 0,
	`providerUsageMetadata` json,
	`durationMs` int,
	`errorMessage` text,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aiUsageEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `releaseSettings` ADD `normalAiGenerationLimit` int DEFAULT 3 NOT NULL;--> statement-breakpoint
ALTER TABLE `releaseSettings` ADD `dailyAiRequestLimit` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `releaseSettings` ADD `monthlyAiBudgetFen` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `releaseSettings` ADD `stopAiAtBudgetLimit` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `releaseSettings` ADD `monthlyActualAiCostFen` int;--> statement-breakpoint
ALTER TABLE `releaseSettings` ADD `aiBodyModelEstimatedCostFen` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `releaseSettings` ADD `aiFittingEstimatedCostFen` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `releaseSettings` ADD `quickFitEstimatedCostFen` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `releaseSettings` ADD `regenerationEstimatedCostFen` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `aiUsageEvents` ADD CONSTRAINT `aiUsageEvents_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `aiUsageEvents` ADD CONSTRAINT `aiUsageEvents_entitlementId_visitorEntitlements_id_fk` FOREIGN KEY (`entitlementId`) REFERENCES `visitorEntitlements`(`id`) ON DELETE no action ON UPDATE no action;