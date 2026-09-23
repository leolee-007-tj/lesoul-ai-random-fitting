CREATE TABLE `displayLookbookImages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`batchId` varchar(96) NOT NULL,
	`shotIndex` int NOT NULL,
	`sceneType` enum('studio_front','studio_side','studio_full','store_work','store_customer','store_walk') NOT NULL,
	`sceneDescription` varchar(300) NOT NULL,
	`imageUrl` text NOT NULL,
	`storageKey` text NOT NULL,
	`isApproved` int NOT NULL DEFAULT 0,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `displayLookbookImages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `displayLookbookImages` ADD CONSTRAINT `displayLookbookImages_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;