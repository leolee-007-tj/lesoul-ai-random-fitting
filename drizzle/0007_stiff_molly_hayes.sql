ALTER TABLE `products` ADD `nameEn` varchar(160);--> statement-breakpoint
ALTER TABLE `products` ADD `nameKo` varchar(160);--> statement-breakpoint
ALTER TABLE `products` ADD `nameZh` varchar(160);--> statement-breakpoint
ALTER TABLE `products` ADD `descriptionEn` text;--> statement-breakpoint
ALTER TABLE `products` ADD `descriptionKo` text;--> statement-breakpoint
ALTER TABLE `products` ADD `descriptionZh` text;--> statement-breakpoint
ALTER TABLE `products` ADD `discountSeasonEnabled` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `discountOnePercent` int DEFAULT 20 NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `discountTwoPercent` int DEFAULT 25 NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `discountThreePercent` int DEFAULT 30 NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `discountFourPlusPercent` int DEFAULT 35 NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `momentCouponEnabled` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `momentCouponCode` varchar(64);--> statement-breakpoint
ALTER TABLE `products` ADD `momentCouponPercent` int DEFAULT 0 NOT NULL;