ALTER TABLE `products` ADD `isActive` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `availabilityStatus` enum('AVAILABLE','SOLD_OUT','PREORDER') DEFAULT 'AVAILABLE' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `isNew` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `newArrivalAt` timestamp;--> statement-breakpoint
ALTER TABLE `releaseSettings` ADD `stylistIncludePreorder` int DEFAULT 0 NOT NULL;
--> statement-breakpoint
UPDATE `products` SET `availabilityStatus` = CASE WHEN `status` = 'sold_out' THEN 'SOLD_OUT' ELSE 'AVAILABLE' END;
