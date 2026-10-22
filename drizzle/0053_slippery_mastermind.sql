CREATE TABLE `siteVisitSummaries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`visitorId` varchar(96) NOT NULL,
	`visitDay` varchar(10) NOT NULL,
	`deviceType` enum('phone','tablet','desktop','unknown') NOT NULL DEFAULT 'unknown',
	`operatingSystem` varchar(32) NOT NULL DEFAULT 'unknown',
	`browser` varchar(32) NOT NULL DEFAULT 'unknown',
	`screenClass` varchar(32) NOT NULL DEFAULT 'unknown',
	`locale` varchar(8) NOT NULL DEFAULT 'en',
	`entryPath` varchar(160) NOT NULL DEFAULT '/',
	`lastSeenAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `siteVisitSummaries_id` PRIMARY KEY(`id`),
	CONSTRAINT `site_visit_daily_unique` UNIQUE(`visitorId`,`visitDay`)
);
