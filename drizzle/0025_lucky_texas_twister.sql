CREATE TABLE `aiAccessBlocks` (
	`visitorId` varchar(96) NOT NULL,
	`userId` int,
	`reason` varchar(240),
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aiAccessBlocks_visitorId` PRIMARY KEY(`visitorId`)
);
--> statement-breakpoint
ALTER TABLE `aiAccessBlocks` ADD CONSTRAINT `aiAccessBlocks_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;