ALTER TABLE `savedLooks` RENAME COLUMN `localLookId` TO `lookId`;--> statement-breakpoint
ALTER TABLE `aiBodyModels` ADD `modelKey` varchar(48) NOT NULL;--> statement-breakpoint
ALTER TABLE `aiBodyModels` ADD `version` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `aiBodyModels` ADD `approved` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `bodyProfiles` ADD `modelKey` varchar(48) NOT NULL;--> statement-breakpoint
ALTER TABLE `bodyProfiles` ADD `hairLength` enum('short','medium','long') DEFAULT 'medium' NOT NULL;--> statement-breakpoint
ALTER TABLE `bodyProfiles` ADD `hairStyle` enum('straight','natural_wave','bob') DEFAULT 'straight' NOT NULL;--> statement-breakpoint
ALTER TABLE `bodyProfiles` ADD `hairColor` enum('black','dark_brown','brown','light_brown') DEFAULT 'dark_brown' NOT NULL;--> statement-breakpoint
ALTER TABLE `bodyProfiles` ADD `skinTone` enum('light','light_medium','medium','medium_deep','deep') DEFAULT 'light_medium' NOT NULL;--> statement-breakpoint
ALTER TABLE `bodyProfiles` ADD `approvalStatus` enum('preview','approved','superseded') DEFAULT 'preview' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `garmentMeasurements` json;--> statement-breakpoint
ALTER TABLE `products` ADD `sizeOptions` json;--> statement-breakpoint
ALTER TABLE `products` ADD `stretchLevel` enum('none','low','medium','high') DEFAULT 'low' NOT NULL;--> statement-breakpoint
ALTER TABLE `savedLooks` ADD `lookCode` varchar(48) NOT NULL;--> statement-breakpoint
ALTER TABLE `savedLooks` ADD `imageUrl` text NOT NULL;--> statement-breakpoint
ALTER TABLE `savedLooks` DROP COLUMN `updatedAt`;