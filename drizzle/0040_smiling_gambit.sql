CREATE TABLE `trialStoreProducts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`brand` varchar(120),
	`category` enum('top','bottom','outer','dress','shoes','bag') NOT NULL DEFAULT 'top',
	`price` int NOT NULL,
	`status` enum('IN_STOCK','SOLD_OUT') NOT NULL DEFAULT 'IN_STOCK',
	`imageUrls` json NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trialStoreProducts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trialStores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerUserId` int NOT NULL,
	`status` enum('ACTIVE','EXPIRED') NOT NULL DEFAULT 'ACTIVE',
	`storeName` varchar(80) NOT NULL DEFAULT 'MY TRIAL STORE',
	`paymentQrUrl` text,
	`purchaseNotice` text,
	`startedAt` timestamp NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`resetAt` timestamp,
	`scheduleCronTaskUid` varchar(65),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trialStores_id` PRIMARY KEY(`id`),
	CONSTRAINT `trialStores_ownerUserId_unique` UNIQUE(`ownerUserId`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','vip','admin','store_trial') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `trialStoreProducts` ADD CONSTRAINT `trialStoreProducts_storeId_trialStores_id_fk` FOREIGN KEY (`storeId`) REFERENCES `trialStores`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trialStores` ADD CONSTRAINT `trialStores_ownerUserId_users_id_fk` FOREIGN KEY (`ownerUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;