ALTER TABLE `users` ADD `presenceCameraEnabled` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `presenceCameraLastSeenAt` timestamp;