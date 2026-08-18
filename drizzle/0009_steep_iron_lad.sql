CREATE TABLE `aiBodyModels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bodyProfileId` int NOT NULL,
	`profileHash` varchar(128) NOT NULL,
	`imageUrl` text,
	`status` enum('preparing','ready','failed') NOT NULL DEFAULT 'preparing',
	`provider` varchar(80) NOT NULL DEFAULT 'manus_gpt_image_2',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aiBodyModels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bodyProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`visitorId` varchar(96) NOT NULL,
	`heightCm` int NOT NULL,
	`weightKg` int NOT NULL,
	`bustCm` int,
	`waistCm` int,
	`hipCm` int,
	`genderPresentation` enum('female','masculine','androgynous','custom') NOT NULL DEFAULT 'female',
	`bodyShape` enum('slim','straight','curvy','petite','tall','plus','custom') NOT NULL DEFAULT 'custom',
	`profileHash` varchar(128) NOT NULL,
	`version` int NOT NULL DEFAULT 1,
	`consentedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bodyProfiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `generationFeedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`generationRequestId` varchar(96) NOT NULL,
	`visitorId` varchar(96) NOT NULL,
	`feedback` enum('love','okay','not_like_me','garment_inaccurate') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `generationFeedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `redeemCodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`codeHash` varchar(128) NOT NULL,
	`status` enum('ACTIVE','USED','EXPIRED','DISABLED') NOT NULL DEFAULT 'ACTIVE',
	`expiresAt` timestamp,
	`maxUses` int NOT NULL DEFAULT 1,
	`usedCount` int NOT NULL DEFAULT 0,
	`generationAllowance` int NOT NULL DEFAULT 5,
	`catalogTier` enum('basic','full') NOT NULL DEFAULT 'basic',
	`campaign` varchar(120),
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `redeemCodes_id` PRIMARY KEY(`id`),
	CONSTRAINT `redeemCodes_codeHash_unique` UNIQUE(`codeHash`)
);
--> statement-breakpoint
CREATE TABLE `releaseSettings` (
	`id` int NOT NULL,
	`releaseMode` enum('PRIVATE','BETA_PUBLIC','REDEEM_CODE') NOT NULL DEFAULT 'PRIVATE',
	`betaCatalogLimit` int NOT NULL DEFAULT 12,
	`betaDailyVisitorLimit` int NOT NULL DEFAULT 2,
	`globalDailyGenerationLimit` int NOT NULL DEFAULT 120,
	`monthlyGenerationLimit` int NOT NULL DEFAULT 2400,
	`generationEnabled` int NOT NULL DEFAULT 1,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `releaseSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `visitorEntitlements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`visitorId` varchar(96) NOT NULL,
	`redeemCodeId` int,
	`generationAllowance` int NOT NULL,
	`generationUsed` int NOT NULL DEFAULT 0,
	`catalogTier` enum('beta','basic','full') NOT NULL DEFAULT 'beta',
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `visitorEntitlements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `products` ADD `isFeatured` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `featuredPriority` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `catalogTier` enum('beta','basic','full') DEFAULT 'full' NOT NULL;--> statement-breakpoint
ALTER TABLE `aiBodyModels` ADD CONSTRAINT `aiBodyModels_bodyProfileId_bodyProfiles_id_fk` FOREIGN KEY (`bodyProfileId`) REFERENCES `bodyProfiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bodyProfiles` ADD CONSTRAINT `bodyProfiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `visitorEntitlements` ADD CONSTRAINT `visitorEntitlements_redeemCodeId_redeemCodes_id_fk` FOREIGN KEY (`redeemCodeId`) REFERENCES `redeemCodes`(`id`) ON DELETE no action ON UPDATE no action;