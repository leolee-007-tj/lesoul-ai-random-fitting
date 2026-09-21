ALTER TABLE `releaseSettings` ADD `showInventoryQuantity` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `trialStores` ADD `pricingMode` enum('BASE','SEASON_FORMAT_1','SEASON_FORMAT_2','SEASON_FORMAT_3') DEFAULT 'BASE' NOT NULL;--> statement-breakpoint
ALTER TABLE `trialStores` ADD `excludeNewArrivalsFromSale` int DEFAULT 0 NOT NULL;