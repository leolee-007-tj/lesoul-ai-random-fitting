CREATE TABLE `backgrounds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`promptKeyword` varchar(300) NOT NULL,
	`styleTags` varchar(250) NOT NULL,
	`imageUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `backgrounds_id` PRIMARY KEY(`id`),
	CONSTRAINT `backgrounds_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `generations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`userPhotoUrl` text NOT NULL,
	`poseId` int NOT NULL,
	`topProductId` int,
	`bottomProductId` int,
	`outerProductId` int,
	`dressProductId` int,
	`backgroundId` int NOT NULL,
	`lookCode` varchar(32) NOT NULL,
	`resultImageUrl` text,
	`status` enum('created','generating','complete','failed') NOT NULL DEFAULT 'created',
	`isSaved` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `generations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `poses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(80) NOT NULL,
	`promptKeyword` varchar(240) NOT NULL,
	`imageUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `poses_id` PRIMARY KEY(`id`),
	CONSTRAINT `poses_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`category` enum('top','bottom','outer','dress') NOT NULL,
	`season` varchar(120) NOT NULL,
	`color` varchar(80) NOT NULL,
	`style` varchar(200) NOT NULL,
	`status` enum('in_stock','sold_out') NOT NULL DEFAULT 'in_stock',
	`price` int NOT NULL,
	`imageUrl` text NOT NULL,
	`description` text NOT NULL,
	`purchaseUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
ALTER TABLE `generations` ADD CONSTRAINT `generations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `generations` ADD CONSTRAINT `generations_poseId_poses_id_fk` FOREIGN KEY (`poseId`) REFERENCES `poses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `generations` ADD CONSTRAINT `generations_topProductId_products_id_fk` FOREIGN KEY (`topProductId`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `generations` ADD CONSTRAINT `generations_bottomProductId_products_id_fk` FOREIGN KEY (`bottomProductId`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `generations` ADD CONSTRAINT `generations_outerProductId_products_id_fk` FOREIGN KEY (`outerProductId`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `generations` ADD CONSTRAINT `generations_dressProductId_products_id_fk` FOREIGN KEY (`dressProductId`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `generations` ADD CONSTRAINT `generations_backgroundId_backgrounds_id_fk` FOREIGN KEY (`backgroundId`) REFERENCES `backgrounds`(`id`) ON DELETE no action ON UPDATE no action;