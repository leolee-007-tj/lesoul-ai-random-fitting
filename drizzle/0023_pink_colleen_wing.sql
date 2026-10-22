CREATE TABLE `productCategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nameEn` varchar(120) NOT NULL,
	`nameKo` varchar(120) NOT NULL,
	`nameZh` varchar(120) NOT NULL,
	`baseCategory` enum('TOP','PANTS','JACKET','DRESS','SHOES','BAG') NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`sortOrder` int NOT NULL DEFAULT 100,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `productCategories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `products` ADD `displayCategoryId` int;