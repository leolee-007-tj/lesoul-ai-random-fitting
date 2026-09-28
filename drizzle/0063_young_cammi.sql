CREATE TABLE `careLabelPrivatePrices` (
	`id` varchar(16) NOT NULL,
	`amount` varchar(32) NOT NULL DEFAULT '',
	`currency` enum('CNY','KRW') NOT NULL DEFAULT 'CNY',
	`revision` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `careLabelPrivatePrices_id` PRIMARY KEY(`id`)
);
