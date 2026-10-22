ALTER TABLE `products` ADD `priceOriginal` int;--> statement-breakpoint
ALTER TABLE `products` ADD `discountRate` int;--> statement-breakpoint
ALTER TABLE `products` ADD `priceSale` int;--> statement-breakpoint
ALTER TABLE `products` ADD `saleEnabled` int DEFAULT 0 NOT NULL;--> statement-breakpoint
UPDATE `products` SET `priceOriginal` = `price`, `discountRate` = NULL, `priceSale` = NULL, `saleEnabled` = 0 WHERE `priceOriginal` IS NULL;
