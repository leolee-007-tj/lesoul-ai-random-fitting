ALTER TABLE `products` MODIFY COLUMN `availabilityStatus` enum('AVAILABLE','PREORDER','IN_STOCK','PRE_ORDER','SOLD_OUT') NOT NULL DEFAULT 'IN_STOCK';--> statement-breakpoint
UPDATE `products` SET `availabilityStatus` = 'IN_STOCK' WHERE `availabilityStatus` = 'AVAILABLE';--> statement-breakpoint
UPDATE `products` SET `availabilityStatus` = 'PRE_ORDER' WHERE `availabilityStatus` = 'PREORDER';--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `availabilityStatus` enum('IN_STOCK','PRE_ORDER','SOLD_OUT') NOT NULL DEFAULT 'IN_STOCK';
