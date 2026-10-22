ALTER TABLE `redeemCodes` ADD `isUnlimited` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `releaseSettings` ADD `betaFreeGenerationAllowance` int DEFAULT 3 NOT NULL;--> statement-breakpoint
ALTER TABLE `redeemCodes` ADD `isUnlimited` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `visitorEntitlements` ADD `isUnlimited` int DEFAULT 0 NOT NULL;
