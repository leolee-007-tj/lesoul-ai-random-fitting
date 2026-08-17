CREATE TABLE `stylePresets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(64) NOT NULL,
	`name` varchar(80) NOT NULL,
	`description` varchar(240) NOT NULL,
	`matchingTags` json NOT NULL,
	`weights` json NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stylePresets_id` PRIMARY KEY(`id`),
	CONSTRAINT `stylePresets_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `stylistFeedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`visitorId` varchar(96) NOT NULL,
	`stylePresetKey` varchar(64) NOT NULL,
	`anchorProductId` int,
	`productIds` json NOT NULL,
	`score` int NOT NULL,
	`feedback` enum('good','bad') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stylistFeedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `products` ADD `stylistMetadata` json;--> statement-breakpoint
ALTER TABLE `stylistFeedback` ADD CONSTRAINT `stylistFeedback_anchorProductId_products_id_fk` FOREIGN KEY (`anchorProductId`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;