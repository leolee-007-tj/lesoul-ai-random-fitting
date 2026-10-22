CREATE TABLE `curatedOutfitItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`outfitId` int NOT NULL,
	`productId` int NOT NULL,
	`isAnchor` int NOT NULL DEFAULT 1,
	`sortOrder` int NOT NULL DEFAULT 100,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `curatedOutfitItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `curatedOutfits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nameEn` varchar(160) NOT NULL,
	`nameKo` varchar(160) NOT NULL,
	`nameZh` varchar(160) NOT NULL,
	`reasonEn` text,
	`reasonKo` text,
	`reasonZh` text,
	`stylePresetKey` varchar(64) NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`sortOrder` int NOT NULL DEFAULT 100,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `curatedOutfits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `releaseSettings` ADD `curatedOutfitsPriority` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `curatedOutfitItems` ADD CONSTRAINT `curatedOutfitItems_outfitId_curatedOutfits_id_fk` FOREIGN KEY (`outfitId`) REFERENCES `curatedOutfits`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `curatedOutfitItems` ADD CONSTRAINT `curatedOutfitItems_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;