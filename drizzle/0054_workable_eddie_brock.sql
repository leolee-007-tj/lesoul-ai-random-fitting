CREATE TABLE `productEngagementEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`visitorId` varchar(96) NOT NULL,
	`eventType` enum('DETAIL_VIEW','PURCHASE_LIST_ADD') NOT NULL,
	`eventDay` varchar(10) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `productEngagementEvents_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_engagement_daily_unique` UNIQUE(`productId`,`visitorId`,`eventType`,`eventDay`)
);
--> statement-breakpoint
ALTER TABLE `productEngagementEvents` ADD CONSTRAINT `productEngagementEvents_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;