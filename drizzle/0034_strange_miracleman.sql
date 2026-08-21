CREATE TABLE `productShareVisits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`visitorId` varchar(96) NOT NULL,
	`source` enum('WECHAT_SHARE') NOT NULL DEFAULT 'WECHAT_SHARE',
	`visitDay` varchar(10) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `productShareVisits_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_share_visit_daily_unique` UNIQUE(`productId`,`visitorId`,`source`,`visitDay`)
);
--> statement-breakpoint
ALTER TABLE `productShareVisits` ADD CONSTRAINT `productShareVisits_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;