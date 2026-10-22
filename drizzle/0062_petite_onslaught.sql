CREATE TABLE `careLabelProductSymbols` (
	`productId` varchar(16) NOT NULL,
	`symbolId` int NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 1,
	CONSTRAINT `careLabelProductSymbols_product_symbol_idx` UNIQUE(`productId`,`symbolId`)
);
--> statement-breakpoint
CREATE TABLE `careLabelProducts` (
	`id` varchar(16) NOT NULL,
	`data` json NOT NULL,
	`revision` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `careLabelProducts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `careLabelSettings` (
	`id` int NOT NULL,
	`wechatQrUrl` text,
	`revision` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `careLabelSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `careLabelSymbols` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(64) NOT NULL,
	`nameZh` varchar(160) NOT NULL,
	`descriptionZh` text NOT NULL,
	`imageUrl` text,
	`sortOrder` int NOT NULL DEFAULT 100,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `careLabelSymbols_id` PRIMARY KEY(`id`),
	CONSTRAINT `careLabelSymbols_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
ALTER TABLE `careLabelProductSymbols` ADD CONSTRAINT `careLabelProductSymbols_productId_careLabelProducts_id_fk` FOREIGN KEY (`productId`) REFERENCES `careLabelProducts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `careLabelProductSymbols` ADD CONSTRAINT `careLabelProductSymbols_symbolId_careLabelSymbols_id_fk` FOREIGN KEY (`symbolId`) REFERENCES `careLabelSymbols`(`id`) ON DELETE no action ON UPDATE no action;