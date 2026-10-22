ALTER TABLE `products` ADD `productType` enum('SINGLE','SET') DEFAULT 'SINGLE' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `setComponents` json;