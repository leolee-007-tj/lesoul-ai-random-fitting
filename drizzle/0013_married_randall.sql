ALTER TABLE `products` ADD `purchaseQrUpdatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `releaseSettings` ADD `purchaseQrEnabled` int DEFAULT 1 NOT NULL;
ALTER TABLE `products` ADD `purchaseQrUpdatedAt` timestamp NULL;
