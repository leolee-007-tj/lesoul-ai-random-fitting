ALTER TABLE `savedLooks` MODIFY COLUMN `userId` int;--> statement-breakpoint
ALTER TABLE `savedLooks` ADD `visitorId` varchar(96) NULL;--> statement-breakpoint
UPDATE `savedLooks` AS `saved` INNER JOIN `users` AS `account` ON `saved`.`userId` = `account`.`id` SET `saved`.`visitorId` = CONCAT('account:', `account`.`openId`) WHERE `saved`.`visitorId` IS NULL;--> statement-breakpoint
UPDATE `savedLooks` SET `visitorId` = CONCAT('legacy_', `id`) WHERE `visitorId` IS NULL;--> statement-breakpoint
ALTER TABLE `savedLooks` MODIFY COLUMN `visitorId` varchar(96) NOT NULL;--> statement-breakpoint
ALTER TABLE `savedLooks` ADD CONSTRAINT `savedLooks_visitor_look_unique` UNIQUE(`visitorId`,`lookId`);
